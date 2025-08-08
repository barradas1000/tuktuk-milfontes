<<<<<<< HEAD
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L, { Marker as LeafletMarker } from "leaflet";
import type { DragPosition } from "../hooks/useDraggable";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
=======
import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
import { supabase } from "../lib/supabase";
import { UserLocationMarker } from "./UserLocationMarker";
import { LocationPermissionButton } from "./LocationPermissionButton";
import { DistanceCalculator } from "./DistanceCalculator";
<<<<<<< HEAD
import { useDraggable } from "../hooks/useDraggable";
import { LocationDebug } from "./LocationDebug";
import ReservationForm from "./ReservationForm";
import { Coordinates } from "../utils/locationUtils";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
=======
import { LocationDebug } from "./LocationDebug";
import { Coordinates } from "../utils/locationUtils";
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363

// Corrigir ícones do Leaflet
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
<<<<<<< HEAD
import tukTukIconUrl from "../assets/tuktuk-icon.png";
=======
import tukTukIconUrl from "../assets/tuktuk-icon.png"; // Adicione um ícone de TukTuk na pasta assets
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363

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

<<<<<<< HEAD
type ConductorStatus = "available" | "busy";

interface ConductorLocation {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  status?: ConductorStatus;
  occupiedUntil?: string | null;
}

// Tipos das linhas do banco
interface ConductorRow {
  id: string;
  is_active?: boolean | null;
  latitude?: number | null;
  longitude?: number | null;
  name?: string | null;
}

interface ActiveConductorRow {
  conductor_id: string;
  is_available: boolean;
  occupied_until?: string | null;
}

// Controlador simples para recenter/pan logic conforme interação do usuário
function MapController({
  userPosition,
  conductorLocation,
  userInteracted,
}: {
  userPosition: Coordinates | null;
  conductorLocation: ConductorLocation | null;
  userInteracted: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    if (!userInteracted && conductorLocation) {
      map.setView(
        [conductorLocation.lat, conductorLocation.lng],
        map.getZoom()
      );
    }
  }, [map, userInteracted, conductorLocation]);
  return null;
}

// Wrapper para aplicar ícone personalizado no Marker
function TukTukMarker({
  position,
  children,
}: {
  position: [number, number];
  children?: React.ReactNode;
}) {
  const markerRef = useRef<LeafletMarker | null>(null);
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setIcon(TukTukIcon);
    }
  }, []);
  return (
    <Marker
      position={position}
      ref={markerRef as unknown as React.Ref<LeafletMarker>}
    >
      {children}
    </Marker>
  );
}

function MapReady({ onReady }: { onReady: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

const PassengerMap: React.FC = () => {
  const { t } = useTranslation();
  const [userPosition, setUserPosition] = useState<Coordinates | null>(null);
  const [activeConductors, setActiveConductors] = useState<ConductorLocation[]>(
    []
  );
  const [userInteracted, setUserInteracted] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const draggable = useDraggable({ top: 16, right: 16 });

  // Função para validar coordenadas
  const isValidCoordinate = (
    lat: number | undefined,
    lng: number | undefined
  ): boolean => {
    return (
      typeof lat === "number" &&
      typeof lng === "number" &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  };

  // Funções de callback e hooks auxiliares
  const handleLocationGranted = useCallback((position: GeolocationPosition) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    if (isValidCoordinate(lat, lng)) {
      setUserPosition({ lat, lng });
      setShowUserLocation(true);
    }
  }, []);

  const handleLocationDenied = useCallback(() => {
    setShowUserLocation(false);
    setUserPosition(null);
  }, []);

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
    // Vista inicial
    map.setView([37.725, -8.783], 14);
  }, []);

  const handleRecenter = () => setUserInteracted(false);

  const renderTuktukStatus = () => {
    if (activeConductors.length === 0) {
      return (
        <div className="absolute bottom-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded z-[1000] max-w-xs">
          <p className="text-sm font-semibold">🚫 TukTuk offline</p>
          <p className="text-xs mt-1">
            O TukTuk não está disponível neste momento
          </p>
        </div>
      );
    }
    const conductor = activeConductors[0];
    if (conductor.status === "busy") {
      const occupiedUntil = conductor.occupiedUntil
        ? new Date(conductor.occupiedUntil)
        : null;
      const isStillOccupied = occupiedUntil ? occupiedUntil > new Date() : true;
      if (isStillOccupied) {
        return (
          <div className="absolute bottom-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded z-[1000] max-w-xs">
            <p className="text-sm font-semibold">
              🔴 {t("tracking.tuktukBusy")}
            </p>
            {occupiedUntil && (
              <p className="text-xs mt-1">
                {t("tracking.availableAgainAt")}:{" "}
                {format(occupiedUntil, "HH:mm", { locale: pt })}
              </p>
            )}
          </div>
        );
      }
    }
    return (
      <div className="absolute bottom-4 left-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded z-[1000] max-w-xs">
        <p className="text-sm font-semibold">
          🟢 {t("tracking.tuktukAvailable")}
        </p>
        <p className="text-xs mt-1">✨ {t("tracking.readyForAdventure")}</p>
      </div>
    );
  };

  // Carregar dados e subscrições
  useEffect(() => {
    let conductorChannel: ReturnType<typeof supabase.channel> | null = null;
    let activeChannel: ReturnType<typeof supabase.channel> | null = null;

    const fetchConductorStatusFromActiveTable = async (
      conductorId: string
    ): Promise<{ status: ConductorStatus; occupiedUntil: string | null }> => {
      const { data, error } = await supabase
        .from("active_conductors")
        .select("is_available, occupied_until")
        .eq("conductor_id", conductorId)
        .maybeSingle();
      if (error || !data) return { status: "available", occupiedUntil: null };
      const row = data as ActiveConductorRow;
      return {
        status: row.is_available ? "available" : "busy",
        occupiedUntil: row.occupied_until ?? null,
      };
    };

    const load = async () => {
=======
interface DriverLocation {
  id: string;
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

const DISTANCIA_ALERTA_METROS = 50; // Distância para exibir o alerta
const VELOCIDADE_MEDIA_KMH = 20; // Velocidade média do TukTuk em km/h

const PassengerMap: React.FC = () => {
  const [activeDrivers, setActiveDrivers] = useState<DriverLocation[]>([]);
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
    // Carregar todos os motoristas ativos
    const fetchActiveDrivers = async () => {
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
      try {
        if (
          !import.meta.env.VITE_SUPABASE_URL ||
          !import.meta.env.VITE_SUPABASE_ANON_KEY
        ) {
<<<<<<< HEAD
          setActiveConductors([]);
          return;
        }
        const { data, error } = await supabase
          .from("conductors")
          .select("*")
          .eq("is_active", true);
        if (error || !data) {
          setActiveConductors([]);
        } else {
          const enriched = await Promise.all(
            (data as ConductorRow[]).map(async (d: ConductorRow) => {
              const lat = d.latitude ?? 37.725;
              const lng = d.longitude ?? -8.783;
              if (!isValidCoordinate(lat ?? undefined, lng ?? undefined))
                return null;
              const statusData = await fetchConductorStatusFromActiveTable(
                d.id
              );
              return {
                id: d.id,
                lat: lat as number,
                lng: lng as number,
                name: d.name ?? "TukTuk",
                status: statusData.status,
                occupiedUntil: statusData.occupiedUntil,
              } as ConductorLocation;
            })
          );
          setActiveConductors(enriched.filter(Boolean) as ConductorLocation[]);
        }
=======
          setActiveDrivers([]);
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from("drivers")
          .select("*")
          .eq("is_active", true);
        if (error) {
          setActiveDrivers([]);
        } else if (data) {
          setActiveDrivers(
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
        setActiveDrivers([]);
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
      } finally {
        setLoading(false);
      }
    };
<<<<<<< HEAD

    const subscribe = () => {
      conductorChannel = supabase
        .channel("conductor_location")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "conductors" },
          async (payload: RealtimePostgresChangesPayload<ConductorRow>) => {
            if (!payload.new || typeof payload.new !== "object") return;
            const newData = payload.new as ConductorRow;
            if (!newData?.is_active) {
              setActiveConductors((prev) =>
                prev.filter((c) => c.id !== newData.id)
              );
              return;
            }
            const lat = newData.latitude ?? 37.725;
            const lng = newData.longitude ?? -8.783;
            if (!isValidCoordinate(lat ?? undefined, lng ?? undefined)) return;
            const statusData = await fetchConductorStatusFromActiveTable(
              newData.id
            );
            setActiveConductors((prev) => {
              const others = prev.filter((c) => c.id !== newData.id);
              return [
                ...others,
                {
                  id: newData.id,
                  lat: lat as number,
                  lng: lng as number,
                  name: newData.name ?? "TukTuk",
                  status: statusData.status,
                  occupiedUntil: statusData.occupiedUntil,
                },
              ];
=======
    fetchActiveDrivers();

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
              id: string;
              latitude?: number;
              longitude?: number;
              is_active?: boolean;
              name?: string;
            };
            setActiveDrivers((prev) => {
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
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
            });
          }
        )
        .subscribe();
<<<<<<< HEAD

      activeChannel = supabase
        .channel("active_conductors_status")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "active_conductors" },
          async (
            payload: RealtimePostgresChangesPayload<ActiveConductorRow>
          ) => {
            if (!payload.new || typeof payload.new !== "object") return;
            const newData = payload.new as ActiveConductorRow;
            if (!newData?.conductor_id) return;
            const status: ConductorStatus = newData.is_available
              ? "available"
              : "busy";
            setActiveConductors((prev) => {
              const idx = prev.findIndex((c) => c.id === newData.conductor_id);
              if (idx === -1) return prev;
              const updated = [...prev];
              updated[idx] = {
                ...updated[idx],
                status,
                occupiedUntil: newData.occupied_until ?? null,
              };
              return updated;
            });
          }
        )
        .subscribe();
    };

    load();
    subscribe();

    return () => {
      if (conductorChannel) supabase.removeChannel(conductorChannel);
      if (activeChannel) supabase.removeChannel(activeChannel);
    };
  }, []);

  // Detecta interação manual do usuário com o mapa
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
=======
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  useEffect(() => {
    if (userPosition && activeDrivers[0]) {
      const dist = calcularDistanciaMetros(
        userPosition.lat,
        userPosition.lng,
        activeDrivers[0].lat,
        activeDrivers[0].lng
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
  }, [userPosition, activeDrivers]);

  // Detecta interação manual do usuário com o mapa
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
    const onUserInteraction = () => setUserInteracted(true);
    map.on("zoomstart", onUserInteraction);
    map.on("movestart", onUserInteraction);
    return () => {
      map.off("zoomstart", onUserInteraction);
      map.off("movestart", onUserInteraction);
    };
<<<<<<< HEAD
  }, []);
=======
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
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
<<<<<<< HEAD
          <p className="text-lg font-medium">🔄 {t("tracking.loading")}</p>
          <p className="text-sm text-gray-500 mt-1">
            {t("tracking.pleaseWait")} ⏳
          </p>
=======
          <p>Carregando localização do TukTuk...</p>
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg">
<<<<<<< HEAD
        <MapContainer style={{ height: "100%", width: "100%" }}>
          <MapReady onReady={handleMapReady} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Renderizar apenas condutores com coordenadas válidas */}
          {activeConductors[0] &&
            isValidCoordinate(
              activeConductors[0].lat,
              activeConductors[0].lng
            ) && (
              <TukTukMarker
                position={[activeConductors[0].lat, activeConductors[0].lng]}
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
              </TukTukMarker>
            )}
=======
        <MapContainer
          center={[37.725, -8.783]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          ref={handleMapReady}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Renderizar apenas o primeiro motorista ativo */}
          {activeDrivers[0] && (
            <Marker
              position={[activeDrivers[0].lat, activeDrivers[0].lng]}
              icon={TukTukIcon}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold text-blue-600">
                    {activeDrivers[0].name}
                  </h3>
                  <p className="text-sm text-gray-600">TukTuk disponível</p>
                  <p className="text-xs text-gray-500">
                    Última atualização: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363

          {/* Controlador do mapa */}
          <MapController
            userPosition={userPosition}
<<<<<<< HEAD
            conductorLocation={activeConductors[0] || null}
            userInteracted={userInteracted}
          />

          {/* Marcador da localização do usuário - com validação */}
          {showUserLocation &&
            mapRef.current &&
            userPosition &&
            isValidCoordinate(userPosition.lat, userPosition.lng) && (
              <UserLocationMarker
                map={mapRef.current}
                userPosition={userPosition}
                autoCenter={true} // <- alterar aqui
                showAccuracy={true}
              />
            )}
        </MapContainer>

        {/* Card visual "Localizar-me" ou Distância no canto superior direito, agora arrastável */}
        <div
          id="draggable-distance-card"
          style={{
            position: "fixed",
            top: draggable.position.top ?? undefined,
            left: (draggable.position as DragPosition).left ?? undefined,
            right:
              (draggable.position as DragPosition).left === undefined
                ? (draggable.position as DragPosition).right
                : undefined,
            zIndex: 1100,
            touchAction: "none",
            cursor: "grab",
            userSelect: "none",
          }}
          {...draggable.eventHandlers}
        >
          {userPosition &&
          activeConductors.length > 0 &&
          activeConductors[0] &&
          isValidCoordinate(
            activeConductors[0].lat,
            activeConductors[0].lng
          ) ? (
            <DistanceCalculator
              userPosition={userPosition}
              tuktukPosition={{
                lat: activeConductors[0].lat,
                lng: activeConductors[0].lng,
              }}
              showDetails={true}
            />
          ) : (
            <LocationPermissionButton
              onLocationGranted={handleLocationGranted}
              onLocationDenied={handleLocationDenied}
              showStatus={false}
            >
              <div className="flex items-center gap-1 bg-white rounded px-2 py-1 cursor-pointer text-sm text-blue-700">
                <span style={{ fontSize: "1.1em" }}>📍</span>
                <span>{t("locationPermission.grantAccess")}</span>
              </div>
            </LocationPermissionButton>
          )}
        </div>

        {/* Status do TukTuk */}
        {renderTuktukStatus()}
      </div>

      {/* Botões de controle FORA do mapa */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2 items-center sm:items-start">
=======
            driverLocation={activeDrivers[0] || null}
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

        {/* Calculador de distância apenas para o TukTuk ativo */}
        <div className="absolute top-4 right-4 z-[1000]">
          <DistanceCalculator
            userPosition={userPosition}
            tuktukPosition={
              activeDrivers[0]
                ? { lat: activeDrivers[0].lat, lng: activeDrivers[0].lng }
                : { lat: 0, lng: 0 }
            }
            showDetails={true}
          />
        </div>

        {/* Status do TukTuk */}
        {activeDrivers.length === 0 && (
          <div className="absolute bottom-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded z-[1000]">
            <p className="text-sm">🚫 TukTuk offline</p>
          </div>
        )}
      </div>

      {/* Botão de localização do usuário FORA do mapa */}
      <div className="mt-4 flex flex-col gap-2 items-start">
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
        <LocationPermissionButton
          onLocationGranted={handleLocationGranted}
          onLocationDenied={handleLocationDenied}
          showStatus={false}
        >
<<<<<<< HEAD
          📍 {t("locationPermission.grantAccess")}
        </LocationPermissionButton>

        <Dialog
          open={isReservationModalOpen}
          onOpenChange={setIsReservationModalOpen}
        >
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="bg-amber-500 hover:bg-amber-600 text-blue-900 font-bold text-lg px-8 py-3 rounded-xl shadow-xl hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105"
            >
              {t("tracking.makeReservation")}
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-4xl max-h-[90vh] overflow-y-auto"
            style={{ zIndex: 10000 }}
          >
            <DialogHeader>
              <DialogTitle className="sr-only">
                {t("tracking.reservationDialog")}
              </DialogTitle>
            </DialogHeader>
            <ReservationForm />
          </DialogContent>
        </Dialog>

=======
          📍 Localizar-me
        </LocationPermissionButton>
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors"
          onClick={handleRecenter}
          type="button"
        >
<<<<<<< HEAD
          {t("tracking.mapCentering")}
        </button>
      </div>

=======
          Centralizar mapa
        </button>
      </div>

      {/* Componente de debug para desenvolvimento */}
>>>>>>> c8a33077bab7f709cdfa791e69ccd28f2ae30363
      {import.meta.env.DEV && <LocationDebug />}
    </>
  );
};

export default PassengerMap;
