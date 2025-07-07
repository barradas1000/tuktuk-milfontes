import React, { useState, useMemo, useCallback, useEffect } from "react";
import { format, eachDayOfInterval, isAfter } from "date-fns";
import { pt } from "date-fns/locale";
import { DayPicker } from "react-day-picker";

import {
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar as CalendarIcon,
  Eye,
  Lock,
  Phone,
} from "lucide-react";

// --- UI Components ---
import { Calendar } from "@/components/ui/calendar"; // Seu componente de calendário UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";

// --- Hooks & Data ---
import { useAdminReservations } from "@/hooks/useAdminReservations";
import {
  fetchBlockedPeriods,
  createBlockedPeriod,
  deleteBlockedPeriodsByDate,
  fetchActiveConductors,
  updateActiveConductors,
  fetchConductors,
  cleanDuplicateBlockedPeriods,
} from "@/services/supabaseService";
import { BlockedPeriod } from "@/types/adminReservations";
import { AdminReservation } from "@/types/adminReservations";
import {
  getAvailabilityWithBlocks,
  generateDynamicTimeSlots,
} from "@/utils/reservationUtils";

// --- Helper Functions (pode ser movido para um arquivo separado, ex: utils/time.ts ou utils/format.ts) ---
// Gera todos os horários de meia em meia hora das 08:00 às 23:00
const timeSlots = generateDynamicTimeSlots();

// CSS personalizado para esconder scrollbar
const sliderStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

// --- Interfaces ---
interface AdminCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

// --- Componente Principal ---
// Fallback para condutores caso não carregue do banco
const FALLBACK_CONDUCTORS = [
  {
    id: "condutor1",
    name: "Condutor 1",
    whatsapp: "351963496320",
  },
  {
    id: "condutor2",
    name: "Condutor 2",
    whatsapp: "351968784043",
  },
];

const AdminCalendar = ({ selectedDate, onDateSelect }: AdminCalendarProps) => {
  // --- Hooks de Dados/Serviços ---
  const { getReservationsByDate, getAvailabilityForDate, updateReservation } =
    useAdminReservations();
  const { toast } = useToast();
  const { t } = useTranslation();

  // --- Estados do Componente ---
  const [calendarDate, setCalendarDate] = useState<Date>(
    new Date(selectedDate)
  );
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quickViewDate, setQuickViewDate] = useState<Date | null>(null);

  // Estados relacionados a bloqueios
  const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([]);
  const [blockedPeriodsLoading, setBlockedPeriodsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockDate, setBlockDate] = useState<Date | null>(null); // Data atualmente selecionada para bloquear/desbloquear
  const [blockTab, setBlockTab] = useState<"day" | "hour" | null>("day"); // Aba ativa no modal de bloqueio

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
  const [conductors, setConductors] = useState(FALLBACK_CONDUCTORS);

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

  // Mapeamento de códigos de tour para nomes amigáveis
  const tourTypes = [
    { id: "panoramic", name: "Passeio panorâmico pela vila" },
    { id: "furnas", name: "Vila Nova de Milfontes → Praia das Furnas" },
    { id: "bridge", name: "Travessia da ponte" },
    { id: "sunset", name: "Pôr do Sol Romântico" },
    { id: "night", name: "Passeio noturno" },
    { id: "fishermen", name: "Rota dos Pescadores" },
  ];

  /**
   * Função para converter código do tour em nome amigável
   */
  const getTourDisplayName = (tourType: string): string => {
    const tour = tourTypes.find((t) => t.id === tourType);
    return tour ? tour.name : tourType;
  };

  /**
   * Função para obter o nome do tour traduzido no idioma do cliente
   */
  const getTourDisplayNameTranslated = (
    tourType: string,
    lang: string
  ): string => {
    // Mapeamento dos nomes dos tours por idioma
    const tourNames: Record<string, Record<string, string>> = {
      pt: {
        panoramic: "Passeio panorâmico pela vila",
        furnas: "Vila Nova de Milfontes → Praia das Furnas",
        bridge: "Travessia da ponte",
        sunset: "Pôr do Sol Romântico",
        night: "Passeio noturno",
        fishermen: "Rota dos Pescadores",
      },
      en: {
        panoramic: "Panoramic tour of the village",
        furnas: "Milfontes → Furnas Beach",
        bridge: "Bridge crossing",
        sunset: "Romantic Sunset",
        night: "Night tour",
        fishermen: "Fishermen's Route",
      },
      es: {
        panoramic: "Paseo panorámico por la villa",
        furnas: "Milfontes → Playa de Furnas",
        bridge: "Cruce del puente",
        sunset: "Puesta de sol romántica",
        night: "Paseo nocturno",
        fishermen: "Ruta de los Pescadores",
      },
      fr: {
        panoramic: "Visite panoramique du village",
        furnas: "Milfontes → Plage des Furnas",
        bridge: "Traversée du pont",
        sunset: "Coucher de soleil romantique",
        night: "Visite nocturne",
        fishermen: "Route des pêcheurs",
      },
      de: {
        panoramic: "Panoramatour durch das Dorf",
        furnas: "Milfontes → Strand von Furnas",
        bridge: "Brückenüberquerung",
        sunset: "Romantischer Sonnenuntergang",
        night: "Nachttour",
        fishermen: "Fischerroute",
      },
      it: {
        panoramic: "Tour panoramico del villaggio",
        furnas: "Milfontes → Spiaggia di Furnas",
        bridge: "Attraversamento del ponte",
        sunset: "Tramonto romantico",
        night: "Tour notturno",
        fishermen: "Rotta dei pescatori",
      },
      nl: {
        panoramic: "Panoramische tour door het dorp",
        furnas: "Milfontes → Furnas-strand",
        bridge: "Brugoversteek",
        sunset: "Romantische zonsondergang",
        night: "Nachttour",
        fishermen: "Vissersroute",
      },
    };
    return tourNames[lang]?.[tourType] || tourNames["pt"][tourType] || tourType;
  };

  // --- Funções de Lógica de Negócio (Memorizadas para performance) ---

  /**
   * Função para anular uma reserva
   */
  const cancelReservation = async (
    reservation: AdminReservation,
    reason: string = ""
  ) => {
    setIsCancelling(true);
    try {
      // Atualizar status no banco de dados
      await updateReservation({ id: reservation.id, status: "cancelled" });

      // Fechar modal de anulação
      setCancelReservationModalOpen(false);
      setReservationToCancel(null);
      setCancelReason("");

      // Abrir editor de mensagem do WhatsApp
      openWhatsappMessageEditor(reservation, "cancelled");

      // Mostrar feedback
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

  /**
   * Função para interpolar variáveis nas mensagens do WhatsApp
   */
  const interpolateMessage = (
    message: string,
    variables: Record<string, string>
  ): string => {
    console.log("=== DEBUG interpolateMessage ===");
    console.log("Original Message:", message);
    console.log("Variables:", variables);

    const result = message.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const replacement = variables[key] || match;
      console.log(`Replacing ${match} with ${replacement}`);
      return replacement;
    });

    console.log("Interpolated Result:", result);
    console.log("=== END DEBUG interpolateMessage ===");

    return result;
  };

  /**
   * Função para detectar o idioma do cliente baseado no campo language da reserva
   */
  const getClientLanguage = (reservation: AdminReservation): string => {
    // Se a reserva tem um idioma definido, usa esse
    if (reservation.language && i18n.languages.includes(reservation.language)) {
      return reservation.language;
    }

    // Fallback para português
    return "pt";
  };

  /**
   * Função para obter mensagem traduzida no idioma do cliente
   */
  const getTranslatedMessage = (
    reservation: AdminReservation,
    messageKey: string,
    variables: Record<string, string>
  ): string => {
    const clientLanguage = getClientLanguage(reservation);

    // Temporariamente muda o idioma para o do cliente
    const currentLanguage = i18n.language;
    i18n.changeLanguage(clientLanguage);

    // Obtém a mensagem traduzida
    const template = i18n.t(`reservation.whatsappMessages.${messageKey}`);

    // Volta para o idioma original
    i18n.changeLanguage(currentLanguage);

    // Debug logs
    console.log("=== DEBUG getTranslatedMessage ===");
    console.log("Client Language:", clientLanguage);
    console.log("Message Key:", messageKey);
    console.log("Template:", template);
    console.log("Variables:", variables);
    console.log("Reservation Language:", reservation.language);

    // Interpola as variáveis
    const result = interpolateMessage(template, variables);
    console.log("Final Result:", result);
    console.log("=== END DEBUG ===");

    return result;
  };

  /**
   * Função para abrir modal de edição de mensagem do WhatsApp
   */
  const openWhatsappMessageEditor = (
    reservation: AdminReservation,
    type: "confirmed" | "cancelled" | "custom" = "confirmed"
  ) => {
    setReservationForMessage(reservation);
    setMessageType(type);

    // Gerar mensagem baseada no tipo e idioma do cliente
    let baseMessage = "";
    const clientLanguage = getClientLanguage(reservation);
    const variables = {
      name: reservation.customer_name,
      tour_type: getTourDisplayNameTranslated(
        reservation.tour_type,
        clientLanguage
      ),
      reservation_date: reservation.reservation_date,
      reservation_time: reservation.reservation_time,
      total_price: reservation.total_price.toString(),
    };

    if (type === "confirmed") {
      baseMessage = getTranslatedMessage(reservation, "confirmed", variables);
    } else if (type === "cancelled") {
      baseMessage = getTranslatedMessage(reservation, "cancelled", variables);
    } else {
      // Mensagem customizada - usa saudação no idioma do cliente
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

  /**
   * Função para enviar mensagem do WhatsApp editada
   */
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

  /**
   * Determina o status de um dia baseado nas reservas e dias inativos.
   * @param date A data a ser verificada.
   * @returns "inactive" | "empty" | "low" | "medium" | "full"
   */
  const getDayStatus = useCallback(
    (date: Date) => {
      const dateString = format(date, "yyyy-MM-dd");
      if (inactiveDays.includes(dateString)) return "inactive";
      const reservas = getReservationsByDate(dateString);
      if (reservas.length === 0) return "empty";
      if (reservas.length <= 2) return "low";
      if (reservas.length <= 4) return "medium";
      return "full";
    },
    [getReservationsByDate, inactiveDays]
  );

  /**
   * Verifica se um dia inteiro está bloqueado.
   * @param date A data a ser verificada.
   * @returns boolean
   */
  const isDayBlocked = useCallback(
    (date: Date) => {
      const dateString = format(date, "yyyy-MM-dd");
      return blockedPeriods.some(
        (b) => b.date === dateString && !b.startTime && !b.endTime
      );
    },
    [blockedPeriods]
  );

  /**
   * Obtém a razão para o bloqueio de um dia inteiro.
   * @param date A data a ser verificada.
   * @returns string
   */
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

  /**
   * Verifica se um horário específico está bloqueado.
   * @param date A data do horário.
   * @param time O horário a ser verificado (ex: "09:00").
   * @returns boolean
   */
  const isTimeBlocked = useCallback(
    (date: Date, time: string) => {
      const dateString = format(date, "yyyy-MM-dd");
      // Verificar se há bloqueio manual do admin
      const adminBlocked = blockedPeriods.some(
        (b) => b.date === dateString && b.startTime === time
      );
      // Verificar se há reserva confirmada
      const hasConfirmedReservation = getReservationsByDate(dateString).some(
        (r) => r.reservation_time === time && r.status === "confirmed"
      );
      return adminBlocked || hasConfirmedReservation;
    },
    [blockedPeriods, getReservationsByDate]
  );

  /**
   * Verifica se um horário está bloqueado por reserva confirmada.
   * @param date A data do horário.
   * @param time O horário a ser verificado.
   * @returns boolean
   */
  const isBlockedByReservation = useCallback(
    (date: Date, time: string) => {
      const dateString = format(date, "yyyy-MM-dd");
      return getReservationsByDate(dateString).some(
        (r) => r.reservation_time === time && r.status === "confirmed"
      );
    },
    [getReservationsByDate]
  );

  /**
   * Verifica se um horário está bloqueado manualmente pelo admin.
   * @param date A data do horário.
   * @param time O horário a ser verificado.
   * @returns boolean
   */
  const isBlockedByAdmin = useCallback(
    (date: Date, time: string) => {
      const dateString = format(date, "yyyy-MM-dd");
      return blockedPeriods.some(
        (b) => b.date === dateString && b.startTime === time
      );
    },
    [blockedPeriods]
  );

  /**
   * Obtém a razão para o bloqueio de um horário.
   * @param date A data do horário.
   * @param time O horário a ser verificado.
   * @returns string
   */
  const getTimeBlockReason = useCallback(
    (date: Date, time: string) => {
      const dateString = format(date, "yyyy-MM-dd");

      // Verificar se está bloqueado por reserva
      const confirmedReservation = getReservationsByDate(dateString).find(
        (r) => r.reservation_time === time && r.status === "confirmed"
      );

      if (confirmedReservation) {
        return `Reserva confirmada: ${confirmedReservation.customer_name}`;
      }

      // Verificar se está bloqueado manualmente pelo admin
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

  /**
   * Retorna todos os blocos (dia inteiro ou por hora) para uma data específica.
   * @param date A data para obter os blocos.
   * @returns BlockedPeriod[]
   */
  const getAllDayBlocks = useCallback(
    (date: Date) => {
      const dateString = format(date, "yyyy-MM-dd");
      return blockedPeriods.filter((b) => b.date === dateString);
    },
    [blockedPeriods]
  );

  /**
   * Filtra os bloqueios baseado nos filtros aplicados.
   * @returns BlockedPeriod[]
   */
  const getFilteredBlocks = useCallback(() => {
    let filtered = blockedPeriods;

    // Filtrar por tipo
    if (blockFilterType === "days") {
      filtered = filtered.filter((b) => !b.startTime);
    } else if (blockFilterType === "hours") {
      filtered = filtered.filter((b) => b.startTime);
    }

    // Filtrar por data
    if (blockFilterDate) {
      filtered = filtered.filter((b) => b.date === blockFilterDate);
    }

    return filtered;
  }, [blockedPeriods, blockFilterType, blockFilterDate]);

  // --- Funções de Manipulação de Bloqueios (Refatoradas para clareza) ---

  const session = useSession();
  const userEmail = session?.user?.email || "admin";

  const blockDay = useCallback(
    async (date: Date, reason: string) => {
      const dateString = format(date, "yyyy-MM-dd");
      try {
        // Verificar se já está bloqueado
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
      console.log("Desbloqueando dia:", dateString);
      await deleteBlockedPeriodsByDate(dateString);
      setBlockedPeriods((prev) =>
        prev.filter(
          (b) => !(b.date === dateString && !b.startTime && !b.endTime)
        )
      );
      console.log("Dia desbloqueado com sucesso:", dateString);
      // Fechar o modal após desbloquear
      setBlockDayModalOpen(false);
    } catch (error) {
      console.error("Error unblocking day:", error);
      alert("Erro ao desbloquear o dia. Tente novamente.");
    }
  }, []);

  const blockTime = useCallback(
    async (date: Date, time: string, reason: string) => {
      const dateString = format(date, "yyyy-MM-dd");
      // Impedir bloqueio duplicado
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
          console.log("Blocked periods updated:", updated);
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
      // Verificar se existe reserva para este horário
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
        console.log("Desbloqueando horário:", dateString, time);
        await deleteBlockedPeriodsByDate(dateString, time);
        setBlockedPeriods((prev) =>
          prev.filter((b) => !(b.date === dateString && b.startTime === time))
        );
        console.log("Horário desbloqueado com sucesso:", dateString, time);
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
        console.log("Tornando horário disponível:", dateString, time);
        await deleteBlockedPeriodsByDate(dateString, time);
        setBlockedPeriods((prev) =>
          prev.filter((b) => !(b.date === dateString && b.startTime === time))
        );
        console.log(
          "Horário tornado disponível com sucesso:",
          dateString,
          time
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

    // Validação básica para garantir que a data de início não é após a data de fim
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
        console.log(
          "Bloqueando intervalo:",
          dateString,
          startTime,
          "até",
          endTime
        );

        // Encontrar os índices dos horários no array timeSlots
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

        // Bloquear cada horário no intervalo
        for (let i = startIndex; i <= endIndex; i++) {
          const time = timeSlots[i];
          await blockTime(date, time, reason);
        }

        console.log(
          "Intervalo bloqueado com sucesso:",
          startTime,
          "até",
          endTime
        );
      } catch (error) {
        console.error("Error blocking time range:", error);
        alert("Erro ao bloquear o intervalo. Tente novamente.");
      }
    },
    [blockTime, timeSlots]
  );

  // --- Handlers de Eventos ---

  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      if (date) {
        const dateString = format(date, "yyyy-MM-dd");
        setCalendarDate(date);
        onDateSelect(dateString); // Callback para o componente pai
      }
    },
    [onDateSelect]
  );

  const handleDayClick = useCallback(
    (date: Date | undefined) => {
      if (!date) return;

      // Se o dia clicado estiver bloqueado, desbloqueia diretamente
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

        // Desbloquear dia diretamente
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

      // Se o dia não estiver bloqueado, abre modal para bloquear
      setBlockDate(date);
      setBlockDayReason(""); // Limpa o motivo
      setBlockDayModalOpen(true);
    },
    [isDayBlocked, getReservationsByDate, unblockDay, toast]
  );

  const openBlockModalForDate = useCallback(
    (date: Date) => {
      setBlockDate(date);
      setBlockDaysStart(format(date, "yyyy-MM-dd"));
      setBlockDaysEnd(format(date, "yyyy-MM-dd"));
      setBlockTab("day"); // Padrão para "Bloquear Dias"
      setBlockDayReason(getDayBlockReason(date)); // Pré-preenche se já estiver bloqueado
      setBlockModalOpen(true);
    },
    [getDayBlockReason]
  );

  // --- Funções Auxiliares de UI/Renderização ---

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

  const getStatusBadge = useCallback((status: string) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: AlertCircle,
        text: "Pendente",
      },
      confirmed: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        text: "Confirmada",
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        text: "Cancelada",
      },
      completed: {
        color: "bg-blue-100 text-blue-800",
        icon: CheckCircle,
        text: "Concluída",
      },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  }, []);

  // --- Função para determinar o WhatsApp responsável ---
  function getCurrentWhatsapp() {
    if (activeConductors.length === 1) {
      const c = conductors.find((c) => c.id === activeConductors[0]);
      return c ? c.whatsapp : conductors[1]?.whatsapp || "351968784043";
    }
    // Se ambos ativos ou nenhum, retorna o do Condutor 2
    return conductors[1]?.whatsapp || "351968784043";
  }

  // --- Função utilitária para gerar link do WhatsApp ---
  function getWhatsappLink(phone: string, message: string) {
    // Remove todos os caracteres não numéricos
    let cleanPhone = phone.replace(/\D/g, "");

    // Se o número começa com 0, remove o 0
    if (cleanPhone.startsWith("0")) {
      cleanPhone = cleanPhone.substring(1);
    }

    // Se o número não começa com 351 (código de Portugal), adiciona
    if (!cleanPhone.startsWith("351")) {
      cleanPhone = "351" + cleanPhone;
    }

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }

  // --- Modificadores do DayPicker (Memorizados para evitar recriação desnecessária) ---
  const modifiers = useMemo(
    () => ({
      inactive: (date: Date) => getDayStatus(date) === "inactive",
      empty: (date: Date) => getDayStatus(date) === "empty",
      low: (date: Date) => getDayStatus(date) === "low",
      medium: (date: Date) => getDayStatus(date) === "medium",
      full: (date: Date) => getDayStatus(date) === "full",
      // Adicionar um modificador para dias bloqueados
      blocked: isDayBlocked,
    }),
    [getDayStatus, isDayBlocked]
  );

  const modifiersClassNames = {
    inactive: "bg-blue-200 text-blue-900",
    empty: "bg-gray-100 text-gray-400",
    low: "bg-green-200 text-green-900",
    medium: "bg-yellow-200 text-yellow-900",
    full: "bg-red-300 text-red-900",
    blocked: "bg-gray-300 text-gray-400 cursor-not-allowed", // Nova classe para dias bloqueados
  };

  // --- Dados Computados para Renderização ---
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
    console.log("Availability slots calculated:", slots);
    return slots;
  }, [selectedDateReservations, blockedPeriods, calendarDate]);

  // --- Efeitos (Opcional, para sincronizar state inicial ou outros efeitos colaterais) ---
  // Exemplo: Sincronizar calendarDate com selectedDate se este mudar externamente
  useEffect(() => {
    setCalendarDate(new Date(selectedDate));
  }, [selectedDate]);

  // Recarregar dados quando calendarDate mudar
  useEffect(() => {
    const loadDataForDate = async () => {
      try {
        // Recarregar bloqueios para garantir dados atualizados
        const data = await fetchBlockedPeriods();
        setBlockedPeriods(data);
      } catch (error) {
        console.error("Error loading data for date:", error);
      }
    };

    loadDataForDate();
  }, [calendarDate]);

  // --- Efeitos para carregar dados do Supabase ---
  useEffect(() => {
    const loadBlockedPeriods = async () => {
      try {
        setBlockedPeriodsLoading(true);
        const data = await fetchBlockedPeriods();
        console.log("Blocked periods loaded:", data);
        setBlockedPeriods(data);
        setDebugInfo(
          `Carregados ${data.length} bloqueios: ${JSON.stringify(data)}`
        );
      } catch (error) {
        console.error("Error loading blocked periods:", error);
      } finally {
        setBlockedPeriodsLoading(false);
      }
    };

    const loadActiveConductors = async () => {
      try {
        setConductorsLoading(true);
        const activeIds = await fetchActiveConductors();
        setActiveConductors(activeIds);

        // Carregar dados dos condutores
        const conductorsData = await fetchConductors();
        if (conductorsData.length > 0) {
          setConductors(conductorsData);
        }
      } catch (error) {
        console.error("Error loading active conductors:", error);
        setActiveConductors(["condutor2"]); // fallback
      } finally {
        setConductorsLoading(false);
      }
    };

    loadBlockedPeriods();
    loadActiveConductors();
  }, []);

  // Gerar os próximos 10 dias para o slider
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

  // Função para lidar com seleção de data no slider
  const handleSliderDateSelect = (date: Date) => {
    setSelectedSliderDate(date);
    setCalendarDate(date);
    const dateString = format(date, "yyyy-MM-dd");
    onDateSelect(dateString);
  };

  // Função para limpar bloqueios duplicados
  const handleCleanDuplicates = async () => {
    setIsCleaningDuplicates(true);
    try {
      const removedCount = await cleanDuplicateBlockedPeriods();

      if (removedCount > 0) {
        toast({
          title: "Limpeza concluída",
          description: `${removedCount} bloqueios duplicados foram removidos.`,
        });

        // Recarregar bloqueios após limpeza
        const updatedData = await fetchBlockedPeriods();
        setBlockedPeriods(updatedData);
        setDebugInfo(
          `Carregados ${
            updatedData.length
          } bloqueios após limpeza: ${JSON.stringify(updatedData)}`
        );
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

  // --- Renderização do Componente ---
  return (
    <div>
      <style>{sliderStyles}</style>
      {/* Debug info - remover depois */}
      {debugInfo && (
        <div className="mb-4 p-2 bg-blue-100 border border-blue-300 rounded text-xs">
          <strong>Debug:</strong> {debugInfo}
          <div className="mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCleanDuplicates}
              disabled={isCleaningDuplicates}
              className="text-xs"
            >
              {isCleaningDuplicates ? "Limpando..." : "Limpar Duplicados"}
            </Button>
          </div>
        </div>
      )}
      {/* Painel de seleção de condutores ativos */}
      <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl flex flex-col gap-3 items-center shadow-md">
        <h2 className="text-lg font-bold text-purple-900 mb-2">
          Condutores Ativos
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          {conductors.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200"
            >
              <span className="font-semibold text-gray-800 min-w-[90px]">
                {c.name}
                <span className="ml-2 text-xs text-gray-500">
                  ({c.whatsapp})
                </span>
              </span>
              <Switch
                checked={activeConductors.includes(c.id)}
                onCheckedChange={(checked) => {
                  const newActiveConductors = checked
                    ? [...activeConductors, c.id]
                    : activeConductors.filter((id) => id !== c.id);

                  setActiveConductors(newActiveConductors);

                  // Salvar no Supabase
                  updateActiveConductors(newActiveConductors).catch((error) => {
                    console.error("Error updating active conductors:", error);
                  });
                }}
                id={`switch-${c.id}`}
              />
              <span
                className={
                  activeConductors.includes(c.id)
                    ? "text-green-600 font-semibold"
                    : "text-gray-400"
                }
              >
                {activeConductors.includes(c.id) ? "Ativo" : "Inativo"}
              </span>
            </div>
          ))}
        </div>
        {/* Exibir o WhatsApp responsável atual */}
        <div className="mt-4 text-base text-purple-900 font-semibold">
          WhatsApp responsável:{" "}
          <span className="text-purple-700">{getCurrentWhatsapp()}</span>
        </div>
      </div>

      {/* Disponibilidade por Horário Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Disponibilidade por Horário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm text-gray-600">
              Clique em um horário para bloquear/desbloquear
            </div>
            <div className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
              {format(calendarDate, "dd/MM", { locale: pt })}
            </div>
          </div>

          {/* Slider de dias */}
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Próximos 10 dias:
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {sliderDays.map((day, index) => {
                const isSelected =
                  format(day, "yyyy-MM-dd") ===
                  format(selectedSliderDate, "yyyy-MM-dd");
                const isToday =
                  format(day, "yyyy-MM-dd") ===
                  format(new Date(), "yyyy-MM-dd");
                const dayName = format(day, "EEE", { locale: pt });
                const dayNumber = format(day, "dd");
                const month = format(day, "MM");

                return (
                  <button
                    key={index}
                    onClick={() => handleSliderDateSelect(day)}
                    className={`flex flex-col items-center justify-center min-w-[60px] h-16 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                        : isToday
                        ? "border-purple-400 bg-purple-50 text-purple-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-xs font-medium uppercase">
                      {dayName}
                    </div>
                    <div className="text-lg font-bold">{dayNumber}</div>
                    <div className="text-xs text-gray-500">{month}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legenda dos tipos de bloqueio */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Legenda dos horários:
            </div>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-50 border-2 border-green-200 rounded"></div>
                <span className="text-green-600">Disponível</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-50 border-2 border-orange-300 rounded"></div>
                <span className="text-orange-600">Reserva confirmada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-50 border-2 border-red-300 rounded"></div>
                <span className="text-red-600">Bloqueado pelo admin</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 border-2 border-gray-400 rounded"></div>
                <span className="text-gray-500">Indisponível</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-2">
            {availabilitySlots.map((slot) => {
              let cardClass = "";
              let textClass = "";
              let statusText = "";

              switch (slot.status) {
                case "blocked_by_reservation":
                  cardClass = "border-orange-300 bg-orange-50 hover:bg-orange-100";
                  textClass = "text-orange-600";
                  statusText = "Reserva confirmada";
                  break;
                case "blocked_by_admin":
                  cardClass = "border-red-300 bg-red-50 hover:bg-red-100";
                  textClass = "text-red-600";
                  statusText = "Bloqueado pelo admin";
                  break;
                case "available":
                  cardClass = "border-green-200 bg-green-50 hover:bg-green-100";
                  textClass = "text-green-600";
                  statusText = "Disponível";
                  break;
                default:
                  cardClass = "border-gray-400 bg-gray-200 text-gray-500 hover:bg-gray-300";
                  textClass = "text-gray-500";
                  statusText = "Indisponível";
              }

              return (
                <div
                  key={slot.time}
                  className={`p-2 h-20 rounded-lg text-sm flex flex-col items-center justify-center border cursor-pointer transition-all duration-150 shadow-sm mb-1 ${cardClass}`}
                  title={slot.reason || statusText}
                  onClick={() => {
                    if (slot.status === "blocked_by_reservation") {
                      toast({
                        title: "Não é possível desbloquear",
                        description: "Este horário está bloqueado por uma reserva confirmada. Cancele a reserva primeiro.",
                        variant: "destructive",
                      });
                    } else if (slot.status === "blocked_by_admin") {
                      unblockTime(calendarDate, slot.time);
                    } else if (slot.status === "available") {
                      blockTime(calendarDate, slot.time, "");
                    }
                  }}
                >
                  <div className="font-semibold flex items-center justify-center gap-1">
                    {slot.time} {(slot.status !== "available" && <Lock className="w-4 h-4 inline ml-1" />)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {slot.reserved}/{slot.capacity} pessoas
                  </div>
                  <div className={`text-xs font-medium mt-1 ${textClass}`}>
                    {statusText}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Calendar Card */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendário
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Removido bloco dos botões de bloqueio/desbloqueio */}
          <div className="rounded-2xl shadow-xl bg-white p-2">
            <DayPicker
              mode="single"
              selected={calendarDate}
              onSelect={handleDayClick}
              className="rounded-2xl border-0"
              locale={pt}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              components={{
                Day: (props) => {
                  const status = getDayStatus(props.date);
                  const isSelected =
                    format(props.date, "yyyy-MM-dd") ===
                    format(calendarDate, "yyyy-MM-dd");
                  const isToday =
                    format(props.date, "yyyy-MM-dd") ===
                    format(new Date(), "yyyy-MM-dd");
                  const blocked = isDayBlocked(props.date);
                  const textColor = blocked ? "text-gray-400" : "text-black";

                  return (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className={
                            `h-10 w-10 flex items-center justify-center rounded-full transition-all duration-150 ` +
                            (isSelected
                              ? "ring-2 ring-blue-500 bg-blue-100 font-bold "
                              : "") +
                            (isToday
                              ? "ring-2 ring-purple-600 ring-offset-2 "
                              : "") +
                            (blocked
                              ? "bg-gray-300 cursor-pointer hover:bg-gray-400 "
                              : modifiersClassNames[
                                  status as keyof typeof modifiersClassNames
                                ] + " ") +
                            textColor +
                            " hover:scale-110 hover:shadow-lg focus:outline-none"
                          }
                          onClick={() => handleDayClick(props.date)}
                        >
                          {blocked ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            props.date.getDate()
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {blocked
                          ? `${getDayBlockReason(
                              props.date
                            )} - Clique para desbloquear`
                          : `${getDayLabel(status)} - Clique para bloquear`}
                      </TooltipContent>
                    </Tooltip>
                  );
                },
              }}
            />
          </div>
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold text-sm">Legenda:</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-300 rounded"></div>
                <span>Sem reservas</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span>Poucas reservas</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-300 rounded"></div>
                <span>Várias reservas</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-400 rounded"></div>
                <span>Cheio</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-300 rounded"></div>
                <span>Serviço não ativo</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-300 rounded flex items-center justify-center">
                  <Lock className="w-2 h-2" />
                </div>
                <span>Dia bloqueado (clique para desbloquear)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-white border border-gray-300 rounded flex items-center justify-center">
                  <span className="text-xs">+</span>
                </div>
                <span>Dia disponível (clique para bloquear)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Visualização de Bloqueios */}
      <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl shadow-md">
        <h2 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Visualização de Bloqueios
        </h2>

        {/* Filtros */}
        <div className="mb-4 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <label
              className="text-sm font-medium text-orange-800"
              htmlFor="block-filter-type"
            >
              Filtrar por:
            </label>
            <select
              id="block-filter-type"
              name="block-filter-type"
              value={blockFilterType}
              onChange={(e) =>
                setBlockFilterType(e.target.value as "all" | "days" | "hours")
              }
              className="border border-orange-200 rounded px-2 py-1 text-sm"
            >
              <option value="all">Todos</option>
              <option value="days">Apenas Dias</option>
              <option value="hours">Apenas Horários</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label
              className="text-sm font-medium text-orange-800"
              htmlFor="block-filter-date"
            >
              Data:
            </label>
            <input
              id="block-filter-date"
              name="block-filter-date"
              type="date"
              value={blockFilterDate}
              onChange={(e) => setBlockFilterDate(e.target.value)}
              className="border border-orange-200 rounded px-2 py-1 text-sm"
            />
            {blockFilterDate && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setBlockFilterDate("")}
                className="text-xs"
              >
                Limpar
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dias Bloqueados */}
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Dias Bloqueados (
              {getFilteredBlocks().filter((b) => !b.startTime).length})
            </h3>
            {getFilteredBlocks().filter((b) => !b.startTime).length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-4">
                {blockFilterType === "hours"
                  ? "Filtro aplicado: apenas horários"
                  : "Nenhum dia bloqueado"}
              </div>
            ) : (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {getFilteredBlocks()
                  .filter((b) => !b.startTime)
                  .sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime()
                  )
                  .map((block) => (
                    <div
                      key={block.id}
                      className="flex items-center justify-between p-2 bg-orange-50 rounded border border-orange-100"
                    >
                      <div className="flex-1">
                        <span className="font-medium text-sm">
                          {format(new Date(block.date), "dd/MM/yyyy", {
                            locale: pt,
                          })}
                        </span>
                        {block.reason && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({block.reason})
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => unblockDay(new Date(block.date))}
                      >
                        Desbloquear
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Horários Bloqueados */}
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horários Bloqueados (
              {getFilteredBlocks().filter((b) => b.startTime).length})
            </h3>
            {getFilteredBlocks().filter((b) => b.startTime).length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-4">
                {blockFilterType === "days"
                  ? "Filtro aplicado: apenas dias"
                  : "Nenhum horário bloqueado"}
              </div>
            ) : (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {[
                  ...new Map(
                    getFilteredBlocks()
                      .filter((b) => b.startTime)
                      .map((block) => [
                        block.date + "-" + block.startTime,
                        block,
                      ])
                  ).values(),
                ].map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between p-2 bg-orange-50 rounded border border-orange-100"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {format(new Date(block.date), "dd/MM", {
                          locale: pt,
                        })}{" "}
                        às {block.startTime}
                      </div>
                      {block.reason && (
                        <span className="text-xs text-gray-500">
                          {block.reason}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        unblockTime(new Date(block.date), block.startTime!)
                      }
                    >
                      Desbloquear
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Resumo */}
        <div className="mt-4 p-3 bg-orange-100 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-orange-800">
              {blockFilterDate || blockFilterType !== "all"
                ? `Bloqueios filtrados: ${getFilteredBlocks().length}`
                : `Total de bloqueios: ${blockedPeriods.length}`}
            </span>
            <div className="flex gap-4 text-xs text-orange-700">
              <span>
                Dias: {getFilteredBlocks().filter((b) => !b.startTime).length}
              </span>
              <span>
                Horários:{" "}
                {getFilteredBlocks().filter((b) => b.startTime).length}
              </span>
            </div>
          </div>
          {(blockFilterDate || blockFilterType !== "all") && (
            <div className="mt-2 text-xs text-orange-600">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setBlockFilterDate("");
                  setBlockFilterType("all");
                }}
                className="text-xs h-6"
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Dialog open={quickViewOpen} onOpenChange={setQuickViewOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Reservas em{" "}
                {quickViewDate
                  ? format(quickViewDate, "dd/MM/yyyy", { locale: pt })
                  : ""}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {quickViewDate &&
                getReservationsByDate(format(quickViewDate, "yyyy-MM-dd"))
                  .length === 0 && (
                  <div className="text-center text-gray-500">
                    Nenhuma reserva para este dia.
                  </div>
                )}
              {quickViewDate &&
                getReservationsByDate(format(quickViewDate, "yyyy-MM-dd")).map(
                  (reserva) => (
                    <div
                      key={reserva.id}
                      className="p-3 rounded-lg border bg-white shadow flex flex-col gap-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">
                          {reserva.customer_name}
                        </span>
                        {getStatusBadge(reserva.status)}
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm mt-1">
                        <span>
                          <b>Pagamento:</b>{" "}
                          {reserva.total_price
                            ? `€${reserva.total_price}`
                            : "-"}
                        </span>
                        <span>
                          <b>Percurso:</b>{" "}
                          {getTourDisplayName(reserva.tour_type)}
                        </span>
                        <span>
                          <b>Hora:</b> {reserva.reservation_time}
                        </span>
                        <span>
                          <b>Pessoas:</b> {reserva.number_of_people}
                        </span>
                      </div>
                      {reserva.special_requests && (
                        <div className="text-xs text-gray-500 italic mt-1">
                          "{reserva.special_requests}"
                        </div>
                      )}
                    </div>
                  )
                )}
            </div>
            <DialogClose asChild>
              <Button variant="outline" className="mt-4 w-full">
                Fechar
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>

        {/* Modal de bloqueio de dias */}
        <Dialog open={blockDayModalOpen} onOpenChange={setBlockDayModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Bloquear Dia
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {blockDate && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Dia selecionado:</strong>{" "}
                    {format(blockDate, "dd/MM/yyyy", { locale: pt })}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {format(blockDate, "EEEE", { locale: pt })}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="block-day-reason">
                  Motivo do bloqueio (opcional):
                </Label>
                <Textarea
                  id="block-day-reason"
                  placeholder="Ex: Manutenção, feriado, condições meteorológicas, etc."
                  value={blockDayReason}
                  onChange={(e) => setBlockDayReason(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Atenção:</strong> Ao bloquear este dia:
                </p>
                <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                  <li>Não será possível fazer novas reservas</li>
                  <li>Reservas existentes continuarão válidas</li>
                  <li>O dia ficará marcado como indisponível no calendário</li>
                </ul>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setBlockDayModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    if (blockDate) {
                      blockDay(blockDate, blockDayReason);
                      setBlockDayModalOpen(false);
                      setBlockDayReason("");
                      toast({
                        title: "Dia bloqueado",
                        description: `O dia ${format(
                          blockDate,
                          "dd/MM"
                        )} foi bloqueado com sucesso.`,
                        variant: "success",
                      });
                    }
                  }}
                >
                  Confirmar Bloqueio
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de bloqueio/desbloqueio de horas */}
        <Dialog open={blockHourModalOpen} onOpenChange={setBlockHourModalOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Bloquear/Desbloquear Horas</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-120px)] pr-2">
              {/* Seleção de data */}
              <div className="space-y-2">
                <label
                  className="font-semibold text-sm"
                  htmlFor="block-hour-date"
                >
                  Data:
                </label>
                <input
                  id="block-hour-date"
                  name="block-hour-date"
                  type="date"
                  value={blockDate ? format(blockDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => setBlockDate(new Date(e.target.value))}
                  className="border rounded p-2 w-full"
                />
              </div>

              {/* Bloqueio de horário individual */}
              <div className="space-y-2 border-t pt-4">
                <h4 className="font-semibold text-sm">
                  Bloquear horário individual:
                </h4>
                <div className="flex items-center gap-2">
                  <select
                    value={blockHourStart}
                    onChange={(e) => setBlockHourStart(e.target.value)}
                    className="border rounded p-2 flex-1"
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() =>
                      blockDate &&
                      blockTime(
                        blockDate,
                        blockHourStart,
                        blockTimeReason[blockHourStart] || ""
                      )
                    }
                    disabled={!blockDate}
                  >
                    Bloquear
                  </Button>
                </div>
                <input
                  id="block-hour-reason"
                  name="block-hour-reason"
                  type="text"
                  placeholder="Motivo (opcional)"
                  className="border rounded p-2 text-sm w-full"
                  value={blockTimeReason[blockHourStart] || ""}
                  onChange={(e) =>
                    setBlockTimeReason((prev) => ({
                      ...prev,
                      [blockHourStart]: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Bloqueio de intervalo */}
              <div className="space-y-2 border-t pt-4">
                <h4 className="font-semibold text-sm">
                  Bloquear intervalo de horários:
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm">De:</span>
                  <select
                    value={blockHourStart}
                    onChange={(e) => setBlockHourStart(e.target.value)}
                    className="border rounded p-2 flex-1"
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm">Até:</span>
                  <select
                    value={blockHourEnd}
                    onChange={(e) => setBlockHourEnd(e.target.value)}
                    className="border rounded p-2 flex-1"
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() =>
                      blockDate &&
                      blockTimeRange(
                        blockDate,
                        blockHourStart,
                        blockHourEnd,
                        blockTimeReason[`${blockHourStart}-${blockHourEnd}`] ||
                          ""
                      )
                    }
                    disabled={!blockDate}
                  >
                    Bloquear
                  </Button>
                </div>
                <input
                  id="block-hour-range-reason"
                  name="block-hour-range-reason"
                  type="text"
                  placeholder="Motivo (opcional)"
                  className="border rounded p-2 text-sm w-full"
                  value={
                    blockTimeReason[`${blockHourStart}-${blockHourEnd}`] || ""
                  }
                  onChange={(e) =>
                    setBlockTimeReason((prev) => ({
                      ...prev,
                      [`${blockHourStart}-${blockHourEnd}`]: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Listar horários bloqueados */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm">
                    Horários bloqueados:
                  </h4>
                  {blockDate &&
                    getAllDayBlocks(blockDate).filter((b) => b.startTime)
                      .length > 3 && (
                      <span className="text-xs text-gray-500">
                        (Role para ver mais)
                      </span>
                    )}
                </div>
                {blockDate &&
                getAllDayBlocks(blockDate).filter((b) => b.startTime).length ===
                  0 ? (
                  <div className="text-gray-500 text-sm text-center py-4">
                    Nenhum horário bloqueado neste dia.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-2 bg-gray-25">
                    {blockDate &&
                      [
                        ...new Map(
                          getAllDayBlocks(blockDate)
                            .filter((b) => b.startTime)
                            .map((block) => [
                              block.date + "-" + block.startTime,
                              block,
                            ])
                        ).values(),
                      ].map((block) => (
                        <div
                          key={block.id}
                          className="flex items-center justify-between p-2 bg-white rounded border shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex-1">
                            <span className="font-medium text-sm">
                              {block.startTime}
                            </span>
                            {block.reason && (
                              <span className="text-xs text-gray-500 ml-2">
                                ({block.reason})
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              blockDate &&
                              unblockTime(blockDate, block.startTime!)
                            }
                          >
                            Desbloquear
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  variant="secondary"
                  onClick={() => setBlockHourModalOpen(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Anulação de Reserva */}
        <Dialog
          open={cancelReservationModalOpen}
          onOpenChange={setCancelReservationModalOpen}
        >
          <DialogContent className="max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Anular Reserva
              </DialogTitle>
            </DialogHeader>
            {reservationToCancel && (
              <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-120px)] pr-2">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">
                    Confirmar anulação da reserva:
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Cliente:</strong>{" "}
                      {reservationToCancel.customer_name}
                    </p>
                    <p>
                      <strong>Telefone:</strong>{" "}
                      {reservationToCancel.customer_phone}
                    </p>
                    <p>
                      <strong>Tour:</strong>{" "}
                      {getTourDisplayName(reservationToCancel.tour_type)}
                    </p>
                    <p>
                      <strong>Data:</strong>{" "}
                      {reservationToCancel.reservation_date}
                    </p>
                    <p>
                      <strong>Hora:</strong>{" "}
                      {reservationToCancel.reservation_time}
                    </p>
                    <p>
                      <strong>Pessoas:</strong>{" "}
                      {reservationToCancel.number_of_people}
                    </p>
                    <p>
                      <strong>Valor:</strong> €{reservationToCancel.total_price}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancel-reason">
                    Motivo da anulação (opcional):
                  </Label>
                  <Textarea
                    id="cancel-reason"
                    placeholder="Ex: Cliente solicitou cancelamento, condições meteorológicas, etc."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Atenção:</strong> Esta ação irá:
                  </p>
                  <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                    <li>Alterar o status da reserva para "Cancelada"</li>
                    <li>
                      Enviar uma mensagem automática via WhatsApp para o cliente
                    </li>
                    <li>Liberar o horário para novas reservas</li>
                  </ul>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() =>
                  reservationToCancel &&
                  cancelReservation(reservationToCancel, cancelReason)
                }
                disabled={isCancelling}
              >
                {isCancelling ? "Anulando..." : "Confirmar Anulação"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCancelReservationModalOpen(false);
                  setReservationToCancel(null);
                  setCancelReason("");
                }}
                disabled={isCancelling}
              >
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Edição de Mensagem do WhatsApp */}
        <Dialog
          open={whatsappMessageModalOpen}
          onOpenChange={setWhatsappMessageModalOpen}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-500" />
                Editar Mensagem do WhatsApp
              </DialogTitle>
            </DialogHeader>
            {reservationForMessage && (
              <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-120px)] pr-2">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Detalhes da Reserva:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>
                      <strong>Cliente:</strong>{" "}
                      {reservationForMessage.customer_name}
                    </p>
                    <p>
                      <strong>Telefone:</strong>{" "}
                      {reservationForMessage.customer_phone}
                    </p>
                    <p>
                      <strong>Idioma:</strong>{" "}
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getClientLanguage(reservationForMessage).toUpperCase()}
                      </span>
                    </p>
                    <p>
                      <strong>Tour:</strong>{" "}
                      {getTourDisplayName(reservationForMessage.tour_type)}
                    </p>
                    <p>
                      <strong>Data:</strong>{" "}
                      {reservationForMessage.reservation_date}
                    </p>
                    <p>
                      <strong>Hora:</strong>{" "}
                      {reservationForMessage.reservation_time}
                    </p>
                    <p>
                      <strong>Pessoas:</strong>{" "}
                      {reservationForMessage.number_of_people}
                    </p>
                    <p>
                      <strong>Valor:</strong> €
                      {reservationForMessage.total_price}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp-message">
                    Mensagem para o cliente:
                  </Label>
                  <Textarea
                    id="whatsapp-message"
                    value={editableMessage}
                    onChange={(e) => setEditableMessage(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                    placeholder="Digite a mensagem que será enviada via WhatsApp..."
                  />
                  <div className="text-xs text-gray-500">
                    Caracteres: {editableMessage.length} | Linhas:{" "}
                    {editableMessage.split("\n").length}
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <strong>Dica:</strong> A mensagem será enviada para o
                    WhatsApp do cliente ({reservationForMessage.customer_phone})
                    no idioma{" "}
                    {getClientLanguage(reservationForMessage).toUpperCase()}.
                  </p>
                  <ul className="text-sm text-green-700 mt-1 list-disc list-inside">
                    <li>Pode personalizar a mensagem conforme necessário</li>
                    <li>Use emojis para tornar a comunicação mais amigável</li>
                    <li>
                      Inclua informações importantes como local de encontro
                    </li>
                    <li>
                      A mensagem inicial foi gerada automaticamente no idioma do
                      cliente
                    </li>
                  </ul>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setWhatsappMessageModalOpen(false);
                  setReservationForMessage(null);
                  setEditableMessage("");
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={sendWhatsappMessage}
                disabled={!editableMessage.trim()}
                className="bg-green-500 hover:bg-green-600"
              >
                <Phone className="w-4 h-4 mr-2" />
                Abrir WhatsApp do Cliente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Daily Reservations Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {format(new Date(selectedDate), "dd MMMM", { locale: pt })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <h3 className="font-semibold mb-3">
                Reservas ({selectedDateReservations.length})
              </h3>
              {selectedDateReservations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma reserva para este dia</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className={`p-4 border rounded-lg shadow-sm ${
                        reservation.status === "cancelled"
                          ? "bg-gray-100 opacity-60"
                          : "bg-white"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">
                            {reservation.customer_name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {getTourDisplayName(reservation.tour_type)}
                          </p>
                        </div>
                        {getStatusBadge(reservation.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {reservation.reservation_time}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          {reservation.number_of_people} pessoas
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <p className="font-semibold">
                          €{reservation.total_price}
                        </p>
                        {reservation.special_requests && (
                          <p className="text-gray-600 italic">
                            "{reservation.special_requests}"
                          </p>
                        )}
                      </div>
                      {/* Botões de ação */}
                      <div className="mt-3 flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            openWhatsappMessageEditor(reservation, "confirmed")
                          }
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-green-600 border-green-200 hover:bg-green-50 text-xs font-semibold"
                        >
                          Enviar WhatsApp
                        </Button>

                        {/* Botão de anular reserva - apenas para reservas não canceladas */}
                        {reservation.status !== "cancelled" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setReservationToCancel(reservation);
                              setCancelReservationModalOpen(true);
                            }}
                            className="text-xs"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Anular
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de confirmação para tornar horário disponível */}
      <Dialog
        open={makeAvailableModalOpen}
        onOpenChange={setMakeAvailableModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tornar horário disponível</DialogTitle>
          </DialogHeader>
          <p>
            Deseja tornar o horário <b>{slotToMakeAvailable}</b> disponível?
          </p>
          {/* Exibir motivo e data/hora da última alteração, se houver bloqueio */}
          {slotToMakeAvailable &&
            (() => {
              const currentDate = format(calendarDate, "yyyy-MM-dd");
              console.log("Looking for block:", {
                date: currentDate,
                time: slotToMakeAvailable,
                blockedPeriods: blockedPeriods,
              });

              const block = blockedPeriods.find(
                (b) =>
                  b.date === currentDate && b.startTime === slotToMakeAvailable
              );

              console.log("Found block:", block);

              if (!block) {
                return (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="text-sm text-yellow-800">
                      Nenhum bloqueio encontrado para este horário.
                    </div>
                  </div>
                );
              }

              return (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <div className="text-sm text-red-800 font-semibold mb-1">
                    Motivo da indisponibilidade:
                  </div>
                  <div className="text-sm text-gray-700 mb-1">
                    {block.reason || "(Sem motivo especificado)"}
                  </div>
                  {block.createdAt && (
                    <div className="text-xs text-gray-500">
                      Última alteração:{" "}
                      {new Date(block.createdAt).toLocaleString("pt-PT")}
                    </div>
                  )}
                </div>
              );
            })()}
          <DialogFooter>
            <Button
              variant="default"
              onClick={async () => {
                if (slotToMakeAvailable) {
                  await makeTimeAvailable(calendarDate, slotToMakeAvailable);
                }
                setMakeAvailableModalOpen(false);
                setSlotToMakeAvailable(null);
              }}
            >
              Tornar Disponível
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCalendar;
