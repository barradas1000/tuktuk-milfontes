import React, { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L, { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "../lib/supabase";
import { UserLocationMarker } from "./UserLocationMarker";
import { LocationPermissionButton } from "./LocationPermissionButton";
import { DistanceCalculator } from "./DistanceCalculator";
import { LocationDebug } from "./LocationDebug";
import { Coordinates } from "../utils/locationUtils";

// Corrigir ícones padrão do Leaflet
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

const DISTANCIA_ALERTA_METROS = 50;
const VELOCIDADE_MEDIA_KMH = 20;

const MapController: React.FC<{
  userPosition: Coordinates | null;
  conductorLocation: ConductorLocation | null;
  userInteracted: boolean;
}> = ({ userPosition, conductorLocation, userInteracted }) => {
  const map = useMap();

  useEffect(() => {
    if (!userInteracted) {
      if (userPosition && conductorLocation?.isActive) {
        const bounds = L.latLngBounds([
          [userPosition.lat, userPosition.lng],
          [conductorLocation.lat, conductorLocation.lng],
        ]);
        map.fitBounds(bounds, { padding: [20, 20] });
      } else if (userPosition) {
        map.setView([userPosition.lat, userPosition.lng], 15);
      } else if (conductorLocation?.isActive) {
        map.setView([conductorLocation.lat, conductorLocation.lng], 14);
      }
    }
  }, [userPosition, conductorLocation, map, userInteracted]);

  return null;
};

const calcularDistanciaMetros = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const PassengerMap: React.FC = () => {
  const [activeConductors, setActiveConductors] = useState<ConductorLocation[]>(
    []
  );
  const [userPosition, setUserPosition] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  // const [tempoEstimado, setTempoEstimado] = useState<number | null>(null);

  const [tuktukStatus, setTuktukStatus] = useState<{
    status: "available" | "busy";
    occupied_until: string | null;
  } | null>(null);

  const mapRef = useRef<L.Map | null>(null);

  // Definir conductor ANTES dos hooks que o usam
  const conductor = activeConductors[0];

  useEffect(() => {
    let isMounted = true;
    const fetchConductors = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("conductors")
        .select("*")
        .eq("is_active", true);
      if (data && !error && isMounted) {
        setActiveConductors(
          data.map(({ id, latitude, longitude, is_active, name }: any) => ({
            id,
            lat: latitude || 37.725,
            lng: longitude || -8.783,
            isActive: is_active,
            name: name || "TukTuk",
          }))
        );
      }
      setLoading(false);
    };
    fetchConductors();

    const channel = supabase
      .channel("conductor_location")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "conductors" },
        (payload: { new: any }) => {
          const { id, latitude, longitude, is_active, name } = payload.new;
          setActiveConductors((prev) => {
            const updated = prev.filter((d) => d.id !== id);
            return is_active
              ? [
                  ...updated,
                  {
                    id,
                    lat: latitude || 37.725,
                    lng: longitude || -8.783,
                    isActive: true,
                    name: name || "TukTuk",
                  },
                ]
              : updated;
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!userPosition || activeConductors.length === 0) return;
    const dist = calcularDistanciaMetros(
      userPosition.lat,
      userPosition.lng,
      activeConductors[0].lat,
      activeConductors[0].lng
    );
    if (dist < DISTANCIA_ALERTA_METROS) {
      const velocidadeMS = (VELOCIDADE_MEDIA_KMH * 1000) / 3600;
      setTempoEstimado(Math.round(dist / velocidadeMS / 60));
    } else {
      setTempoEstimado(null);
    }
  }, [userPosition, activeConductors]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const onInteract = () => setUserInteracted(true);
    map.on("zoomstart", onInteract);
    map.on("movestart", onInteract);
    return () => {
      map.off("zoomstart", onInteract);
      map.off("movestart", onInteract);
    };
  }, []);

  const handleLocationGranted = useCallback((pos: GeolocationPosition) => {
    setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    setShowUserLocation(true);
  }, []);

  useEffect(() => {
    if (!conductor) {
      setTuktukStatus(null);
      return;
    }
    let isMounted = true;
    const fetchStatus = async () => {
      const { data } = await supabase
        .from("active_conductors")
        .select("status, occupied_until")
        .eq("conductor_id", conductor.id)
        .eq("is_active", true)
        .single();
      if (data && isMounted) {
        setTuktukStatus({
          status: (data as any).status,
          occupied_until: (data as any).occupied_until,
        });
      } else if (isMounted) {
        setTuktukStatus(null);
      }
    };
    fetchStatus();

    // Realtime listener para status do TukTuk
    const channel = supabase
      .channel("tuktuk_status")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "active_conductors",
          filter: `conductor_id=eq.${conductor.id}`,
        },
        (payload: { new: any }) => {
          if (payload.new && typeof payload.new.status !== "undefined") {
            setTuktukStatus({
              status: payload.new.status,
              occupied_until: payload.new.occupied_until,
            });
          } else {
            setTuktukStatus(null);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [conductor]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p>Carregando localização do TukTuk...</p>
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
          whenReady={({ target }) => {
            mapRef.current = target as L.Map;
          }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {conductor && (
            <Marker
              position={[conductor.lat, conductor.lng]}
              icon={TukTukIcon as any}
            >
              <Popup>
                <div className="text-center min-w-[180px] min-h-[40px] flex flex-col items-center justify-center gap-1">
                  <div>
                    <h3 className="font-bold text-blue-600 mb-1">
                      {conductor.name}
                    </h3>
                  </div>
                  <div>
                    {/* Debug: mostrar o valor de tuktukStatus no popup */}
                    <pre
                      style={{
                        fontSize: 10,
                        color: "#888",
                        background: "#f8f8f8",
                        marginBottom: 4,
                        borderRadius: 4,
                        padding: 2,
                      }}
                    >
                      {JSON.stringify(tuktukStatus)}
                    </pre>
                    {tuktukStatus ? (
                      tuktukStatus.status === "available" ? (
                        <span className="text-sm text-green-700 font-semibold">
                          🟢 Disponível
                        </span>
                      ) : tuktukStatus.status === "busy" ? (
                        <span className="text-sm text-yellow-700 font-semibold">
                          {tuktukStatus.occupied_until &&
                          !isNaN(
                            new Date(tuktukStatus.occupied_until).getTime()
                          )
                            ? `🟡 Ocupado — Disponível às ${new Date(
                                tuktukStatus.occupied_until
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}`
                            : "🟡 Ocupado"}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-700 font-semibold">
                          Status desconhecido
                        </span>
                      )
                    ) : (
                      <span className="text-sm text-gray-700 font-semibold">
                        Carregando status...
                      </span>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          <MapController
            userPosition={userPosition}
            conductorLocation={conductor}
            userInteracted={userInteracted}
          />

          {showUserLocation && mapRef.current && userPosition && (
            <UserLocationMarker
              map={mapRef.current}
              userPosition={userPosition}
              autoCenter={false}
              showAccuracy
            />
          )}
        </MapContainer>

        {conductor && (
          <div className="absolute top-4 right-4 z-[1000]">
            <DistanceCalculator
              userPosition={userPosition}
              tuktukPosition={{ lat: conductor.lat, lng: conductor.lng }}
              showDetails
            />
          </div>
        )}

        <div className="absolute bottom-4 left-4 bg-white border px-4 py-2 rounded z-[1000] shadow">
          {!conductor && (
            <p className="text-sm text-red-600 font-semibold">
              🚫 TukTuk offline
            </p>
          )}
          {conductor && tuktukStatus?.status === "available" && (
            <p className="text-sm text-green-700 font-semibold">
              🟢 Disponível
            </p>
          )}
          {conductor && tuktukStatus?.status === "busy" && (
            <p className="text-sm text-yellow-700 font-semibold">
              {(() => {
                if (
                  tuktukStatus.occupied_until &&
                  !isNaN(new Date(tuktukStatus.occupied_until).getTime())
                ) {
                  return `🟡 Ocupado — Disponível às ${new Date(
                    tuktukStatus.occupied_until
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`;
                } else {
                  return "🟡 Ocupado";
                }
              })()}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 items-start">
        <LocationPermissionButton
          onLocationGranted={handleLocationGranted}
          onLocationDenied={() => setShowUserLocation(false)}
          showStatus={false}
        >
          📍 Localizar-me
        </LocationPermissionButton>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors"
          onClick={() => setUserInteracted(false)}
          type="button"
        >
          Centralizar mapa
        </button>
      </div>

      {import.meta.env.DEV && <LocationDebug />}
    </>
  );
};

export default PassengerMap;
