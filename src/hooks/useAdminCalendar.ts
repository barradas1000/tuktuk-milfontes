import { useState, useMemo, useCallback, useEffect } from "react";
import { format, eachDayOfInterval, isAfter } from "date-fns";
import { pt } from "date-fns/locale";
import { useAdminReservations } from "@/hooks/useAdminReservations";
import { useActiveConductors } from "@/hooks/useActiveConductors";
import {
  fetchBlockedPeriods,
  createBlockedPeriod,
  deleteBlockedPeriodsByDate,
  fetchActiveConductors,
  updateActiveConductors,
  fetchConductors,
  cleanDuplicateBlockedPeriods,
  updateTuktukStatus,
  fetchTuktukStatus,
} from "@/services/supabaseService";
import { BlockedPeriod } from "@/types/adminReservations";
import { AdminReservation } from "@/types/adminReservations";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "@supabase/auth-helpers-react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import {
  timeSlots,
  sliderStyles,
  FALLBACK_CONDUCTORS,
  isValidDate,
  getTourDisplayName,
  getTourDisplayNameTranslated,
  interpolateMessage,
  getClientLanguage,
  getTranslatedMessage,
  getWhatsappLink,
  useSyncActiveConductors,
} from "@/utils/calendarUtils";
import { safeParseDate } from "@/utils/dateUtils";
import { getAvailabilityWithBlocks } from "@/utils/reservationUtils";

export const useAdminCalendar = (selectedDate: string, onDateSelect: (date: string) => void) => {
  const [showCard, setShowCard] = useState(true);
  const {
    getReservationsByDate,
    getAvailabilityForDate,
    updateReservation,
    refetch,
  } = useAdminReservations();
  const { toast } = useToast();
  const { t } = useTranslation();
  const {
    conductors,
    loading: conductorsLoading,
    error: conductorsError,
    updateConductorStatus,
  } = useActiveConductors();

  const [calendarDate, setCalendarDate] = useState<Date>(() => {
    const date = safeParseDate(selectedDate);
    return date || new Date();
  });
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quickViewDate, setQuickViewDate] = useState<Date | null>(null);

  const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([]);
  const [blockedPeriodsLoading, setBlockedPeriodsLoading] = useState(true);
  const [isLoadingBlockedPeriods, setIsLoadingBlockedPeriods] = useState(true);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockDate, setBlockDate] = useState<Date | null>(null);
  const [blockTab, setBlockTab] = useState<"day" | "hour" | null>("day");

  const [blockDayReason, setBlockDayReason] = useState("");
  const [blockDaysStart, setBlockDaysStart] = useState<string>("");
  const [blockDaysEnd, setBlockDaysEnd] = useState<string>("");

  const [blockHourStart, setBlockHourStart] = useState("09:00");
  const [blockHourEnd, setBlockHourEnd] = useState("10:00");
  const [blockTimeReason, setBlockTimeReason] = useState<{
    [key: string]: string;
  }>({});

  const [inactiveDays] = useState<string[]>([
    "2025-07-10",
    "2025-07-11",
    "2025-07-12",
  ]);

  const [blockDayModalOpen, setBlockDayModalOpen] = useState(false);
  const [blockHourModalOpen, setBlockHourModalOpen] = useState(false);
  const [makeAvailableModalOpen, setMakeAvailableModalOpen] = useState(false);
  const [slotToMakeAvailable, setSlotToMakeAvailable] = useState<string | null>(
    null
  );

  const [quickBlockInfo, setQuickBlockInfo] = useState("");
  const [showCancelReservation, setShowCancelReservation] = useState(false);
  const [cancelledReservation, setCancelledReservation] =
    useState<AdminReservation | null>(null);

  const [cancelReservationModalOpen, setCancelReservationModalOpen] =
    useState(false);
  const [reservationToCancel, setReservationToCancel] =
    useState<AdminReservation | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const [whatsappMessageModalOpen, setWhatsappMessageModalOpen] =
    useState(false);
  const [editableMessage, setEditableMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "confirmed" | "cancelled" | "custom"
  >("confirmed");
  const [reservationForMessage, setReservationForMessage] =
    useState<AdminReservation | null>(null);

  const [selectedConductorId, setSelectedConductorId] = useState<string>("");
  const [tuktukStatus, setTuktukStatus] = useState<"available" | "busy">(
    "available"
  );

  const activeConductorIds = conductors.filter(c => c.is_active).map(c => c.id);

  const [occupiedMinutes, setOccupiedMinutes] = useState(30);
  const [occupiedUntil, setOccupiedUntil] = useState<Date | null>(null);

  useEffect(() => {
    const activeConductorsFromHook = conductors.filter(c => c.is_active);
    if (activeConductorsFromHook.length === 1) {
      const conductorId = activeConductorsFromHook[0].id;
      fetchTuktukStatus(conductorId).then((data) => {
        if (data) {
          setTuktukStatus(data.status || "available");
          setOccupiedUntil(
            data.occupied_until ? new Date(data.occupied_until) : null
          );
        }
      });
    }
  }, [conductors]);

  const [blockFilterDate, setBlockFilterDate] = useState<string>("");
  const [blockFilterType, setBlockFilterType] = useState<
    "all" | "days" | "hours"
  >("all");
  const [isCleaningDuplicates, setIsCleaningDuplicates] = useState(false);
  const [sliderDays, setSliderDays] = useState<Date[]>([]);
  const [selectedSliderDate, setSelectedSliderDate] = useState<Date>(
    new Date()
  );

  const [blockedDates, setBlockedDates] = useState<string[]>([]); // Exemplo: ["2025-12-25", "2025-01-01"]

  const session = useSession();
  const userEmail = session?.user?.email || "admin";

  const cancelReservation = async (
    reservation: AdminReservation,
    reason: string = ""
  ) => {
    setIsCancelling(true);
    try {
      await updateReservation({ id: reservation.id, status: "cancelled" });
      refetch();
      setCancelReservationModalOpen(false);
      setReservationToCancel(null);
      setCancelReason("");
      openWhatsappMessageEditor(reservation, "cancelled");
      toast({
        title: "Reserva anulada com sucesso",
        description: `A reserva de ${reservation.customer_name} foi anulada. Agora pode editar a mensagem para o cliente.`,
      });
    } catch (error) {
      console.error("Erro ao anular reserva:", error);
      toast({
        title: "Erro ao anular reserva",
        description: "Ocorreu um erro ao anular a reserva. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const openWhatsappMessageEditor = (
    reservation: AdminReservation,
    type: "confirmed" | "cancelled" | "custom" = "confirmed"
  ) => {
    setReservationForMessage(reservation);
    setMessageType(type);

    let baseMessage = "";
    const clientLanguage = getClientLanguage(reservation);
    const variables = {
      name: reservation.customer_name,
      email: reservation.customer_email,
      phone: reservation.customer_phone,
      tour_type: getTourDisplayNameTranslated(
        reservation.tour_type,
        clientLanguage
      ),
      reservation_date: reservation.reservation_date,
      reservation_time: reservation.reservation_time,
      number_of_people: reservation.number_of_people?.toString() || "",
      message: reservation.special_requests || "",
      total_price: reservation.total_price?.toString() || "",
      created_at: reservation.created_at
        ? new Date(reservation.created_at).toLocaleString(clientLanguage)
        : "",
    };

    if (type === "confirmed") {
      baseMessage = getTranslatedMessage(reservation, "confirmed", variables);
    } else if (type === "cancelled") {
      baseMessage = getTranslatedMessage(reservation, "cancelled", variables);
    } else {
      const currentLanguage = i18n.language;
      i18n.changeLanguage(clientLanguage);

      let greeting = "Olá";
      if (clientLanguage === "en") greeting = "Hello";
      else if (clientLanguage === "es") greeting = "Hola";
      else if (clientLanguage === "fr") greeting = "Bonjour";
      else if (clientLanguage === "de") greeting = "Hallo";
      else if (clientLanguage === "it") greeting = "Ciao";
      else if (clientLanguage === "nl") greeting = "Hallo";

      i18n.changeLanguage(currentLanguage);
      baseMessage = `${greeting} ${reservation.customer_name}, `;
    }

    setEditableMessage(baseMessage);
    setWhatsappMessageModalOpen(true);
  };

  const sendWhatsappMessage = () => {
    if (reservationForMessage && editableMessage.trim()) {
      const whatsappLink = getWhatsappLink(
        reservationForMessage.customer_phone,
        editableMessage
      );
      window.open(whatsappLink, "_blank");
      setWhatsappMessageModalOpen(false);
      setReservationForMessage(null);
      setEditableMessage("");

      toast({
        title: "WhatsApp aberto",
        description: `A mensagem foi preparada e o WhatsApp do cliente (${reservationForMessage.customer_phone}) foi aberto.`,
      });
    }
  };

  const getDayStatus = useCallback(
    (date: Date) => {
      if (!isValidDate(date)) return "inactive";
      try {
        const dateString = format(date, "yyyy-MM-dd");
        if (inactiveDays.includes(dateString)) return "inactive";
        const reservas = getReservationsByDate(dateString) || [];
        if (reservas.length === 0) return "empty";
        if (reservas.length <= 2) return "low";
        if (reservas.length <= 4) return "medium";
        return "full";
      } catch (error) {
        console.error("Error formatting date in getDayStatus:", date, error);
        return "inactive";
      }
    },
    [getReservationsByDate, inactiveDays]
  );

  const isDayBlocked = useCallback(
    (date: Date) => {
      if (!isValidDate(date)) return true;
      const dateString = format(date, "yyyy-MM-dd");
      return blockedPeriods.some(
        (b) => b.date === dateString && !b.startTime && !b.endTime
      );
    },
    [blockedPeriods]
  );

  const getDayBlockReason = useCallback(
    (date: Date) => {
      const dateString = format(date, "yyyy-MM-dd");
      const block = blockedPeriods.find(
        (b) => b.date === dateString && !b.startTime && !b.endTime
      );
      return block?.reason || "Dia bloqueado";
    },
    [blockedPeriods]
  );

  const isTimeBlocked = useCallback(
    (date: Date, time: string) => {
      const dateString = format(date, "yyyy-MM-dd");
      const adminBlocked = blockedPeriods.some(
        (b) => b.date === dateString && b.startTime === time
      );
      const hasConfirmedReservation = getReservationsByDate(dateString).some(
        (r) => r.reservation_time === time && r.status === "confirmed"
      );
      return adminBlocked || hasConfirmedReservation;
    },
    [blockedPeriods, getReservationsByDate]
  );

  const isBlockedByReservation = useCallback(
    (date: Date, time: string) => {
      const dateString = format(date, "yyyy-MM-dd");
      return getReservationsByDate(dateString).some(
        (r) => r.reservation_time === time && r.status === "confirmed"
      );
    },
    [getReservationsByDate]
  );

  const isBlockedByAdmin = useCallback(
    (date: Date, time: string) => {
      const dateString = format(date, "yyyy-MM-dd");
      return blockedPeriods.some(
        (b) => b.date === dateString && b.startTime === time
      );
    },
    [blockedPeriods]
  );

  const getTimeBlockReason = useCallback(
    (date: Date, time: string) => {
      const dateString = format(date, "yyyy-MM-dd");

      const confirmedReservation = getReservationsByDate(dateString).find(
        (r) => r.reservation_time === time && r.status === "confirmed"
      );

      if (confirmedReservation) {
        return `Reserva confirmada: ${confirmedReservation.customer_name}`;
      }

      const adminBlock = blockedPeriods.find(
        (b) => b.date === dateString && b.startTime === time
      );

      if (adminBlock) {
        return adminBlock.reason || "Bloqueado pelo administrador";
      }

      return "Horário bloqueado";
    },
    [blockedPeriods, getReservationsByDate]
  );

  const getAllDayBlocks = useCallback(
    (date: Date) => {
      const dateString = format(date, "yyyy-MM-dd");
      return blockedPeriods.filter((b) => b.date === dateString);
    },
    [blockedPeriods]
  );

  const getFilteredBlocks = useCallback(() => {
    let filtered = blockedPeriods;

    if (blockFilterType === "days") {
      filtered = filtered.filter((b) => !b.startTime);
    } else if (blockFilterType === "hours") {
      filtered = filtered.filter((b) => b.startTime);
    }

    if (blockFilterDate) {
      filtered = filtered.filter((b) => b.date === blockFilterDate);
    }

    return filtered;
  }, [blockedPeriods, blockFilterType, blockFilterDate]);

  const blockDay = useCallback(
    async (date: Date, reason: string) => {
      const dateString = format(date, "yyyy-MM-dd");
      try {
        const alreadyBlocked = blockedPeriods.some(
          (b) => b.date === dateString && !b.startTime && !b.endTime
        );

        if (alreadyBlocked) return;

        const newBlock = await createBlockedPeriod({
          date: dateString,
          reason,
          createdBy: userEmail,
        });

        setBlockedPeriods((prev) => [...prev, newBlock]);
      } catch (error) {
        console.error("Error blocking day:", error);
      }
    },
    [blockedPeriods, userEmail]
  );

  const unblockDay = useCallback(async (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    try {
      await deleteBlockedPeriodsByDate(dateString);
      setBlockedPeriods((prev) =>
        prev.filter(
          (b) => !(b.date === dateString && !b.startTime && !b.endTime)
        )
      );
      setBlockDayModalOpen(false);
    } catch (error) {
      console.error("Error unblocking day:", error);
      alert("Erro ao desbloquear o dia. Tente novamente.");
    }
  }, []);

  const blockTime = useCallback(
    async (date: Date, time: string, reason: string) => {
      const dateString = format(date, "yyyy-MM-dd");
      const alreadyBlocked = blockedPeriods.some(
        (b) => b.date === dateString && b.startTime === time
      );
      if (alreadyBlocked) {
        toast({
          title: `Horário já bloqueado`,
          description: `O horário ${time} já está bloqueado para o dia ${dateString}.`,
          variant: "destructive",
        });
        return;
      }
      try {
        const newBlock = await createBlockedPeriod({
          date: dateString,
          startTime: time,
          endTime: time,
          reason,
          createdBy: userEmail,
        });
        setBlockedPeriods((prev) => {
          const updated = [...prev, newBlock];
          return updated;
        });
        toast({
          title: `Horário ${time} bloqueado com sucesso!`,
          variant: "success",
        });
      } catch (error) {
        toast({
          title: "Erro ao bloquear o horário",
          description: error instanceof Error ? error.message : String(error),
          variant: "destructive",
        });
      }
    },
    [blockedPeriods, userEmail, toast]
  );

  const unblockTime = useCallback(
    async (date: Date, time: string) => {
      const dateString = format(date, "yyyy-MM-dd");
      const reservasNoHorario = getReservationsByDate(dateString).filter(
        (r) => r.reservation_time === time && r.status !== "cancelled"
      );
      if (reservasNoHorario.length > 0) {
        toast({
          title: `Não é possível desbloquear`,
          description: `Já existe uma reserva para o horário ${time}. Cancele a reserva antes de desbloquear.`,
          variant: "destructive",
        });
        return;
      }
      try {
        await deleteBlockedPeriodsByDate(dateString, time);
        setBlockedPeriods((prev) =>
          prev.filter((b) => !(b.date === dateString && b.startTime === time))
        );
      } catch (error) {
        console.error("Error unblocking time:", error);
        alert("Erro ao desbloquear o horário. Tente novamente.");
      }
    },
    [getReservationsByDate, toast]
  );

  const makeTimeAvailable = useCallback(
    async (date: Date, time: string) => {
      const dateString = format(date, "yyyy-MM-dd");
      try {
        await deleteBlockedPeriodsByDate(dateString, time);
        setBlockedPeriods((prev) =>
          prev.filter((b) => !(b.date === dateString && b.startTime === time))
        );
        toast({
          title: `Horário ${time} tornado disponível!`,
          variant: "success",
        });
      } catch (error) {
        console.error("Error making time available:", error);
        toast({
          title: "Erro ao tornar horário disponível",
          description: error instanceof Error ? error.message : String(error),
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const handleBlockDaysRange = useCallback(() => {
    if (!blockDaysStart || !blockDaysEnd) return;
    const start = new Date(blockDaysStart);
    const end = new Date(blockDaysEnd);

    if (isAfter(start, end)) {
      alert("A data de início não pode ser depois da data de fim.");
      return;
    }

    const days = eachDayOfInterval({ start, end });
    days.forEach((day) => blockDay(day, blockDayReason));
  }, [blockDaysStart, blockDaysEnd, blockDayReason, blockDay]);

  const blockTimeRange = useCallback(
    async (date: Date, startTime: string, endTime: string, reason: string) => {
      const dateString = format(date, "yyyy-MM-dd");
      try {
        const startIndex = timeSlots.indexOf(startTime);
        const endIndex = timeSlots.indexOf(endTime);

        if (startIndex === -1 || endIndex === -1) {
          alert("Horários não encontrados nos slots disponíveis.");
          return;
        }

        if (startIndex > endIndex) {
          alert("Horário de início deve ser menor que o horário de fim.");
          return;
        }

        for (let i = startIndex; i <= endIndex; i++) {
          const time = timeSlots[i];
          await blockTime(date, time, reason);
        }
      } catch (error) {
        console.error("Error blocking time range:", error);
        alert("Erro ao bloquear o intervalo. Tente novamente.");
      }
    },
    [blockTime]
  );

  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      if (date) {
        const dateString = format(date, "yyyy-MM-dd");
        setCalendarDate(date);
        onDateSelect(dateString);
      }
    },
    [onDateSelect]
  );

  const handleDayClick = useCallback(
    (date: Date | undefined) => {
      if (!date) return;

      if (isDayBlocked(date)) {
        const hasConfirmedReservations = getReservationsByDate(
          format(date, "yyyy-MM-dd")
        ).some((r) => r.status === "confirmed");

        if (hasConfirmedReservations) {
          toast({
            title: "Não é possível desbloquear",
            description:
              "Este dia tem reservas confirmadas. Cancele as reservas primeiro.",
            variant: "destructive",
          });
          return;
        }

        unblockDay(date);
        toast({
          title: "Dia desbloqueado",
          description: `O dia ${format(
            date,
            "dd/MM"
          )} foi desbloqueado com sucesso.`,
          variant: "success",
        });
        return;
      }

      setBlockDate(date);
      setBlockDayReason("");
      setBlockDayModalOpen(true);
    },
    [isDayBlocked, getReservationsByDate, unblockDay, toast]
  );

  const openBlockModalForDate = useCallback(
    (date: Date) => {
      setBlockDate(date);
      setBlockDaysStart(format(date, "yyyy-MM-dd"));
      setBlockDaysEnd(format(date, "yyyy-MM-dd"));
      setBlockTab("day");
      setBlockDayReason(getDayBlockReason(date));
      setBlockModalOpen(true);
    },
    [getDayBlockReason]
  );

  const getDayLabel = (status: string) => {
    switch (status) {
      case "inactive":
        return "Serviço não ativo";
      case "empty":
        return "Sem reservas";
      case "low":
        return "Poucas reservas";
      case "medium":
        return "Várias reservas";
      case "full":
        return "Cheio";
      default:
        return "";
    }
  };

  const getStatusBadgeConfig = useCallback((status: string) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: "AlertCircle",
        text: "Pendente",
      },
      confirmed: {
        color: "bg-green-100 text-green-800",
        icon: "CheckCircle",
        text: "Confirmada",
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        icon: "XCircle",
        text: "Cancelada",
      },
      completed: {
        color: "bg-blue-100 text-blue-800",
        icon: "CheckCircle",
        text: "Concluída",
      },
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  }, []);

  function getCurrentWhatsapp() {
    const active = conductors.filter(c => c.is_active);

    if (active.length === 1) {
      return active[0].conductors?.whatsapp || "351968784043";
    }
    
    const fallbackConductor = conductors.find(c => c.name === "Condutor 2");
    return fallbackConductor?.conductors?.whatsapp || "351968784043";
  }

  const confirmOccupiedTime = async () => {
    if (activeConductorIds.length > 0) {
      const conductorId = activeConductorIds[0];

      const occupiedUntil = new Date();
      occupiedUntil.setMinutes(occupiedUntil.getMinutes() + occupiedMinutes);

      try {
        await updateTuktukStatus(conductorId, "busy", occupiedUntil);
        setOccupiedUntil(occupiedUntil);
        toast({
          title: "Status atualizado",
          description: `TukTuk ficará ocupado até ${occupiedUntil.toLocaleTimeString()}`,
        });
      } catch (error) {
        console.error("Erro ao atualizar status:", error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o status",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    setCalendarDate(new Date(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    const loadDataForDate = async () => {
      try {
        setIsLoadingBlockedPeriods(true);
        const data = await fetchBlockedPeriods();
        setBlockedPeriods(data.map(b => ({
          ...b,
          createdAt: safeParseDate(b.createdAt),
          date: safeParseDate(b.date),
          startTime: safeParseDate(b.startTime),
          endTime: safeParseDate(b.endTime),
        })));
      } catch (error) {
        console.error("Error loading data for date:", error);
      } finally {
        setIsLoadingBlockedPeriods(false);
      }
    };

    loadDataForDate();
  }, [calendarDate]);

  useEffect(() => {
    const generateNextDays = () => {
      const today = new Date();
      const nextDays: Date[] = [];

      for (let i = 0; i < 10; i++) {
        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + i);
        nextDays.push(nextDay);
      }

      setSliderDays(nextDays);
      setSelectedSliderDate(today);
    };

    generateNextDays();
  }, []);

  const handleSliderDateSelect = (date: Date) => {
    setSelectedSliderDate(date);
    setCalendarDate(date);
    const dateString = format(date, "yyyy-MM-dd");
    onDateSelect(dateString);
  };

  const handleCleanDuplicates = async () => {
    setIsCleaningDuplicates(true);
    try {
      const removedCount = await cleanDuplicateBlockedPeriods();

      if (removedCount > 0) {
        toast({
          title: "Limpeza concluída",
          description: `${removedCount} bloqueios duplicados foram removidos.`,
        });

        const updatedData = await fetchBlockedPeriods();
        setBlockedPeriods(updatedData);
      } else {
        toast({
          title: "Nenhum duplicado encontrado",
          description: "Todos os bloqueios já estão únicos.",
        });
      }
    } catch (error) {
      console.error("Error cleaning duplicates:", error);
      toast({
        title: "Erro na limpeza",
        description: "Ocorreu um erro ao limpar bloqueios duplicados.",
        variant: "destructive",
      });
    } finally {
      setIsCleaningDuplicates(false);
    }
  };

  const selectedDateReservations = useMemo(
    () => getReservationsByDate(format(calendarDate, "yyyy-MM-dd")),
    [calendarDate, getReservationsByDate]
  );
  const availabilitySlots = useMemo(() => {
    const slots = getAvailabilityWithBlocks(
      selectedDateReservations,
      blockedPeriods,
      format(calendarDate, "yyyy-MM-dd")
    );
    return slots;
  }, [selectedDateReservations, blockedPeriods, calendarDate]);

  const modifiers = useMemo(
    () => ({
      inactive: (date: Date) => !isValidDate(date) || getDayStatus(date) === "inactive",
      empty: (date: Date) => !isValidDate(date) || getDayStatus(date) === "empty",
      low: (date: Date) => !isValidDate(date) || getDayStatus(date) === "low",
      medium: (date: Date) => !isValidDate(date) || getDayStatus(date) === "medium",
      full: (date: Date) => !isValidDate(date) || getDayStatus(date) === "full",
      blocked: (date: Date) => !isValidDate(date) || isDayBlocked(date),
    }),
    [getDayStatus, isDayBlocked]
  );

  const modifiersClassNames = {
    inactive: "bg-blue-200 text-blue-900",
    empty: "bg-gray-100 text-gray-400",
    low: "bg-green-200 text-green-900",
    medium: "bg-yellow-200 text-yellow-900",
    full: "bg-red-300 text-red-900",
    blocked: "bg-gray-300 text-gray-400 cursor-not-allowed",
  };

  const isValidDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(date);
    inputDate.setHours(0, 0, 0, 0);

    // 1. Não permitir datas passadas
    if (inputDate < today) return false;

    // 2. Não permitir datas bloqueadas
    const dateString = inputDate.toISOString().split('T')[0];
    if (blockedDates.includes(dateString)) return false;

    // Se passar todas as validações, a data é válida
    return true;
  };

  return {
    showCard,
    setShowCard,
    getReservationsByDate,
    getAvailabilityForDate,
    updateReservation,
    refetch,
    toast,
    t,
    conductors,
    conductorsLoading,
    conductorsError,
    updateConductorStatus,
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
    isLoadingBlockedPeriods,
    setIsLoadingBlockedPeriods,
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
    inactiveDays,
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
    selectedConductorId,
    setSelectedConductorId,
    tuktukStatus,
    setTuktukStatus,
    activeConductorIds,
    occupiedMinutes,
    setOccupiedMinutes,
    occupiedUntil,
    setOccupiedUntil,
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
    cancelReservation,
    openWhatsappMessageEditor,
    sendWhatsappMessage,
    getDayStatus,
    isDayBlocked,
    getDayBlockReason,
    isTimeBlocked,
    isBlockedByReservation,
    isBlockedByAdmin,
    getTimeBlockReason,
    getAllDayBlocks,
    getFilteredBlocks,
    blockDay,
    unblockDay,
    blockTime,
    unblockTime,
    makeTimeAvailable,
    handleBlockDaysRange,
    blockTimeRange,
    handleDateSelect,
    handleDayClick,
    openBlockModalForDate,
    getDayLabel,
    getStatusBadgeConfig,
    getCurrentWhatsapp,
    getWhatsappLink,
    confirmOccupiedTime,
    selectedDateReservations,
    availabilitySlots,
    modifiers,
    modifiersClassNames,
    blockedDates,
    setBlockedDates,
    isValidDate,
  };
}