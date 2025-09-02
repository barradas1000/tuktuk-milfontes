// src/components/admin/AdminCalendar/useAdminCalendarState.ts
import { useState, useEffect } from "react";
import { AvailabilitySlot, AdminReservation, BlockedPeriod } from "./types";

interface UseAdminCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export const useAdminCalendar = ({ selectedDate, onDateSelect }: UseAdminCalendarProps) => {
  const [calendarDate, setCalendarDate] = useState(new Date(selectedDate));
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
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
    availabilitySlots,
    selectedDateReservations,
    handleDayClick,
    isValidDate,
    unblockTime,
    blockTime,
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
