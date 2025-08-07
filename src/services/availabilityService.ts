import { supabase } from "@/lib/supabase";
import { mockReservations } from "@/data/mockReservations";
import { checkSupabaseConfiguration } from "./supabaseService";
import { generateDynamicTimeSlots } from "@/utils/reservationUtils";

// Tipos para slots de tempo
export interface TimeSlot {
  time: string;
  status: SlotStatus;
  blockedBy?: "reservation" | "manual_block";
  reservationId?: string;
  tourType?: string;
  endTime?: string;
  conflictReason?: string;
}

export type SlotStatus = "available" | "occupied" | "blocked" | "buffer";

// Interface para dados de reserva
export interface ReservationData {
  id?: string;
  reservation_date: string;
  reservation_time: string;
  number_of_people: number;
  tour_type: string;
  status: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
}

// Interface para períodos bloqueados
export interface BlockedPeriod {
  id?: string;
  date: string;
  start_time: string;
  end_time: string;
  reason?: string;
  created_at?: string;
}

// Interfaces existentes mantidas para compatibilidade
export interface AvailabilityCheck {
  isAvailable: boolean;
  existingReservations: number;
  maxCapacity: number;
  alternativeTimes: string[];
  message: string;
  timeSlot?: TimeSlot; // Nova propriedade para informações detalhadas
}

export interface ReservationConflict {
  date: string;
  time: string;
  existingPeople: number;
  requestedPeople: number;
  maxCapacity: number;
  conflictingReservations?: ReservationData[]; // Nova propriedade para detalhes dos conflitos
}

// Nova interface para grid de disponibilidade
export interface DayAvailability {
  date: string;
  timeSlots: TimeSlot[];
  totalAvailable: number;
  totalBlocked: number;
  hasReservations: boolean;
}

const MAX_CAPACITY = 1; // Máximo de 1 reserva por horário (não importa o número de pessoas)

// Duração dos tours (em minutos)
const TOUR_DURATIONS: Record<string, number> = {
  panoramic: 45,
  furnas: 60,
  bridge: 45,
  sunset: 90,
  night: 35,
  fishermen: 45,
};

// Função utilitária para somar minutos a uma hora (HH:mm)
function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const date = new Date(2000, 0, 1, h, m);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toTimeString().slice(0, 5);
}

// Função para verificar sobreposição de intervalos
function intervalsOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return startA < endB && startB < endA;
}

// Função para ordenar horários (HH:mm)
function compareTimes(a: string, b: string): number {
  return a.localeCompare(b);
}

// Função para encontrar o próximo horário disponível entre serviços
function findNextAvailableTime(
  date: string,
  requestedTime: string,
  duration: number,
  existingReservations: ReservationData[]
): string | null {
  // Ordenar reservas por hora de início
  const sorted = existingReservations
    .map((r) => ({
      start: r.reservation_time,
      end: addMinutesToTime(
        r.reservation_time,
        TOUR_DURATIONS[r.tour_type] || 45
      ),
    }))
    .sort((a, b) => compareTimes(a.start, b.start));

  // Procurar espaço antes da primeira reserva
  if (sorted.length === 0) return requestedTime;
  const dayStart = "08:00"; // pode ser ajustado
  const dayEnd = "20:00"; // pode ser ajustado

  // Tentar encaixar antes da primeira reserva
  if (compareTimes(requestedTime, sorted[0].start) < 0) {
    const endNew = addMinutesToTime(requestedTime, duration);
    if (compareTimes(endNew, sorted[0].start) <= 0) {
      return requestedTime;
    }
  }

  // Tentar encaixar entre reservas
  for (let i = 0; i < sorted.length - 1; i++) {
    const endCurrent = sorted[i].end;
    const startNext = sorted[i + 1].start;
    // O espaço entre endCurrent e startNext
    if (
      compareTimes(requestedTime, endCurrent) >= 0 &&
      compareTimes(addMinutesToTime(requestedTime, duration), startNext) <= 0
    ) {
      return requestedTime;
    }
    // Sugerir encaixe entre reservas
    if (compareTimes(endCurrent, startNext) < 0) {
      const gap =
        parseInt(startNext.replace(":", "")) -
        parseInt(endCurrent.replace(":", ""));
      const endNew = addMinutesToTime(endCurrent, duration);
      if (
        compareTimes(endNew, startNext) <= 0 &&
        compareTimes(endCurrent, requestedTime) >= 0
      ) {
        return endCurrent;
      }
    }
  }

  // Tentar encaixar após a última reserva
  const lastEnd = sorted[sorted.length - 1].end;
  if (
    compareTimes(requestedTime, lastEnd) >= 0 &&
    compareTimes(addMinutesToTime(requestedTime, duration), dayEnd) <= 0
  ) {
    return requestedTime;
  }
  // Sugerir logo após a última reserva
  if (compareTimes(addMinutesToTime(lastEnd, duration), dayEnd) <= 0) {
    return lastEnd;
  }
  return null;
}

export const checkAvailability = async (
  date: string,
  time: string,
  numberOfPeople: number,
  tourType?: string
): Promise<AvailabilityCheck> => {
  const isConfigured = checkSupabaseConfiguration();
  try {
    let existingReservations: ReservationData[] = [];
    if (isConfigured) {
      const { data, error } = await supabase
        .from("reservations")
        .select(
          "id, reservation_date, reservation_time, number_of_people, tour_type, status"
        )
        .eq("reservation_date", date)
        .neq("status", "cancelled");
      if (error) {
        console.error("Error checking availability:", error);
        return {
          isAvailable: false,
          existingReservations: 0,
          maxCapacity: MAX_CAPACITY,
          alternativeTimes: [],
          message: "Erro ao verificar disponibilidade",
        };
      }
      existingReservations = data || [];
    } else {
      existingReservations = mockReservations.filter(
        (r) => r.reservation_date === date && r.status !== "cancelled"
      );
    }
    const duration = tourType ? TOUR_DURATIONS[tourType] : 45;
    const startNew = time;
    const endNew = addMinutesToTime(time, duration);
    // Ordenar reservas existentes
    const sorted = existingReservations
      .map((r) => ({
        start: r.reservation_time,
        end: addMinutesToTime(
          r.reservation_time,
          TOUR_DURATIONS[r.tour_type] || 45
        ),
      }))
      .sort((a, b) => compareTimes(a.start, b.start));
    // Verificar se há sobreposição
    const hasOverlap = sorted.some((r) =>
      intervalsOverlap(startNew, endNew, r.start, r.end)
    );
    // Verificar encaixe entre serviços
    let isAvailable = !hasOverlap;
    if (isAvailable) {
      // Garantir que cabe entre serviços
      for (let i = 0; i < sorted.length; i++) {
        if (
          compareTimes(startNew, sorted[i].end) < 0 &&
          compareTimes(endNew, sorted[i].start) > 0
        ) {
          isAvailable = false;
          break;
        }
      }
    }
    // Sugerir próximo horário possível
    let nextAvailable = null;
    if (!isAvailable) {
      nextAvailable = findNextAvailableTime(
        date,
        time,
        duration,
        existingReservations
      );
    }
    const alternativeTimes = nextAvailable ? [nextAvailable] : [];
    const message = isAvailable
      ? "Horário disponível!"
      : `Este horário já está reservado por outro cliente.`;
    return {
      isAvailable,
      existingReservations: existingReservations.length,
      maxCapacity: MAX_CAPACITY,
      alternativeTimes,
      message,
    };
  } catch (error) {
    console.error("Error checking availability:", error);
    return {
      isAvailable: false,
      existingReservations: 0,
      maxCapacity: MAX_CAPACITY,
      alternativeTimes: [],
      message: "Erro ao verificar disponibilidade",
    };
  }
};

export const generateAlternativeTimes = async (
  date: string,
  numberOfPeople: number,
  tourType?: string
): Promise<string[]> => {
  const isConfigured = checkSupabaseConfiguration();
  const alternatives: string[] = [];
  try {
    const timeSlots = generateDynamicTimeSlots();
    let existingReservations: ReservationData[] = [];
    if (isConfigured) {
      const { data } = await supabase
        .from("reservations")
        .select(
          "id, reservation_date, reservation_time, number_of_people, tour_type, status"
        )
        .eq("reservation_date", date)
        .neq("status", "cancelled");
      existingReservations = data || [];
    } else {
      existingReservations = mockReservations.filter(
        (r) => r.reservation_date === date && r.status !== "cancelled"
      );
    }
    const duration = tourType ? TOUR_DURATIONS[tourType] : 45;
    // Ordenar reservas existentes
    const sorted = existingReservations
      .map((r) => ({
        start: r.reservation_time,
        end: addMinutesToTime(
          r.reservation_time,
          TOUR_DURATIONS[r.tour_type] || 45
        ),
      }))
      .sort((a, b) => compareTimes(a.start, b.start));
    for (const timeSlot of timeSlots) {
      const startNew = timeSlot;
      const endNew = addMinutesToTime(timeSlot, duration);
      // Verificar se encaixa entre serviços
      let fits = true;
      for (let i = 0; i < sorted.length; i++) {
        if (
          intervalsOverlap(startNew, endNew, sorted[i].start, sorted[i].end)
        ) {
          fits = false;
          break;
        }
      }
      if (fits) {
        alternatives.push(timeSlot);
      }
    }
    return alternatives;
  } catch (error) {
    console.error("Error generating alternative times:", error);
    return [];
  }
};

export const getAvailabilityForDate = async (
  date: string
): Promise<Record<string, number>> => {
  const isConfigured = checkSupabaseConfiguration();
  const availability: Record<string, number> = {};

  try {
    const timeSlots = generateDynamicTimeSlots();
    for (const timeSlot of timeSlots) {
      let existingReservations: ReservationData[] = [];

      if (isConfigured) {
        const { data } = await supabase
          .from("reservations")
          .select(
            "id, reservation_date, reservation_time, number_of_people, tour_type, status"
          )
          .eq("reservation_date", date)
          .eq("reservation_time", timeSlot)
          .neq("status", "cancelled");

        existingReservations = data || [];
      } else {
        existingReservations = mockReservations.filter(
          (r) =>
            r.reservation_date === date &&
            r.reservation_time === timeSlot &&
            r.status !== "cancelled"
        );
      }

      // 0 = disponível, 1 = ocupado
      availability[timeSlot] = existingReservations.length === 0 ? 0 : 1;
    }

    return availability;
  } catch (error) {
    console.error("Error getting availability for date:", error);
    return {};
  }
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};

// ============================
// NOVAS FUNÇÕES PARA GRID AVANÇADA
// ============================

/**
 * Calcula o horário de fim de um tour
 */
export const calculateTourEndTime = (
  startTime: string,
  tourType: string
): string => {
  const duration = TOUR_DURATIONS[tourType] || 45;
  return addMinutesToTime(startTime, duration);
};

/**
 * Verifica se dois tours conflitam considerando suas durações
 */
export const toursConflict = (
  tour1Start: string,
  tour1Type: string,
  tour2Start: string,
  tour2Type: string
): boolean => {
  const tour1End = calculateTourEndTime(tour1Start, tour1Type);
  const tour2End = calculateTourEndTime(tour2Start, tour2Type);

  return intervalsOverlap(tour1Start, tour1End, tour2Start, tour2End);
};

/**
 * Determina o status de um slot considerando duração dos tours
 */
export const determineSlotStatus = (
  slotTime: string,
  reservations: ReservationData[],
  blockedPeriods: BlockedPeriod[] = []
): SlotStatus => {
  // Verificar se está bloqueado manualmente
  const isManuallyBlocked = blockedPeriods.some((period) => {
    // Lógica para verificar se o slot está em um período bloqueado
    // Isso depende da estrutura da tabela blocked_periods
    return period.start_time <= slotTime && slotTime < period.end_time;
  });

  if (isManuallyBlocked) {
    return "blocked";
  }

  // Verificar se há uma reserva que começa exatamente neste horário
  const exactReservation = reservations.find(
    (r) => r.reservation_time === slotTime
  );
  if (exactReservation) {
    return "occupied";
  }

  // Verificar se este slot está dentro da duração de alguma reserva
  const isWithinTourDuration = reservations.some((reservation) => {
    const tourEnd = calculateTourEndTime(
      reservation.reservation_time,
      reservation.tour_type
    );
    return slotTime >= reservation.reservation_time && slotTime < tourEnd;
  });

  if (isWithinTourDuration) {
    return "buffer";
  }

  return "available";
};

/**
 * Gera grid de disponibilidade para um dia específico
 */
export const generateDayAvailability = async (
  date: string
): Promise<DayAvailability> => {
  const isConfigured = checkSupabaseConfiguration();

  try {
    // Buscar reservas do dia
    let reservations: ReservationData[] = [];
    if (isConfigured) {
      const { data } = await supabase
        .from("reservations")
        .select(
          "id, reservation_date, reservation_time, number_of_people, tour_type, status"
        )
        .eq("reservation_date", date)
        .neq("status", "cancelled");
      reservations = data || [];
    } else {
      reservations = mockReservations.filter(
        (r) => r.reservation_date === date && r.status !== "cancelled"
      );
    }

    // Buscar períodos bloqueados
    let blockedPeriods: BlockedPeriod[] = [];
    if (isConfigured) {
      const { data } = await supabase
        .from("blocked_periods")
        .select("*")
        .eq("date", date);
      blockedPeriods = data || [];
    }

    // Gerar slots para o dia
    const timeSlots = generateDynamicTimeSlots();
    const slots: TimeSlot[] = timeSlots.map((time) => {
      const status = determineSlotStatus(time, reservations, blockedPeriods);
      const reservation = reservations.find((r) => r.reservation_time === time);

      return {
        time,
        status,
        blockedBy:
          status === "occupied"
            ? "reservation"
            : status === "blocked"
            ? "manual_block"
            : undefined,
        reservationId: reservation?.id,
        tourType: reservation?.tour_type,
        endTime: reservation
          ? calculateTourEndTime(time, reservation.tour_type)
          : undefined,
      };
    });

    const totalAvailable = slots.filter((s) => s.status === "available").length;
    const totalBlocked = slots.filter((s) => s.status === "blocked").length;
    const hasReservations = reservations.length > 0;

    return {
      date,
      timeSlots: slots,
      totalAvailable,
      totalBlocked,
      hasReservations,
    };
  } catch (error) {
    console.error("Error generating day availability:", error);
    return {
      date,
      timeSlots: [],
      totalAvailable: 0,
      totalBlocked: 0,
      hasReservations: false,
    };
  }
};

/**
 * Gera grid de disponibilidade para múltiplos dias
 */
export const generateWeeklyAvailability = async (
  startDate: string,
  days: number = 7
): Promise<DayAvailability[]> => {
  const results: DayAvailability[] = [];

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    const dateString = currentDate.toISOString().split("T")[0];

    const dayAvailability = await generateDayAvailability(dateString);
    results.push(dayAvailability);
  }

  return results;
};

/**
 * Verifica se um novo tour pode ser agendado sem conflitos
 */
export const canScheduleTour = async (
  date: string,
  time: string,
  tourType: string
): Promise<{
  canSchedule: boolean;
  conflicts: ReservationData[];
  reason?: string;
}> => {
  const isConfigured = checkSupabaseConfiguration();

  try {
    let existingReservations: ReservationData[] = [];
    if (isConfigured) {
      const { data } = await supabase
        .from("reservations")
        .select(
          "id, reservation_date, reservation_time, number_of_people, tour_type, status"
        )
        .eq("reservation_date", date)
        .neq("status", "cancelled");
      existingReservations = data || [];
    } else {
      existingReservations = mockReservations.filter(
        (r) => r.reservation_date === date && r.status !== "cancelled"
      );
    }

    // Verificar conflitos com tours existentes
    const conflicts = existingReservations.filter((reservation) =>
      toursConflict(
        time,
        tourType,
        reservation.reservation_time,
        reservation.tour_type
      )
    );

    const canSchedule = conflicts.length === 0;
    const reason =
      conflicts.length > 0
        ? `Conflito com ${conflicts.length} reserva(s) existente(s)`
        : undefined;

    return {
      canSchedule,
      conflicts,
      reason,
    };
  } catch (error) {
    console.error("Error checking tour scheduling:", error);
    return {
      canSchedule: false,
      conflicts: [],
      reason: "Erro ao verificar disponibilidade",
    };
  }
};
