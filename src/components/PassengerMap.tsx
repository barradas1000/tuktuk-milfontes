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
import { supabase } from "../lib/supabase";
import { UserLocationMarker } from "./UserLocationMarker";
import { LocationPermissionButton } from "./LocationPermissionButton";
import { DistanceCalculator } from "./DistanceCalculator";
import { useDraggable } from "../hooks/useDraggable";
import { LocationDebug } from "./LocationDebug";
import ReservationForm from "./ReservationForm";
import { Coordinates } from "../utils/locationUtils";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { RealtimeChannel } from "@supabase/supabase-js";

// Corrigir ícones do Leaflet
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import tukTukIconUrl from "../assets/tuktuk-icon.png";

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const TukTukIcon = L.icon({
  iconUrl: tukTukIconUrl,
  iconSize: [64, 64], // aumentado para melhor visibilidade
  iconAnchor: [32, 64],
  popupAnchor: [0, -64],
});

type ConductorStatus = "available" | "busy";

interface ConductorLocation {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  status?: ConductorStatus;
  occupiedUntil?: string | null;
  updatedAt?: string;
  accuracy?: number;
}

interface ActiveConductorRow {
  conductor_id: string;
  current_latitude?: number | null;
  current_longitude?: number | null;
  is_available: boolean;
  occupied_until?: string | null;
  updated_at?: string;
  accuracy?: number | null;
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
    const valid =
      !!conductorLocation &&
      typeof conductorLocation.lat === "number" &&
      typeof conductorLocation.lng === "number" &&
      !isNaN(conductorLocation.lat) &&
      !isNaN(conductorLocation.lng) &&
      conductorLocation.lat >= -90 &&
      conductorLocation.lat <= 90 &&
      conductorLocation.lng >= -180 &&
      conductorLocation.lng <= 180;
    if (!userInteracted && valid) {
      map.setView(
        [conductorLocation!.lat, conductorLocation!.lng],
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

  // Debug: log sempre que activeConductors muda
  useEffect(() => {
    console.log("[DEBUG] activeConductors atualizado:", activeConductors);
  }, [activeConductors]);
  const [userInteracted, setUserInteracted] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const draggable = useDraggable({ top: 16, right: 16 });
  const userWatchIdRef = useRef<number | null>(null);

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

  // Funções de callback
  const handleLocationGranted = useCallback((position: GeolocationPosition) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    if (isValidCoordinate(lat, lng)) {
      setUserPosition({ lat, lng });
      setShowUserLocation(true);
      // Iniciar atualização em tempo real da posição do utilizador
      if (userWatchIdRef.current == null && navigator.geolocation) {
        const id = navigator.geolocation.watchPosition(
          (pos) => {
            const ulat = pos.coords.latitude;
            const ulng = pos.coords.longitude;
            if (isValidCoordinate(ulat, ulng)) {
              setUserPosition({ lat: ulat, lng: ulng });
            }
          },
          (err) => {
            console.warn("Geolocation watch error:", err);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 10000,
          }
        );
        userWatchIdRef.current = id;
      }
    }
  }, []);

  const handleLocationDenied = useCallback(() => {
    setShowUserLocation(false);
    setUserPosition(null);
    // Parar watch se existir
    if (userWatchIdRef.current) {
      navigator.geolocation.clearWatch(userWatchIdRef.current);
      userWatchIdRef.current = null;
    }
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
    const envOk =
      !!import.meta.env.VITE_SUPABASE_URL &&
      !!import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!envOk) {
      // Ambiente sem Supabase: renderizar em modo seguro, sem subscrições
      setLoading(false);
      return;
    }
    let activeChannel: RealtimeChannel | null = null;

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("active_conductors")
          .select(
            "conductor_id, current_latitude, current_longitude, is_available, occupied_until, updated_at, accuracy"
          )
          .eq("is_active", true);
        if (error || !data) {
          console.error("[PassengerMap] Erro na query inicial:", error);
          setActiveConductors([]);
        } else {
          console.log(
            "[PassengerMap] Dados carregados da query inicial:",
            data
          );
          const enriched = (data as ActiveConductorRow[])
            .map((d) => {
              const lat = d.current_latitude;
              const lng = d.current_longitude;
              const accuracy = d.accuracy ?? Infinity;
              if (!isValidCoordinate(lat, lng) || accuracy > 50) {
                console.warn(
                  "[PassengerMap] Registro ignorado por coordenadas inválidas ou baixa precisão:",
                  d
                );
                return null;
              }
              return {
                id: d.conductor_id,
                lat: lat as number,
                lng: lng as number,
                name: "TukTuk",
                status: d.is_available ? "available" : "busy",
                occupiedUntil: d.occupied_until ?? null,
                updatedAt: d.updated_at ?? new Date().toISOString(),
              };
            })
            .filter(Boolean) as ConductorLocation[];
          setActiveConductors(enriched);
        }
      } catch (e) {
        console.error("[PassengerMap] Erro no load:", e);
        setActiveConductors([]);
      } finally {
        setLoading(false);
      }
    };

    // Subscrição realtime com mais logs e sem filter restritivo para depuração
    activeChannel = supabase
      .channel("active_conductors_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "active_conductors",
        },
        (payload) => {
          console.log(
            "[PassengerMap] Realtime event on active_conductors:",
            payload
          );

          // Lida com a remoção de um condutor (quando a linha é apagada)
          if (payload.eventType === "DELETE") {
            const oldId = payload.old.conductor_id;
            if (oldId) {
              setActiveConductors((prev) => prev.filter((c) => c.id !== oldId));
            }
            return;
          }

          // Lida com INSERT e UPDATE
          if (payload.new && typeof payload.new === "object") {
            type ActiveConductorPayload = {
              conductor_id: string;
              is_active?: boolean;
              is_available?: boolean;
              occupied_until?: string | null;
              current_latitude?: number | null;
              current_longitude?: number | null;
              updated_at?: string;
              accuracy?: number | null;
            };

            const newData = payload.new as ActiveConductorPayload;

            // Se o condutor ficar inativo, remove-o do mapa
            if (newData.is_active === false) {
              setActiveConductors((prev) =>
                prev.filter((c) => c.id !== newData.conductor_id)
              );
              return;
            }

            const lat = newData.current_latitude;
            const lng = newData.current_longitude;
            const accuracy = newData.accuracy ?? Infinity;

            // Se as coordenadas forem inválidas, não o adicione/atualize no mapa
            if (!isValidCoordinate(lat, lng)) {
              // Remove do mapa se já existia mas perdeu as coordenadas
              setActiveConductors((prev) =>
                prev.filter((c) => c.id !== newData.conductor_id)
              );
              return;
            }

            const updatedConductor: ConductorLocation = {
              id: newData.conductor_id,
              lat: lat as number,
              lng: lng as number,
              name: "TukTuk", // O nome é estático, pode ser melhorado com um JOIN no load inicial
              status: newData.is_available ? "available" : "busy",
              occupiedUntil: newData.occupied_until ?? null,
              updatedAt: newData.updated_at ?? new Date().toISOString(),
            };

            // Atualiza ou adiciona o condutor na lista
            setActiveConductors((prev) => {
              const existingIdx = prev.findIndex(
                (c) => c.id === newData.conductor_id
              );
              if (existingIdx > -1) {
                const newState = [...prev];
                newState[existingIdx] = updatedConductor;
                return newState;
              } else {
                return [...prev, updatedConductor];
              }
            });
          }
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("[PassengerMap] Realtime subscription active");
        } else if (err) {
          console.error("[PassengerMap] Realtime subscription error:", err);
          setActiveConductors([]);
        }
      });

    load();

    return () => {
      if (activeChannel) supabase.removeChannel(activeChannel);
    };
  }, []);

  // Limpeza do watch ao desmontar ou quando a localização do utilizador for ocultada
  useEffect(() => {
    return () => {
      if (userWatchIdRef.current) {
        navigator.geolocation.clearWatch(userWatchIdRef.current);
        userWatchIdRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!showUserLocation && userWatchIdRef.current) {
      navigator.geolocation.clearWatch(userWatchIdRef.current);
      userWatchIdRef.current = null;
    }
  }, [showUserLocation]);

  // Detecta interação manual do usuário com o mapa
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const onUserInteraction = () => setUserInteracted(true);
    map.on("zoomstart", onUserInteraction);
    map.on("movestart", onUserInteraction);
    return () => {
      map.off("zoomstart", onUserInteraction);
      map.off("movestart", onUserInteraction);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-lg font-medium">🔄 {t("tracking.loading")}</p>
          <p className="text-sm text-gray-500 mt-1">
            {t("tracking.pleaseWait")} ⏳
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full max-h-[55vh] sm:max-h-[65vh] md:max-h-[75vh] lg:max-h-[78vh] h-[55vh] sm:h-[65vh] md:h-[75vh] lg:h-[78vh] rounded-lg overflow-hidden shadow-lg">
        <MapContainer style={{ height: "100%", width: "100%" }}>
          <MapReady onReady={handleMapReady} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Renderizar apenas condutores com coordenadas válidas */}
          {activeConductors.map((conductor) => (
            <TukTukMarker
              key={`${conductor.id}-${conductor.lat}-${conductor.lng}`}
              position={[conductor.lat, conductor.lng]}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold text-blue-600">{conductor.name}</h3>
                  <p className="text-sm text-gray-600">
                    {conductor.status === "available"
                      ? "Disponível"
                      : "Ocupado"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Última atualização:{" "}
                    {new Date(conductor.updatedAt ?? "").toLocaleTimeString()}
                  </p>
                </div>
              </Popup>
            </TukTukMarker>
          ))}

          {/* Controlador do mapa */}
          <MapController
            userPosition={userPosition}
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
                autoCenter={true}
                showAccuracy={true}
              />
            )}
        </MapContainer>

        {/* Card "Localizar-me" / Distância, arrastável */}
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
            activeConductors.map((conductor) =>
              isValidCoordinate(conductor.lat, conductor.lng) ? (
                <DistanceCalculator
                  key={conductor.id}
                  userPosition={userPosition}
                  tuktukPosition={{ lat: conductor.lat, lng: conductor.lng }}
                  showDetails={true}
                />
              ) : null
            )}
        </div>

        {/* Status do TukTuk */}
        {renderTuktukStatus()}
      </div>

      {/* Botões de controle FORA do mapa */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2 items-center sm:items-start">
        <LocationPermissionButton
          onLocationGranted={handleLocationGranted}
          onLocationDenied={handleLocationDenied}
          showStatus={false}
        >
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

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors"
          onClick={handleRecenter}
          type="button"
        >
          {t("tracking.mapCentering")}
        </button>
      </div>

      {import.meta.env.DEV && <LocationDebug />}
    </>
  );
};

export default PassengerMap;
