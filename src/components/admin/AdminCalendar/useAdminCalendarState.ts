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
  const [blockedPeriodsLoading, setBlockedPeriodsLoading] = useState(true);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockDate, setBlockDate] = useState<Date | null>(null);
  const [blockTab, setBlockTab] = useState<"day" | "hour" | null>("day");

  // Estados para bloqueio de dia inteiro/intervalo de dias
  const [blockDayReason, setBlockDayReason] = useState("");
  const [blockDaysStart, setBlockDaysStart] = useState<string>("");
  const [blockDaysEnd, setBlockDaysEnd] = useState<string>("");

  // Estados para bloqueio de horários específicos
  const [blockHourStart, setBlockHourStart] = useState("09:00");
  const [blockHourEnd, setBlockHourEnd] = useState("10:00");
  const [blockTimeReason, setBlockTimeReason] = useState<{
    [key: string]: string;
  }>({});

  // Mock de dias inativos (poderia vir de uma API ou hook)
  const [inactiveDays] = useState<string[]>([
    "2025-07-10",
    "2025-07-11",
    "2025-07-12",
  ]);

  // Novos estados para modais separados
  const [blockDayModalOpen, setBlockDayModalOpen] = useState(false);
  const [blockHourModalOpen, setBlockHourModalOpen] = useState(false);
  // Estados para modal de tornar horário disponível
  const [makeAvailableModalOpen, setMakeAvailableModalOpen] = useState(false);
  const [slotToMakeAvailable, setSlotToMakeAvailable] = useState<string | null>(
    null
  );

  // --- Estados para bloqueio rápido e anulação de reservas ---
  const [quickBlockInfo, setQuickBlockInfo] = useState("");
  const [showCancelReservation, setShowCancelReservation] = useState(false);
  const [cancelledReservation, setCancelledReservation] =
    useState<AdminReservation | null>(null);

  // Estados para modal de anulação de reserva
  const [cancelReservationModalOpen, setCancelReservationModalOpen] =
    useState(false);
  const [reservationToCancel, setReservationToCancel] =
    useState<AdminReservation | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // Estados para edição de mensagens do WhatsApp
  const [whatsappMessageModalOpen, setWhatsappMessageModalOpen] =
    useState(false);
  const [editableMessage, setEditableMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "confirmed" | "cancelled" | "custom"
  >("confirmed");
  const [reservationForMessage, setReservationForMessage] =
    useState<AdminReservation | null>(null);

  // --- Estados para seleção de condutores ---
  const [activeConductors, setActiveConductors] = useState<string[]>([]);
  const [conductorsLoading, setConductorsLoading] = useState(true);
  const [conductors, setConductors] = useState<Conductor[]>([]);
  // Novo estado para seleção do motorista para rastreamento
  const [selectedConductorId, setSelectedConductorId] = useState<string>("");

  // Estados para filtros de bloqueios
  const [blockFilterDate, setBlockFilterDate] = useState<string>("");
  const [blockFilterType, setBlockFilterType] = useState<
    "all" | "days" | "hours"
  >("all");
  const [isCleaningDuplicates, setIsCleaningDuplicates] = useState(false);
  const [sliderDays, setSliderDays] = useState<Date[]>([]);
  const [selectedSliderDate, setSelectedSliderDate] = useState<Date>(
    new Date()
  );

  return {
    calendarDate,
    setCalendarDate,
    quickViewOpen,
    setQuickViewOpen,
    quickViewDate,
    setQuickViewDate,
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
    makeAvailableModalOpen,
    setMakeAvailableModalOpen,
    slotToMakeAvailable,
    setSlotToMakeAvailable,
    quickBlockInfo,
    setQuickBlockInfo,
    showCancelReservation,
    setShowCancelReservation,
    cancelledReservation,
    setCancelledReservation,
    cancelReservationModalOpen,
    setCancelReservationModalOpen,
    reservationToCancel,
    setReservationToCancel,
    cancelReason,
    setCancelReason,
    isCancelling,
    setIsCancelling,
    whatsappMessageModalOpen,
    setWhatsappMessageModalOpen,
    editableMessage,
    setEditableMessage,
    messageType,
    setMessageType,
    reservationForMessage,
    setReservationForMessage,
    activeConductors,
    setActiveConductors,
    conductorsLoading,
    setConductorsLoading,
    conductors,
    setConductors,
    selectedConductorId,
    setSelectedConductorId,
    blockFilterDate,
    setBlockFilterDate,
    blockFilterType,
    setBlockFilterType,
    isCleaningDuplicates,
    setIsCleaningDuplicates,
    sliderDays,
    setSliderDays,
    selectedSliderDate,
    setSelectedSliderDate,
  };
}
