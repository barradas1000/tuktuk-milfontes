// components/admin/AdminCalendar/AvailabilityTab.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import TuktukAvailabilityPanel from "./TuktukAvailabilityPanel";
import ActiveConductorsPanel from "./ActiveConductorsPanel";
import ConductorLocationCard from "./ConductorLocationCard";
import AdminTuktukMap from "./AdminTuktukMap";
import BlockedPeriodsPanel from "./BlockedPeriodsPanel";
import { useActiveConductors } from "@/hooks/useActiveConductors";

// Interface para representar os dados de disponibilidade
interface Occupant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface AvailabilityData {
  availableTimeSlots: string[];
  occupants: Occupant[];
  totalCapacity: number;
  [key: string]: unknown; // Para extensibilidade futura
}

type Props = {
  selectedDate: Date | null;
  getAvailabilityForDate?: (date: string) => Promise<AvailabilityData>;
};

export default function AvailabilityTab({
  selectedDate,
  getAvailabilityForDate,
  showGPSButton = false,
  onGPSButtonClick = () => {},
}: Props & {
  showGPSButton?: boolean;
  onGPSButtonClick?: () => void;
}) {
  // Estado para gerenciar a disponibilidade do TukTuk
  const [tuktukStatus, setTuktukStatus] = useState<"available" | "busy">(
    "available"
  );
  const [occupiedUntil, setOccupiedUntil] = useState<Date | null>(null);
  const [occupiedMinutes, setOccupiedMinutes] = useState(60);

  // Hook para obter condutores ativos
  const {
    conductors,
    loading: conductorsLoading,
    error: conductorsError,
  } = useActiveConductors();

  // Obter IDs dos condutores ativos
  const activeConductorIds = conductors
    .filter((c) => c.is_active)
    .map((c) => c.conductor_id);

  // Função para atualizar status do TukTuk
  const updateTuktukStatus = async (
    conductorId: string,
    status: "available" | "busy",
    until: Date | null
  ) => {
    try {
      // Aqui implementaríamos a lógica para atualizar no Supabase
      console.log(
        `Updating TukTuk status: ${conductorId}, ${status}, ${until}`
      );
      // TODO: Implementar chamada para API/Supabase
    } catch (error) {
      console.error("Error updating TukTuk status:", error);
    }
  };

  // Mock function para updateConductorStatus (já que não existe no hook atual)
  const updateConductorStatus = async (
    conductorId: string,
    newStatus: boolean
  ) => {
    console.log(`Mock update conductor ${conductorId} to ${newStatus}`);
    return true;
  };

  if (!selectedDate) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground text-center text-lg">
          Selecione uma data para ver a disponibilidade.
        </p>
      </div>
    );
  }

  // Obter condutor ativo (primeiro da lista)
  const activeConductor = conductors.find((c) => c.is_active);

  return (
    <div className="space-y-6">
      {/* TukTuk Availability Panel */}
      <div
        className={`p-4 bg-green-50 border border-green-200 rounded-xl flex flex-col gap-4 items-center shadow-md ${
          activeConductorIds.length !== 1
            ? "opacity-60 pointer-events-none"
            : ""
        }`}
      >
        <TuktukAvailabilityPanel
          tuktukStatus={tuktukStatus}
          setTuktukStatus={setTuktukStatus}
          occupiedUntil={occupiedUntil}
          setOccupiedUntil={setOccupiedUntil}
          occupiedMinutes={occupiedMinutes}
          setOccupiedMinutes={setOccupiedMinutes}
          activeConductorIds={activeConductorIds}
          updateTuktukStatus={updateTuktukStatus}
        />
      </div>

      {/* BOTÃO GPS LOGO APÓS O PAINEL DE DISPONIBILIDADE */}
      {showGPSButton && activeConductorIds.length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={onGPSButtonClick}
            className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg animate-pulse-scale"
          >
            🚦 Ativar Rastreamento GPS
          </Button>
        </div>
      )}

      {/* Card de localização do condutor ativo */}
      {activeConductor && (
        <ConductorLocationCard
          conductorId={activeConductor.conductor_id}
          conductorName={activeConductor.name || "Condutor Desconhecido"}
        />
      )}

      {/* Mapa de Milfontes com TukTuks ativos */}
      <AdminTuktukMap />

      {/* Visualização de Bloqueios */}
      <BlockedPeriodsPanel
        onBlock={(date, time, reason) => {
          console.log(`Bloqueando: ${date} ${time} - ${reason}`);
        }}
        onUnblock={(blockId) => {
          console.log(`Desbloqueando: ${blockId}`);
        }}
      />
    </div>
  );
}
