import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { useActiveConductors } from "@/hooks/useActiveConductors";
import {
  fetchConductors,
  updateActiveConductors,
} from "@/services/supabaseService";
import { MapPin, Loader2 } from "lucide-react";
import type { Conductor } from "@/types/conductor";

interface ActiveConductorsPanelProps {
  conductors: ReturnType<typeof useActiveConductors>["conductors"];
  renderAfterActiveBlock?: (params: {
    activeConductors: string[];
    activeConductorsWithNames: { id: string; name: string }[];
  }) => React.ReactNode;
}

const ActiveConductorsPanel: React.FC<ActiveConductorsPanelProps> = ({
  conductors,
  renderAfterActiveBlock,
}) => {
  const { activeConductors: initialActiveConductors, setActiveConductors, loading } =
    useActiveConductors();
  const [activeConductors, setActiveConductorsLocal] = useState<string[]>(
    initialActiveConductors
  );
  const [locationStatus, setLocationStatus] = useState<
    Record<string, { status: "green" | "yellow" | "red"; error?: string }>
  >({});

  // Sincronizar com o hook
  useEffect(() => {
    setActiveConductorsLocal(initialActiveConductors);
  }, [initialActiveConductors]);

  useEffect(() => {
    // Simular atualização de status GPS
    const updateGPSStatus = () => {
      setLocationStatus((prev) => {
        const newStatus = { ...prev };
        conductors.forEach((c) => {
          // Simular status baseado em probabilidades
          const random = Math.random();
          if (random > 0.7) {
            newStatus[c.conductor_id] = { status: "green", error: undefined };
          } else if (random > 0.5) {
            newStatus[c.conductor_id] = { status: "yellow", error: undefined };
          } else {
            newStatus[c.conductor_id] = {
              status: "red",
              error: "Localização indisponível",
            };
          }
        });
        return newStatus;
      });
    };

    updateGPSStatus();
    const interval = setInterval(updateGPSStatus, 30000); // A cada 30s

    return () => clearInterval(interval);
  }, [conductors]);

  const handleToggle = async (conductorId: string, checked: boolean) => {
    const newActiveConductors = checked
      ? [...activeConductors, conductorId]
      : activeConductors.filter((id) => id !== conductorId);

    setActiveConductorsLocal(newActiveConductors);

    try {
      await updateActiveConductors(newActiveConductors);
      setActiveConductors(newActiveConductors);
    } catch (error) {
      console.error("Erro ao atualizar condutor ativo:", error);
      // Reverter estado em caso de erro
      setActiveConductorsLocal(activeConductors);
    }
  };

  const getCurrentWhatsapp = () => {
    if (activeConductors.length === 1) {
      const conductor = conductors.find(
        (c) => c.conductor_id === activeConductors[0]
      );
      return conductor?.whatsapp || "351963496320";
    }
    if (activeConductors.length > 1) {
      // Quando houver múltiplos ativos, pode escolher o primeiro
      const conductor = conductors.find(
        (c) => c.conductor_id === activeConductors[0]
      );
      return conductor?.whatsapp || "351963496320";
    }
    return "351963496320"; // WhatsApp padrão
  };

  const activeConductorsData =
    activeConductors.length > 0
      ? conductors.filter((c) => activeConductors.includes(c.conductor_id))
      : [];

  // Debug logs
  console.log("ActiveConductorsPanel render:", {
    conductorsCount: conductors.length,
    activeConductorsCount: activeConductors.length,
    initialActiveConductorsCount: initialActiveConductors.length,
    locationStatusCount: Object.keys(locationStatus).length,
  });

  return (
    <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl flex flex-col gap-3 items-center shadow-md">
      <h2 className="text-lg font-bold text-purple-900 mb-2">
        Condutores Ativos
      </h2>

      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        {conductors.map((conductor) => {
          const isActive = activeConductors.includes(conductor.conductor_id);
          const status =
            locationStatus[conductor.conductor_id]?.status || "red";
          const error = locationStatus[conductor.conductor_id]?.error || null;

          return (
            <div
              key={conductor.conductor_id}
              className="flex items-center gap-3 bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200"
            >
              <span className="font-semibold text-gray-800 min-w-[90px] flex items-center gap-2">
                {conductor.name}

                {/* ÍCONE GPS (BASEADO NA ESPECIFICAÇÃO DO DOCUMENTO) */}
                {status === "green" && (
                  <span title="Localização ativa">
                    <MapPin className="w-5 h-5 text-green-900" />
                  </span>
                )}
                {status === "yellow" && (
                  <span title="A tentar obter localização">
                    <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
                  </span>
                )}
                {status === "red" && (
                  <span title={error || "Sem localização"}>
                    <MapPin className="w-5 h-5 text-red-500" />
                  </span>
                )}

                <span className="ml-2 text-xs text-gray-500">
                  ({conductor.whatsapp})
                </span>
              </span>

              <Switch
                checked={isActive}
                onCheckedChange={(checked) =>
                  handleToggle(conductor.conductor_id, checked)
                }
                id={`switch-${conductor.conductor_id}`}
              />

              <span
                className={
                  isActive ? "text-green-600 font-semibold" : "text-gray-400"
                }
              >
                {isActive ? "Ativo" : "Inativo"}
              </span>
            </div>
          );
        })}
      </div>

      {/* DISPLAY DINÂMICO DO WHATSAPP RESPONSÁVEL */}
      <div className="mt-4 text-base text-purple-900 font-semibold">
        WhatsApp responsável:{" "}
        <span className="text-purple-700">{getCurrentWhatsapp()}</span>
      </div>

      {/* Renderização adicional conforme especificado */}
      {renderAfterActiveBlock &&
        renderAfterActiveBlock({
          activeConductors,
          activeConductorsWithNames: activeConductorsData.map((c) => ({
            id: c.conductor_id,
            name: c.name,
          })),
        })}
    </div>
  );
};

export default ActiveConductorsPanel;
