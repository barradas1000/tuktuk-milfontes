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
import { format } from "date-fns";
import { pt } from "date-fns/locale";

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
  status?: "available" | "busy";
  occupiedUntil?: string | null;
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
const VELOCIDADE_MEDIA_KMH = 15; // ✅ Velocidade média do TukTuk em km/h

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

  // Função para buscar status de disponibilidade dos condutores
  const fetchConductorStatusFromActiveTable = async (conductorId: string) => {
    try {
      console.log("🔍 Buscando status para condutor:", conductorId); // Debug

      const { data, error } = await supabase
        .from("active_conductors")
        .select("is_available, occupied_until") // Usar is_available (boolean)
        .eq("conductor_id", conductorId)
        .eq("is_active", true)
        .single();

      console.log("📊 Resultado da busca:", { data, error }); // Debug

      if (error || !data) {
        console.log("⚠️ Nenhum registro encontrado, usando padrão"); // Debug
        return { status: "available", occupiedUntil: null };
      }

      // Converter boolean para string: true = "available", false = "busy"
      const status = data.is_available ? "available" : "busy";

      console.log("✅ Status encontrado:", status); // Debug
      return {
        status: status,
        occupiedUntil: data.occupied_until,
      };
    } catch (error) {
      console.error("❌ Erro ao buscar status:", error); // Debug
      return { status: "available", occupiedUntil: null };
    }
  };

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
          // Buscar status de cada condutor ativo
          const conductorsWithStatus = await Promise.all(
            data.map(
              async (d: {
                id: string;
                latitude: number;
                longitude: number;
                is_active: boolean;
                name: string;
              }) => {
                const statusData = await fetchConductorStatusFromActiveTable(
                  d.id
                );

                // Validar coordenadas antes de criar o objeto
                const lat = d.latitude || 37.725;
                const lng = d.longitude || -8.783;

                if (!isValidCoordinate(lat, lng)) {
                  console.warn(
                    `⚠️ Coordenadas inválidas para condutor ${d.id}:`,
                    { lat, lng }
                  );
                  return null;
                }

                return {
                  id: d.id,
                  lat: lat,
                  lng: lng,
                  isActive: d.is_active,
                  name: d.name || "TukTuk",
                  status: statusData.status,
                  occupiedUntil: statusData.occupiedUntil,
                };
              }
            )
          );

          // Filtrar condutores com coordenadas válidas
          const validConductors = conductorsWithStatus.filter(
            (c) => c !== null
          ) as ConductorLocation[];
          setActiveConductors(validConductors);
        }
      } catch (error) {
        console.error("Erro ao carregar condutores:", error);
        setActiveConductors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveConductors();

    // Subscrever a atualizações em tempo real na tabela conductors
    if (
      import.meta.env.VITE_SUPABASE_URL &&
      import.meta.env.VITE_SUPABASE_ANON_KEY
    ) {
      const conductorChannel = supabase
        .channel("conductor_location")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "conductors" },
          async (payload) => {
            console.log("🔄 Conductor table update detected:", payload); // Debug

            const newData = payload.new as {
              id: string;
              latitude?: number;
              longitude?: number;
              is_active?: boolean;
              name?: string;
            };

            if (newData.is_active) {
              // Validar coordenadas
              const lat = newData.latitude || 37.725;
              const lng = newData.longitude || -8.783;

              if (!isValidCoordinate(lat, lng)) {
                console.warn(
                  `⚠️ Coordenadas inválidas para condutor ${newData.id}:`,
                  { lat, lng }
                );
                return;
              }

              // Buscar status do condutor da tabela active_conductors
              const statusData = await fetchConductorStatusFromActiveTable(
                newData.id
              );

              setActiveConductors((prev) => {
                const filtered = prev.filter((d) => d.id !== newData.id);
                return [
                  ...filtered,
                  {
                    id: newData.id,
                    lat: lat,
                    lng: lng,
                    isActive: true,
                    name: newData.name || "TukTuk",
                    status: statusData.status,
                    occupiedUntil: statusData.occupiedUntil,
                  },
                ];
              });
            } else {
              // Se ficou inativo, só remove
              setActiveConductors((prev) =>
                prev.filter((d) => d.id !== newData.id)
              );
            }
          }
        )
        .subscribe();

      // SUBSCRIÇÃO para mudanças na tabela active_conductors
      const activeChannel = supabase
        .channel("active_conductors_status")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "active_conductors",
          },
          async (payload) => {
            console.log(
              "🚀 Active conductors status change detected:",
              payload
            );

            if (
              payload.eventType === "UPDATE" ||
              payload.eventType === "INSERT"
            ) {
              const newData = payload.new as {
                conductor_id: string;
                is_available?: boolean;
                occupied_until?: string | null;
                is_active?: boolean;
              };

              if (newData.conductor_id && newData.is_active) {
                const status = newData.is_available ? "available" : "busy";

                console.log("📊 Updating conductor status:", {
                  conductorId: newData.conductor_id,
                  isAvailable: newData.is_available,
                  status: status,
                  occupiedUntil: newData.occupied_until,
                });

                setActiveConductors((prev) => {
                  const existingIndex = prev.findIndex(
                    (conductor) => conductor.id === newData.conductor_id
                  );

                  if (existingIndex >= 0) {
                    // Validar se o condutor existente tem coordenadas válidas
                    const existingConductor = prev[existingIndex];
                    if (
                      !isValidCoordinate(
                        existingConductor.lat,
                        existingConductor.lng
                      )
                    ) {
                      console.warn(
                        `⚠️ Condutor ${newData.conductor_id} tem coordenadas inválidas, ignorando atualização`
                      );
                      return prev;
                    }

                    const updated = [...prev];
                    updated[existingIndex] = {
                      ...updated[existingIndex],
                      status: status,
                      occupiedUntil: newData.occupied_until,
                    };
                    console.log(
                      "✅ Updated existing conductor:",
                      updated[existingIndex]
                    );
                    return updated;
                  } else {
                    console.log(
                      "🔍 Conductor not found in list, fetching full data..."
                    );

                    (async () => {
                      const { data: conductorData } = await supabase
                        .from("conductors")
                        .select("*")
                        .eq("id", newData.conductor_id)
                        .eq("is_active", true)
                        .single();

                      if (conductorData) {
                        const lat = conductorData.latitude || 37.725;
                        const lng = conductorData.longitude || -8.783;

                        if (!isValidCoordinate(lat, lng)) {
                          console.warn(
                            `⚠️ Coordenadas inválidas para novo condutor ${newData.conductor_id}:`,
                            { lat, lng }
                          );
                          return;
                        }

                        setActiveConductors((prevInner) => [
                          ...prevInner.filter(
                            (c) => c.id !== newData.conductor_id
                          ),
                          {
                            id: conductorData.id,
                            lat: lat,
                            lng: lng,
                            isActive: true,
                            name: conductorData.name || "TukTuk",
                            status: status,
                            occupiedUntil: newData.occupied_until,
                          },
                        ]);
                      }
                    })();
                    return prev;
                  }
                });
              }
            } else if (payload.eventType === "DELETE") {
              const oldData = payload.old as { conductor_id: string };
              console.log("🗑️ Removing conductor:", oldData.conductor_id);

              setActiveConductors((prev) =>
                prev.filter(
                  (conductor) => conductor.id !== oldData.conductor_id
                )
              );
            }
          }
        )
        .subscribe();

      // Corrigir o intervalo de atualização
      const statusRefreshInterval = setInterval(async () => {
        console.log("🔄 Refreshing conductor status (30s interval)");

        setActiveConductors((prev) => {
          // Usar Promise.all para aguardar todas as atualizações
          Promise.all(
            prev.map(async (conductor) => {
              // Validar coordenadas antes de atualizar
              if (!isValidCoordinate(conductor.lat, conductor.lng)) {
                console.warn(
                  `⚠️ Coordenadas inválidas para condutor ${conductor.id}, pulando atualização`
                );
                return conductor;
              }

              const updatedStatus = await fetchConductorStatusFromActiveTable(
                conductor.id
              );
              return {
                ...conductor,
                status: updatedStatus.status,
                occupiedUntil: updatedStatus.occupiedUntil,
              };
            })
          ).then((updatedConductors) => {
            setActiveConductors(updatedConductors);
          });

          return prev; // Retornar o estado anterior temporariamente
        });
      }, 30000);

      return () => {
        console.log("🧹 Cleaning up subscriptions");
        supabase.removeChannel(conductorChannel);
        supabase.removeChannel(activeChannel);
        clearInterval(statusRefreshInterval);
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
        // ✅ Calcular tempo estimado corretamente (em minutos)
        // Converter 15 km/h para m/s: (15 * 1000) / 3600 = 4.17 m/s
        const velocidadeMS = (VELOCIDADE_MEDIA_KMH * 1000) / 3600;
        const tempoSegundos = dist / velocidadeMS;
        const tempoMinutos = tempoSegundos / 60;
        setTempoEstimado(Math.round(tempoMinutos));
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
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    // Validar coordenadas do usuário
    if (isValidCoordinate(lat, lng)) {
      setUserPosition({ lat, lng });
      setShowUserLocation(true);
    } else {
      console.error("⚠️ Coordenadas do usuário inválidas:", { lat, lng });
      setShowUserLocation(false);
      setUserPosition(null);
    }
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

  // Função para renderizar o status do TukTuk (melhorada com logs)
  const renderTuktukStatus = () => {
    console.log("🎨 Rendering TukTuk status:", {
      activeConductors: activeConductors.length,
      firstConductor: activeConductors[0],
    }); // Debug

    if (activeConductors.length === 0) {
      return (
        <div className="absolute bottom-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded z-[1000]">
          <p className="text-sm">🚫 TukTuk offline</p>
        </div>
      );
    }

    const conductor = activeConductors[0];

    console.log("🎯 Conductor status details:", {
      id: conductor.id,
      status: conductor.status,
      occupiedUntil: conductor.occupiedUntil,
      name: conductor.name,
    }); // Debug

    if (conductor.status === "busy") {
      const occupiedUntil = conductor.occupiedUntil
        ? new Date(conductor.occupiedUntil)
        : null;

      const isStillOccupied = occupiedUntil ? occupiedUntil > new Date() : true; // Se não tem horário definido, assume que ainda está ocupado

      console.log("⏰ Busy status check:", {
        occupiedUntil: occupiedUntil?.toISOString(),
        currentTime: new Date().toISOString(),
        isStillOccupied,
      }); // Debug

      if (isStillOccupied) {
        return (
          <div className="absolute bottom-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded z-[1000] max-w-xs">
            <p className="text-sm font-semibold">
              🔴 TukTuk Neste Momento Está Ocupado
            </p>
            {occupiedUntil && (
              <p className="text-xs mt-1">
                Previsão de disponibilidade:{" "}
                {format(occupiedUntil, "HH:mm", { locale: pt })}
              </p>
            )}
          </div>
        );
      }
    }

    // Status "available" ou padrão (incluindo quando passou do horário de ocupação)
    return (
      <div className="absolute bottom-4 left-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded z-[1000]">
        <p className="text-sm">🟢 TukTuk Neste Momento Disponível</p>
      </div>
    );
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

          {/* Renderizar apenas condutores com coordenadas válidas */}
          {activeConductors[0] &&
            isValidCoordinate(
              activeConductors[0].lat,
              activeConductors[0].lng
            ) && (
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

          {/* Marcador da localização do usuário - com validação */}
          {showUserLocation &&
            mapRef.current &&
            userPosition &&
            isValidCoordinate(userPosition.lat, userPosition.lng) && (
              <UserLocationMarker
                map={mapRef.current}
                userPosition={userPosition}
                autoCenter={false}
                showAccuracy={true}
              />
            )}
        </MapContainer>

        {/* Calculador de distância - com validação */}
        {activeConductors.length > 0 &&
          activeConductors[0] &&
          isValidCoordinate(
            activeConductors[0].lat,
            activeConductors[0].lng
          ) && (
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
        {renderTuktukStatus()}
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
