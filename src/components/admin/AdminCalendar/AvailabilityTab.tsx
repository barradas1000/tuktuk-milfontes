// components/admin/AdminCalendar/AvailabilityTab.tsx
import React, { useState } from "react";
import TuktukAvailabilityPanel from "./TuktukAvailabilityPanel";

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

export default function AvailabilityTab({ selectedDate, getAvailabilityForDate }: Props) {
  // Estado para gerenciar a disponibilidade do TukTuk
  const [tuktukStatus, setTuktukStatus] = useState<"available" | "busy">("available");
  const [occupiedUntil, setOccupiedUntil] = useState<Date | null>(null);
  const [occupiedMinutes, setOccupiedMinutes] = useState(60);
  const [activeConductorIds, setActiveConductorIds] = useState<string[]>([]);

  // Função para atualizar status do TukTuk
  const updateTuktukStatus = async (
    conductorId: string,
    status: "available" | "busy",
    until: Date | null
  ) => {
    try {
      // Aqui implementaríamos a lógica para atualizar no Supabase
      console.log(`Updating TukTuk status: ${conductorId}, ${status}, ${until}`);
      // TODO: Implementar chamada para API/Supabase
    } catch (error) {
      console.error("Error updating TukTuk status:", error);
    }
  };

  if (!selectedDate) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Selecione uma data para ver a disponibilidade.</p>
      </div>
    );
  }

  // TODO: Carregar dados reais dos condutores ativos
  // Por enquanto, simular com dados vazios
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        Disponibilidade para {selectedDate.toLocaleDateString('pt-PT')}
      </h2>

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

      {/* Espaço para funcionalidades futuras, como calendário de disponibilidade */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Horários Disponíveis</h3>
        <p className="text-sm text-gray-600">
          Funcionalidade em desenvolvimento. Aqui será exibido o calendário de disponibilidade detalhada.
        </p>
      </div>
    </div>
  );
}
