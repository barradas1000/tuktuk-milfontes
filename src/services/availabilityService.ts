import { supabase } from "@/integrations/supabase/client";
import { mockReservations } from "@/data/mockReservations";
import { checkSupabaseConfiguration } from "./supabaseService";
import { generateDynamicTimeSlots } from "@/utils/reservationUtils";

export interface AvailabilityCheck {
  isAvailable: boolean;
  existingReservations: number;
  maxCapacity: number;
  alternativeTimes: string[];
  message: string;
}

export interface ReservationConflict {
  date: string;
  time: string;
  existingPeople: number;
  requestedPeople: number;
  maxCapacity: number;
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
  existingReservations: any[]
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
    let existingReservations: any[] = [];
    if (isConfigured) {
      const { data, error } = await supabase
        .from("reservations")
        .select("number_of_people, status, reservation_time, tour_type")
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
    let existingReservations: any[] = [];
    if (isConfigured) {
      const { data } = await supabase
        .from("reservations")
        .select("number_of_people, status, reservation_time, tour_type")
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
      let existingReservations: any[] = [];

      if (isConfigured) {
        const { data } = await supabase
          .from("reservations")
          .select("number_of_people, status")
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
