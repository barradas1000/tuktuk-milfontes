import { useState } from "react";
import { BlockedPeriod, AdminReservation } from "./types";

interface Conductor {
  id: string;
  name: string;
}

export function useAdminCalendarState() {
  // --- Estados do Componente ---
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quickViewDate, setQuickViewDate] = useState<Date | null>(null);

  // Estados relacionados a bloqueios
  const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [selectedDateReservations, setSelectedDateReservations] = useState<AdminReservation[]>([]);

  // Estados de modais
  const [blockDayModalOpen, setBlockDayModalOpen] = useState(false);
  const [blockHourModalOpen, setBlockHourModalOpen] = useState(false);
  const [cancelReservationModalOpen, setCancelReservationModalOpen] = useState(false);
  const [whatsappMessageModalOpen, setWhatsappMessageModalOpen] = useState(false);

  // Tuktuk / condutores
  const [tuktukStatus, setTuktukStatus] = useState<"available" | "busy">("available");
  const [occupiedUntil, setOccupiedUntil] = useState<Date | null>(null);
  const [occupiedMinutes, setOccupiedMinutes] = useState<number>(30);
  const [activeConductorIds, setActiveConductorIds] = useState<string[]>([]);
  const [conductors, setConductors] = useState<any[]>([]);
  const [conductorsLoading, setConductorsLoading] = useState(false);
  const [conductorsError, setConductorsError] = useState<string | null>(null);

  const handleDayClick = (date: Date) => {
    setCalendarDate(date);
    onDateSelect(date.toISOString());
  };

  const isValidDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(date);
    inputDate.setHours(0, 0, 0, 0);
    return inputDate >= today;
  };

  const unblockTime = (date: Date, time: string) => {
    console.log("unblockTime", date, time);
  };

  const blockTime = (date: Date, time: string, reason: string) => {
    console.log("blockTime", date, time, reason);
  };

  return {
    calendarDate,
    reservations,
    blockedPeriods,
    setBlockedPeriods,
    blockedPeriodsLoading,
    setBlockedPeriodsLoading,
    blockModalOpen,
    setBlockModalOpen,
    blockDate,
    setBlockDate,
    blockTab,
    setBlockTab,
    blockDayReason,
    setBlockDayReason,
    blockDaysStart,
    setBlockDaysStart,
    blockDaysEnd,
    setBlockDaysEnd,
    blockHourStart,
    setBlockHourStart,
    blockHourEnd,
    setBlockHourEnd,
    blockTimeReason,
    setBlockTimeReason,
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
    conductors,
    conductorsLoading,
    conductorsError,
  };
};
