// src/components/admin/AdminCalendar/useAdminCalendarState.ts
import { useState } from "react";

// Interface para slots de disponibilidade
interface AvailabilitySlot {
  time: string;
  available: boolean;
  reason?: string;
}

// Interface para condutor
interface Conductor {
  id: string;
  name: string;
  is_active: boolean;
  conductor_id: string;
}

// Estados básicos do hook de calendário administrativo
export function useAdminCalendarState() {
  // Estados do Componente
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quickViewDate, setQuickViewDate] = useState<Date | null>(null);

  // Estados relacionados a disponibilidade
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);

  // Estados de modais
  const [blockDayModalOpen, setBlockDayModalOpen] = useState(false);
  const [blockHourModalOpen, setBlockHourModalOpen] = useState(false);
  const [cancelReservationModalOpen, setCancelReservationModalOpen] = useState(false);
  const [whatsappMessageModalOpen, setWhatsappMessageModalOpen] = useState(false);

  // Estados do TukTuk
  const [tuktukStatus, setTuktukStatus] = useState<"available" | "busy">("available");
  const [occupiedUntil, setOccupiedUntil] = useState<Date | null>(null);
  const [occupiedMinutes, setOccupiedMinutes] = useState<number>(30);
  const [activeConductorIds, setActiveConductorIds] = useState<string[]>([]);
  const [conductors, setConductors] = useState<Conductor[]>([]);
  const [conductorsLoading, setConductorsLoading] = useState(false);
  const [conductorsError, setConductorsError] = useState<string | null>(null);

  // Função para validação de datas
  const isValidDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(date);
    inputDate.setHours(0, 0, 0, 0);
    return inputDate >= today;
  };

  // Função para desbloquear horário
  const unblockTime = (date: Date, time: string) => {
    console.log("Desbloquear horário:", date, time);
    // TODO: Implementar lógica de desbloqueio
  };

  // Função para bloquear horário
  const blockTime = (date: Date, time: string, reason: string) => {
    console.log("Bloquear horário:", date, time, reason);
    // TODO: Implementar lógica de bloqueio
  };

  // Função para clique no dia
  const handleDayClick = (date: Date) => {
    setCalendarDate(date);
    // TODO: Implementar callback para data selecionada
  };

  // Retornar apenas os valores definidos
  return {
    calendarDate,
    setCalendarDate,
    quickViewOpen,
    setQuickViewOpen,
    quickViewDate,
    setQuickViewDate,
    availabilitySlots,
    setAvailabilitySlots,
    blockDayModalOpen,
    setBlockDayModalOpen,
    blockHourModalOpen,
    setBlockHourModalOpen,
    cancelReservationModalOpen,
    setCancelReservationModalOpen,
    whatsappMessageModalOpen,
    setWhatsappMessageModalOpen,
    tuktukStatus,
    setTuktukStatus,
    occupiedUntil,
    setOccupiedUntil,
    occupiedMinutes,
    setOccupiedMinutes,
    activeConductorIds,
    setActiveConductorIds,
    conductors,
    setConductors,
    conductorsLoading,
    setConductorsLoading,
    conductorsError,
    setConductorsError,
    isValidDate,
    unblockTime,
    blockTime,
    handleDayClick,
  };
}
