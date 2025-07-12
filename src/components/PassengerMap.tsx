import React, { useEffect, useState, useRef } from "react";
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

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface DriverLocation {
  lat: number;
  lng: number;
  isActive: boolean;
  name: string;
}

// Componente para controlar o mapa
const MapController: React.FC<{
  userPosition: Coordinates | null;
  driverLocation: DriverLocation | null;
  userInteracted: boolean;
}> = ({ userPosition, driverLocation, userInteracted }) => {
  const map = useMap();

  useEffect(() => {
    if (userPosition && driverLocation?.isActive && !userInteracted) {
      // Calcular zoom ideal para mostrar ambos os pontos
      const bounds = L.latLngBounds([
        [userPosition.lat, userPosition.lng],
        [driverLocation.lat, driverLocation.lng],
      ]);
      map.fitBounds(bounds, { padding: [20, 20] });
    } else if (userPosition && !userInteracted) {
      // Se só temos posição do usuário, centralizar nele
      map.setView([userPosition.lat, userPosition.lng], 15);
    } else if (driverLocation?.isActive && !userInteracted) {
      // Se só temos posição do motorista, centralizar nele
      map.setView([driverLocation.lat, driverLocation.lng], 14);
    }
  }, [userPosition, driverLocation, map, userInteracted]);

  return null;
};

const PassengerMap: React.FC = () => {
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(
    null
  );
  const [userPosition, setUserPosition] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    // Carregar localização inicial
    const fetchDriverLocation = async () => {
      try {
        // Verificar se o Supabase está configurado
        if (
          !import.meta.env.VITE_SUPABASE_URL ||
          !import.meta.env.VITE_SUPABASE_ANON_KEY
        ) {
          console.warn("Supabase não configurado, usando coordenadas padrão");
          setDriverLocation({
            lat: 37.725,
            lng: -8.783,
            isActive: false,
            name: "TukTuk",
          });
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("drivers")
          .select("*")
          .single();

        if (error) {
          console.error("Erro ao carregar localização:", error);
          // Usar coordenadas padrão em caso de erro
          setDriverLocation({
            lat: 37.725,
            lng: -8.783,
            isActive: false,
            name: "TukTuk",
          });
          return;
        }

        if (data) {
          setDriverLocation({
            lat: data.latitude || 37.725,
            lng: data.longitude || -8.783,
            isActive: data.is_active,
            name: data.name || "TukTuk",
          });
        }
      } catch (error) {
        console.error("Erro:", error);
        // Usar coordenadas padrão em caso de erro
        setDriverLocation({
          lat: 37.725,
          lng: -8.783,
          isActive: false,
          name: "TukTuk",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDriverLocation();

    // Subscrever a atualizações em tempo real
    if (
      import.meta.env.VITE_SUPABASE_URL &&
      import.meta.env.VITE_SUPABASE_ANON_KEY
    ) {
      const channel = supabase
        .channel("driver_location")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "drivers" },
          (payload) => {
            const newData = payload.new as {
              latitude?: number;
              longitude?: number;
              is_active?: boolean;
              name?: string;
            };
            setDriverLocation({
              lat: newData.latitude || 37.725,
              lng: newData.longitude || -8.783,
              isActive: newData.is_active || false,
              name: newData.name || "TukTuk",
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

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

  const handleLocationGranted = (position: GeolocationPosition) => {
    setUserPosition({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    });
    setShowUserLocation(true);
  };

  const handleLocationDenied = () => {
    setShowUserLocation(false);
    setUserPosition(null);
  };

  const handleMapReady = (map: L.Map) => {
    mapRef.current = map;
  };

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
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {driverLocation?.isActive && (
            <Marker position={[driverLocation.lat, driverLocation.lng]}>
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold text-blue-600">
                    {driverLocation.name}
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
            driverLocation={driverLocation}
            userInteracted={userInteracted}
          />

          {/* Marcador da localização do usuário */}
          {showUserLocation && mapRef.current && (
            <UserLocationMarker
              map={mapRef.current}
              onPositionChange={setUserPosition}
              onError={handleLocationDenied}
              autoCenter={false}
              showAccuracy={true}
            />
          )}
        </MapContainer>

        {/* Calculador de distância */}
        <div className="absolute top-4 right-4 z-[1000]">
          <DistanceCalculator
            userPosition={userPosition}
            tuktukPosition={{
              lat: driverLocation?.lat ?? 0,
              lng: driverLocation?.lng ?? 0,
            }}
            showDetails={true}
          />
        </div>

        {/* Status do TukTuk */}
        {!driverLocation?.isActive && (
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
