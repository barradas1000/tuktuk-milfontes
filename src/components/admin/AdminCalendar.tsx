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
} from "@/services/supabaseService";
import { BlockedPeriod } from "@/types/adminReservations";
import { AdminReservation } from "@/types/adminReservations";

// --- Helper Functions (pode ser movido para um arquivo separado, ex: utils/time.ts ou utils/format.ts) ---
const timeSlots = [
  "09:00",
  "10:30",
  "12:00",
  "14:00",
  "15:30",
  "17:00",
  "18:30",
];

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
      const block = blockedPeriods.find(
        (b) => b.date === dateString && b.startTime === time
      );
      return block?.reason || "Horário bloqueado";
    },
    [blockedPeriods]
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
      try {
        console.log("Bloqueando horário:", dateString, time, reason);

        // Verificar se já está bloqueado
        const alreadyBlocked = blockedPeriods.some(
          (b) => b.date === dateString && b.startTime === time
        );

        if (alreadyBlocked) {
          console.log("Horário já está bloqueado:", time);
          return;
        }

        const newBlock = await createBlockedPeriod({
          date: dateString,
          startTime: time,
          endTime: time,
          reason,
          createdBy: userEmail,
        });

        setBlockedPeriods((prev) => [...prev, newBlock]);
        console.log("Horário bloqueado com sucesso:", time);
      } catch (error) {
        console.error("Error blocking time:", error);
        alert("Erro ao bloquear o horário. Tente novamente.");
      }
    },
    [blockedPeriods, userEmail]
  );

  const unblockTime = useCallback(async (date: Date, time: string) => {
    const dateString = format(date, "yyyy-MM-dd");
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
  }, []);

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
      // Se o dia clicado estiver bloqueado, abre o modal de desbloqueio
      if (isDayBlocked(date)) {
        setBlockDate(date);
        setBlockDayReason(getDayBlockReason(date)); // Pré-preenche o motivo
        setBlockDayModalOpen(true);
        return;
      }
      // Caso contrário, abre o quick view e seleciona a data
      setQuickViewDate(date);
      setQuickViewOpen(true);
      handleDateSelect(date);
    },
    [isDayBlocked, handleDateSelect, getDayBlockReason]
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
    () => getReservationsByDate(selectedDate),
    [selectedDate, getReservationsByDate]
  );
  const availabilitySlots = useMemo(
    () => getAvailabilityForDate(selectedDate),
    [selectedDate, getAvailabilityForDate]
  );

  // --- Efeitos (Opcional, para sincronizar state inicial ou outros efeitos colaterais) ---
  // Exemplo: Sincronizar calendarDate com selectedDate se este mudar externamente
  useEffect(() => {
    setCalendarDate(new Date(selectedDate));
  }, [selectedDate]);

  // --- Efeitos para carregar dados do Supabase ---
  useEffect(() => {
    const loadBlockedPeriods = async () => {
      try {
        setBlockedPeriodsLoading(true);
        const data = await fetchBlockedPeriods();
        setBlockedPeriods(data);
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

  // --- Renderização do Componente ---
  return (
    <div>
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
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availabilitySlots.map((slot) => {
              const blocked = isTimeBlocked(calendarDate, slot.time);
              return (
                <div
                  key={slot.time}
                  className={`p-3 rounded-lg border text-center transition-all duration-200 cursor-pointer hover:scale-105 ${
                    blocked
                      ? "border-gray-300 bg-gray-200 opacity-60"
                      : slot.available
                      ? "border-green-200 bg-green-50 hover:bg-green-100"
                      : "border-red-200 bg-red-50 hover:bg-red-100"
                  }`}
                  title={
                    blocked
                      ? `${getTimeBlockReason(
                          calendarDate,
                          slot.time
                        )} - Clique para desbloquear`
                      : `Clique para bloquear ${slot.time}`
                  }
                  onClick={() => {
                    if (blocked) {
                      // Se está bloqueado, desbloquear
                      unblockTime(calendarDate, slot.time);
                    } else {
                      // Se não está bloqueado, abrir modal para bloquear
                      setBlockDate(calendarDate);
                      setBlockHourStart(slot.time);
                      setBlockHourEnd(slot.time);
                      setBlockHourModalOpen(true);
                    }
                  }}
                >
                  <div className="font-semibold flex items-center justify-center gap-1">
                    {slot.time}{" "}
                    {blocked && <Lock className="w-4 h-4 inline ml-1" />}
                  </div>
                  <div className="text-sm text-gray-600">
                    {slot.reserved}/{slot.capacity} pessoas
                  </div>
                  <div
                    className={`text-xs font-medium mt-1 ${
                      blocked
                        ? "text-gray-500"
                        : slot.available
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {blocked
                      ? getTimeBlockReason(calendarDate, slot.time)
                      : slot.available
                      ? "Disponível"
                      : "Completo"}
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
          {/* Bloco dos botões com lógica condicional de cor */}
          {(() => {
            // Lógica para variant dos botões
            const hasBlockedDay = blockedPeriods.some(
              (b) => !b.startTime && !b.endTime
            );
            const hasBlockedHour = blockedPeriods.some((b) => b.startTime);
            const dayBtnVariant = hasBlockedDay ? "destructive" : "default";
            const hourBtnVariant = hasBlockedHour ? "destructive" : "default";
            return (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-4">
                <Button
                  size="sm"
                  variant={dayBtnVariant}
                  className="flex flex-col items-center justify-center w-28 min-h-[80px] px-3 py-3 text-xs sm:text-sm whitespace-normal text-center"
                  onClick={() => setBlockDayModalOpen(true)}
                >
                  <Lock className="w-5 h-5 mb-1" />
                  <span className="leading-tight block w-full">
                    Bloquear
                    <br />
                    Desbloquear
                    <br />
                    Dias
                  </span>
                </Button>
                <Button
                  size="sm"
                  variant={hourBtnVariant}
                  className="flex flex-col items-center justify-center w-28 min-h-[80px] px-3 py-3 text-xs sm:text-sm whitespace-normal text-center"
                  onClick={() => setBlockHourModalOpen(true)}
                >
                  <Clock className="w-5 h-5 mb-1" />
                  <span className="leading-tight block w-full">
                    Bloquear
                    <br />
                    Desbloquear
                    <br />
                    Horas
                  </span>
                </Button>
              </div>
            );
          })()}
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
                          : getDayLabel(status)}
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
            </div>
          </div>
          {/* Botão de bloqueio rápido do restante do dia, agora abaixo do calendário e legenda */}
          <div className="flex flex-col items-center mt-4 mb-2">
            <Button
              size="sm"
              variant="secondary"
              className="flex flex-col items-center justify-center w-32 min-h-[80px] px-3 py-3 text-xs sm:text-sm whitespace-normal text-center border-2 border-purple-400"
              onClick={async () => {
                const now = new Date();
                const todayStr = format(now, "yyyy-MM-dd");

                // Bloqueia todos os horários restantes do dia
                const remainingSlots = timeSlots.filter((slot) => {
                  const [h, m] = slot.split(":");
                  const slotDate = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate(),
                    Number(h),
                    Number(m)
                  );
                  return slotDate > now;
                });

                if (remainingSlots.length === 0) {
                  setQuickBlockInfo(
                    "Não há horários restantes para bloquear hoje"
                  );
                  return;
                }

                try {
                  for (const slot of remainingSlots) {
                    await blockTime(
                      now,
                      slot,
                      "Bloqueio rápido do restante do dia"
                    );
                  }
                  setQuickBlockInfo(
                    `${remainingSlots.length} horários restantes bloqueados`
                  );
                } catch (error) {
                  setQuickBlockInfo("Erro ao bloquear horários restantes");
                }
              }}
            >
              <Lock className="w-5 h-5 mb-1 text-purple-600" />
              <span className="leading-tight block w-full text-purple-700">
                Bloquear
                <br />
                Restante
                <br />
                do Dia
              </span>
            </Button>
            {/* Informativo de bloqueio rápido */}
            {quickBlockInfo && (
              <div className="text-center text-purple-700 font-semibold mt-2">
                {quickBlockInfo}
              </div>
            )}
          </div>
          {/* Se houver reservas hoje, mostrar botão para anular e avisar cliente */}
          {(() => {
            const todayStr = format(new Date(), "yyyy-MM-dd");
            const todayReservations = getReservationsByDate(todayStr);
            if (todayReservations.length > 0) {
              return (
                <div className="flex flex-col items-center gap-2 mb-2">
                  <div className="text-sm text-red-600 font-semibold">
                    Há reservas para hoje!
                  </div>
                  {todayReservations.map((res) => (
                    <div
                      key={res.id}
                      className="border rounded p-2 w-full max-w-xs bg-gray-50"
                    >
                      <div className="font-bold">{res.customer_name}</div>
                      <div className="text-xs text-gray-700">
                        {getTourDisplayName(res.tour_type)} -{" "}
                        {res.reservation_time} - {res.number_of_people} pessoas
                      </div>
                      <div className="text-xs text-gray-500">
                        Pagamento: €{res.total_price}
                      </div>
                      <div className="text-xs text-gray-500">
                        Pedidos: {res.special_requests || "-"}
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="mt-1 w-full"
                        onClick={() => {
                          setReservationToCancel(res);
                          setCancelReservationModalOpen(true);
                        }}
                      >
                        Anular reserva
                      </Button>
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          })()}
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
            <label className="text-sm font-medium text-orange-800">
              Filtrar por:
            </label>
            <select
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
            <label className="text-sm font-medium text-orange-800">Data:</label>
            <input
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
                {getFilteredBlocks()
                  .filter((b) => b.startTime)
                  .sort((a, b) => {
                    const dateCompare =
                      new Date(a.date).getTime() - new Date(b.date).getTime();
                    if (dateCompare !== 0) return dateCompare;
                    return (a.startTime || "").localeCompare(b.startTime || "");
                  })
                  .map((block) => (
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

        {/* Modal de bloqueio/desbloqueio de dias */}
        <Dialog open={blockDayModalOpen} onOpenChange={setBlockDayModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Bloquear/Desbloquear Dias</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex flex-row flex-wrap gap-2 items-center">
                <span className="font-semibold">Dia inteiro</span>
                {blockDate && isDayBlocked(blockDate) ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => unblockDay(blockDate)}
                  >
                    Desbloquear dia
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() =>
                      blockDate && blockDay(blockDate, blockDayReason)
                    }
                  >
                    Bloquear dia
                  </Button>
                )}
                <span className="font-semibold ml-4">Bloquear vários dias</span>
                <span>Início:</span>
                <input
                  type="date"
                  value={blockDaysStart}
                  onChange={(e) => setBlockDaysStart(e.target.value)}
                  className="border rounded p-1"
                />
                <span>Fim:</span>
                <input
                  type="date"
                  value={blockDaysEnd}
                  onChange={(e) => setBlockDaysEnd(e.target.value)}
                  className="border rounded p-1"
                />
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    if (blockDaysStart && blockDaysEnd) {
                      const start = new Date(blockDaysStart);
                      const end = new Date(blockDaysEnd);
                      const days = eachDayOfInterval({ start, end });
                      days.forEach((day) => blockDay(day, blockDayReason));
                    } else if (blockDate) {
                      blockDay(blockDate, blockDayReason);
                    }
                  }}
                >
                  Bloquear dias
                </Button>
              </div>
              {blockDate && isDayBlocked(blockDate) && (
                <div className="text-xs text-gray-500">
                  {getDayBlockReason(blockDate)}
                </div>
              )}
              <div className="mt-2">
                <b>Motivo (opcional):</b>
                <input
                  type="text"
                  className="w-full border rounded p-2 mt-1"
                  value={blockDayReason}
                  onChange={(e) => setBlockDayReason(e.target.value)}
                />
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  variant="secondary"
                  onClick={() => setBlockDayModalOpen(false)}
                >
                  Fechar
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
                <label className="font-semibold text-sm">Data:</label>
                <input
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
                      getAllDayBlocks(blockDate)
                        .filter((b) => b.startTime)
                        .map((block) => (
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
    </div>
  );
};

export default AdminCalendar;
