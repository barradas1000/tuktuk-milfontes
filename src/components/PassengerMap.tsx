import React, { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "../lib/supabase";
import { UserLocationMarker } from "./UserLocationMarker";
import { LocationPermissionButton } from "./LocationPermissionButton";
import { DistanceCalculator } from "./DistanceCalculator";
import { LocationDebug } from "./LocationDebug";
import { Coordinates } from "../utils/locationUtils";

// Corrigir ícones do Leaflet
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import tukTukIconUrl from "../assets/tuktuk-icon.png"; // Adicione um ícone de TukTuk na pasta assets

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const TukTukIcon = L.icon({
  iconUrl: tukTukIconUrl,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

interface ConductorLocation {
  id: string;
  lat: number;
  lng: number;
  isActive: boolean;
  name: string;
}

// Componente para controlar o mapa
const MapController: React.FC<{
  userPosition: Coordinates | null;
  conductorLocation: ConductorLocation | null;
  userInteracted: boolean;
}> = ({ userPosition, conductorLocation, userInteracted }) => {
  const map = useMap();

  useEffect(() => {
    if (userPosition && conductorLocation?.isActive && !userInteracted) {
      // Calcular zoom ideal para mostrar ambos os pontos
      const bounds = L.latLngBounds([
        [userPosition.lat, userPosition.lng],
        [conductorLocation.lat, conductorLocation.lng],
      ]);
      map.fitBounds(bounds, { padding: [20, 20] });
    } else if (userPosition && !userInteracted) {
      // Se só temos posição do usuário, centralizar nele
      map.setView([userPosition.lat, userPosition.lng], 15);
    } else if (conductorLocation?.isActive && !userInteracted) {
      // Se só temos posição do condutor, centralizar nele
      map.setView([conductorLocation.lat, conductorLocation.lng], 14);
    }
  }, [userPosition, conductorLocation, map, userInteracted]);

  return null;
};

const DISTANCIA_ALERTA_METROS = 50; // Distância para exibir o alerta
const VELOCIDADE_MEDIA_KMH = 20; // Velocidade média do TukTuk em km/h

const PassengerMap: React.FC = () => {
  const [activeConductors, setActiveConductors] = useState<ConductorLocation[]>(
    []
  );
  const [userPosition, setUserPosition] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const [alertaProximidade, setAlertaProximidade] = useState(false);
  const [tempoEstimado, setTempoEstimado] = useState<number | null>(null);

  // Função para calcular distância (haversine)
  function calcularDistanciaMetros(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) {
    function toRad(x: number) {
      return (x * Math.PI) / 180;
    }
    const R = 6371000; // raio da Terra em metros
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  useEffect(() => {
    // Carregar todos os condutores ativos
    const fetchActiveConductors = async () => {
      try {
        if (
          !import.meta.env.VITE_SUPABASE_URL ||
          !import.meta.env.VITE_SUPABASE_ANON_KEY
        ) {
          setActiveConductors([]);
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from("conductors")
          .select("*")
          .eq("is_active", true);
        if (error) {
          setActiveConductors([]);
        } else if (data) {
          setActiveConductors(
            data.map(
              (d: {
                id: string;
                latitude: number;
                longitude: number;
                is_active: boolean;
                name: string;
              }) => ({
                id: d.id,
                lat: d.latitude || 37.725,
                lng: d.longitude || -8.783,
                isActive: d.is_active,
                name: d.name || "TukTuk",
              })
            )
          );
        }
      } catch (error) {
        setActiveConductors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveConductors();

    // Subscrever a atualizações em tempo real
    if (
      import.meta.env.VITE_SUPABASE_URL &&
      import.meta.env.VITE_SUPABASE_ANON_KEY
    ) {
      const channel = supabase
        .channel("conductor_location")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "conductors" },
          (payload) => {
            const newData = payload.new as {
              id: string;
              latitude?: number;
              longitude?: number;
              is_active?: boolean;
              name?: string;
            };
            setActiveConductors((prev) => {
              // Remove o antigo se existir
              const filtered = prev.filter((d) => d.id !== newData.id);
              // Só adiciona se is_active for true
              if (newData.is_active) {
                return [
                  ...filtered,
                  {
                    id: newData.id,
                    lat: newData.latitude || 37.725,
                    lng: newData.longitude || -8.783,
                    isActive: true,
                    name: newData.name || "TukTuk",
                  },
                ];
              } else {
                // Se ficou inativo, só remove
                return filtered;
              }
            });
          }
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  useEffect(() => {
    if (userPosition && activeConductors[0]) {
      const dist = calcularDistanciaMetros(
        userPosition.lat,
        userPosition.lng,
        activeConductors[0].lat,
        activeConductors[0].lng
      );
      if (dist < DISTANCIA_ALERTA_METROS) {
        setAlertaProximidade(true);
        // Calcular tempo estimado (em minutos)
        const velocidadeMS = (VELOCIDADE_MEDIA_KMH * 1000) / 3600;
        const tempoSegundos = dist / velocidadeMS;
        setTempoEstimado(Math.round(tempoSegundos / 60));
      } else {
        setAlertaProximidade(false);
        setTempoEstimado(null);
      }
    } else {
      setAlertaProximidade(false);
      setTempoEstimado(null);
    }
  }, [userPosition, activeConductors]);

  // Detecta interação manual do usuário com o mapa
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const onUserInteraction = () => setUserInteracted(true);
    map.on("zoomstart", onUserInteraction);
    map.on("movestart", onUserInteraction);
    return () => {
      map.off("zoomstart", onUserInteraction);
      map.off("movestart", onUserInteraction);
    };
  }, [mapRef.current]);

  const handleLocationGranted = useCallback((position: GeolocationPosition) => {
    setUserPosition({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    });
    setShowUserLocation(true);
  }, []);

  const handleLocationDenied = useCallback(() => {
    setShowUserLocation(false);
    setUserPosition(null);
  }, []);

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
  }, []);

  // Função para centralizar o mapa novamente
  const handleRecenter = () => {
    setUserInteracted(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Carregando localização do TukTuk...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg">
        <MapContainer
          center={[37.725, -8.783]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          ref={handleMapReady}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Renderizar apenas o primeiro condutor ativo */}
          {activeConductors[0] && (
            <Marker
              position={[activeConductors[0].lat, activeConductors[0].lng]}
              icon={TukTukIcon}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold text-blue-600">
                    {activeConductors[0].name}
                  </h3>
                  <p className="text-sm text-gray-600">TukTuk disponível</p>
                  <p className="text-xs text-gray-500">
                    Última atualização: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Controlador do mapa */}
          <MapController
            userPosition={userPosition}
            conductorLocation={activeConductors[0] || null}
            userInteracted={userInteracted}
          />

          {/* Marcador da localização do usuário */}
          {showUserLocation && mapRef.current && userPosition && (
            <UserLocationMarker
              map={mapRef.current}
              userPosition={userPosition}
              autoCenter={false}
              showAccuracy={true}
            />
          )}
        </MapContainer>

        {/* Calculador de distância apenas quando TukTuk está online */}
        {activeConductors.length > 0 && activeConductors[0] && (
          <div className="absolute top-4 right-4 z-[1000]">
            <DistanceCalculator
              userPosition={userPosition}
              tuktukPosition={{
                lat: activeConductors[0].lat,
                lng: activeConductors[0].lng,
              }}
              showDetails={true}
            />
          </div>
        )}

        {/* Status do TukTuk */}
        {activeConductors.length === 0 && (
          <div className="absolute bottom-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded z-[1000]">
            <p className="text-sm">🚫 TukTuk offline</p>
          </div>
        )}
      </div>

      {/* Botão de localização do usuário FORA do mapa */}
      <div className="mt-4 flex flex-col gap-2 items-start">
        <LocationPermissionButton
          onLocationGranted={handleLocationGranted}
          onLocationDenied={handleLocationDenied}
          showStatus={false}
        >
          📍 Localizar-me
        </LocationPermissionButton>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors"
          onClick={handleRecenter}
          type="button"
        >
          Centralizar mapa
        </button>
      </div>

      {/* Componente de debug para desenvolvimento */}
      {import.meta.env.DEV && <LocationDebug />}
    </>
  );
};

export default PassengerMap;
