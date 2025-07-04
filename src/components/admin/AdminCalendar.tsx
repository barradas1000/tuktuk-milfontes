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
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

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
  const { getReservationsByDate, getAvailabilityForDate } =
    useAdminReservations();

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

  // --- Estados para seleção de condutores ---
  const [activeConductors, setActiveConductors] = useState<string[]>([]);
  const [conductorsLoading, setConductorsLoading] = useState(true);
  const [conductors, setConductors] = useState(FALLBACK_CONDUCTORS);

  // --- Funções de Lógica de Negócio (Memorizadas para performance) ---

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

  // --- Funções de Manipulação de Bloqueios (Refatoradas para clareza) ---

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
          createdBy: "admin",
        });

        setBlockedPeriods((prev) => [...prev, newBlock]);
      } catch (error) {
        console.error("Error blocking day:", error);
      }
    },
    [blockedPeriods]
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
    } catch (error) {
      console.error("Error unblocking day:", error);
    }
  }, []);

  const blockTime = useCallback(
    async (date: Date, time: string, reason: string) => {
      const dateString = format(date, "yyyy-MM-dd");
      try {
        // Verificar se já está bloqueado
        const alreadyBlocked = blockedPeriods.some(
          (b) => b.date === dateString && b.startTime === time
        );

        if (alreadyBlocked) return;

        const newBlock = await createBlockedPeriod({
          date: dateString,
          startTime: time,
          endTime: time,
          reason,
          createdBy: "admin",
        });

        setBlockedPeriods((prev) => [...prev, newBlock]);
      } catch (error) {
        console.error("Error blocking time:", error);
      }
    },
    [blockedPeriods]
  );

  const unblockTime = useCallback(async (date: Date, time: string) => {
    const dateString = format(date, "yyyy-MM-dd");
    try {
      await deleteBlockedPeriodsByDate(dateString, time);
      setBlockedPeriods((prev) =>
        prev.filter((b) => !(b.date === dateString && b.startTime === time))
      );
    } catch (error) {
      console.error("Error unblocking time:", error);
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

  const handleBlockHourRange = useCallback(() => {
    if (!blockDate || !blockHourStart || !blockHourEnd) return;

    // Lógica para bloquear um intervalo de horas (assumindo que timeSlots é uma lista ordenada)
    const startIndex = timeSlots.indexOf(blockHourStart);
    const endIndex = timeSlots.indexOf(blockHourEnd);

    if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
      alert("Intervalo de horas inválido ou horas não encontradas nos slots.");
      return;
    }

    for (let i = startIndex; i <= endIndex; i++) {
      const time = timeSlots[i];
      blockTime(blockDate, time, blockTimeReason[time] || "");
    }
  }, [
    blockDate,
    blockHourStart,
    blockHourEnd,
    blockTimeReason,
    blockTime,
    timeSlots,
  ]);

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
        setBlockTab("day"); // Inicia na aba de dia para ver o bloqueio existente
        setBlockModalOpen(true);
        return;
      }
      // Caso contrário, abre o quick view e seleciona a data
      setQuickViewDate(date);
      setQuickViewOpen(true);
      handleDateSelect(date);
    },
    [isDayBlocked, handleDateSelect]
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
    const cleanPhone = phone.replace(/\D/g, "");
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick View Dialog */}
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
                          <b>Percurso:</b> {reserva.tour_type}
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
                                ? "bg-gray-300 cursor-not-allowed "
                                : modifiersClassNames[
                                    status as keyof typeof modifiersClassNames
                                  ] + " ") +
                              textColor +
                              " hover:scale-110 hover:shadow-lg focus:outline-none"
                            }
                            onClick={() =>
                              !blocked && handleDayClick(props.date)
                            }
                            disabled={blocked}
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
                            ? getDayBlockReason(props.date)
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
              </div>
            </div>
            {/* Botão de bloqueio rápido do restante do dia, agora abaixo do calendário e legenda */}
            <div className="flex flex-col items-center mt-4 mb-2">
              <Button
                size="sm"
                variant="secondary"
                className="flex flex-col items-center justify-center w-32 min-h-[80px] px-3 py-3 text-xs sm:text-sm whitespace-normal text-center border-2 border-purple-400"
                onClick={() => {
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
                  remainingSlots.forEach((slot) =>
                    blockTime(now, slot, "Bloqueio rápido do restante do dia")
                  );
                  setQuickBlockInfo("Restante do Dia Bloqueado");
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
                          {res.tour_type} - {res.reservation_time} -{" "}
                          {res.number_of_people} pessoas
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
                            setCancelledReservation(res);
                            setShowCancelReservation(true);
                            setQuickBlockInfo(
                              `Reserva de ${res.customer_name} anulada e cliente informado via WhatsApp.`
                            );
                          }}
                        >
                          Anular reserva e avisar cliente (WhatsApp)
                        </Button>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            })()}
            {/* Mensagem de confirmação de anulação */}
            {showCancelReservation && cancelledReservation && (
              <div className="text-center text-green-700 font-semibold mb-2">
                Reserva de {cancelledReservation.customer_name} anulada e
                cliente informado via WhatsApp.
                <br />
                <span className="text-xs text-gray-600">(Simulação)</span>
              </div>
            )}
          </CardContent>
        </Card>

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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Bloquear/Desbloquear Horas</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="font-semibold mb-2">
                Bloquear horas para o dia:{" "}
                {blockDate ? format(blockDate, "dd/MM/yyyy") : ""}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span>Início:</span>
                <input
                  type="time"
                  value={blockHourStart}
                  onChange={(e) => setBlockHourStart(e.target.value)}
                  className="border rounded p-1"
                />
                <span>Fim:</span>
                <input
                  type="time"
                  value={blockHourEnd}
                  onChange={(e) => setBlockHourEnd(e.target.value)}
                  className="border rounded p-1"
                />
                <Button
                  size="sm"
                  variant="default"
                  onClick={() =>
                    blockDate &&
                    blockTime(
                      blockDate,
                      blockHourStart + "-" + blockHourEnd,
                      blockTimeReason[blockHourStart + "-" + blockHourEnd] || ""
                    )
                  }
                >
                  Bloquear intervalo
                </Button>
              </div>
              <input
                type="text"
                placeholder="Motivo (opcional)"
                className="border rounded p-1 text-xs w-full mb-2"
                value={
                  blockTimeReason[blockHourStart + "-" + blockHourEnd] || ""
                }
                onChange={(e) =>
                  setBlockTimeReason((prev) => ({
                    ...prev,
                    [blockHourStart + "-" + blockHourEnd]: e.target.value,
                  }))
                }
              />
              {/* Listar todos os bloqueios de horários para o dia */}
              <div className="mt-2">
                <div className="font-semibold text-xs mb-1">
                  Horários bloqueados:
                </div>
                {getAllDayBlocks(blockDate || new Date()).filter(
                  (b) => b.startTime
                ).length === 0 && (
                  <div className="text-gray-500 text-xs">
                    Nenhum horário bloqueado neste dia.
                  </div>
                )}
                {getAllDayBlocks(blockDate || new Date())
                  .filter((b) => b.startTime)
                  .map((block) => (
                    <div
                      key={block.id}
                      className="flex items-center gap-2 mb-1"
                    >
                      <span className="text-xs">
                        {block.startTime?.replace("-", " às ")}
                      </span>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          blockDate && unblockTime(blockDate, block.startTime!)
                        }
                      >
                        Desbloquear
                      </Button>
                      {block.reason && (
                        <span className="text-xs text-gray-400 ml-2">
                          {block.reason}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
              <div className="flex justify-end mt-4">
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

        {/* Daily Reservations and Availability Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {format(new Date(selectedDate), "dd MMMM", { locale: pt })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="font-semibold mb-3">
                Disponibilidade por Horário
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availabilitySlots.map((slot) => {
                  const blocked = isTimeBlocked(calendarDate, slot.time);
                  return (
                    <div
                      key={slot.time}
                      className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                        blocked
                          ? "border-gray-300 bg-gray-200 opacity-60 cursor-not-allowed"
                          : slot.available
                          ? "border-green-200 bg-green-50"
                          : "border-red-200 bg-red-50"
                      }`}
                      title={
                        blocked
                          ? getTimeBlockReason(calendarDate, slot.time)
                          : undefined
                      }
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
            </div>
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
                      className="p-4 border rounded-lg bg-white shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">
                            {reservation.customer_name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {reservation.tour_type}
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
                      {/* Botão de WhatsApp para o cliente */}
                      <div className="mt-3 flex justify-end">
                        <a
                          href={getWhatsappLink(
                            getCurrentWhatsapp(),
                            `Olá ${reservation.customer_name}, sua reserva para o passeio '${reservation.tour_type}' está confirmada para o dia ${reservation.reservation_date} às ${reservation.reservation_time}. Qualquer dúvida, estamos à disposição!`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition"
                        >
                          Enviar WhatsApp
                        </a>
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
