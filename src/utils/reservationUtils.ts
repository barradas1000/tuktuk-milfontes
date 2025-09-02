// src/utils/reservationUtils.ts
import { AdminReservation } from "@/types/adminReservations";

export type SlotStatus =
  | "available"
  | "blocked_by_admin"
  | "blocked_by_reservation"
  | "unavailable";

export interface AvailabilitySlot {
  date: string;
  time: string;
  status: SlotStatus;
  capacity: number;
  reserved: number;
  available: boolean; // ✅ obrigatório
  reason?: string;
}

export const calculateStatistics = (reservations: AdminReservation[]) => {
  const today = new Date().toISOString().split("T")[0];
  const confirmedToday = reservations.filter(
    (r) =>
      r.status === "confirmed" && r.reservation_date === today
  ).length;
  const pendingToday = reservations.filter(
    (r) => r.status === "pending" && r.reservation_date === today
  ).length;
  const cancelledToday = reservations.filter(
    (r) =>
      r.status === "cancelled" && r.reservation_date === today
  ).length;

  // Calcular total de pessoas confirmadas para hoje
  const totalPeopleToday = reservations
    .filter(
      (r) =>
        r.status === "confirmed" && r.reservation_date === today
    )
    .reduce((sum, r) => sum + (r.number_of_people || 0), 0);

  // Calcular faturamento estimado (exemplo simples)
  const estimatedRevenue = reservations
    .filter(
      (r) =>
        r.status === "confirmed" && r.reservation_date === today
    )
    .reduce((sum, r) => sum + (r.total_price || 0), 0);

  return {
    confirmedToday,
    pendingToday,
    cancelledToday,
    totalPeopleToday,
    estimatedRevenue,
  };
};

export const generateDynamicTimeSlots = (
  startHour = 9,
  endHour = 22,
  intervalMinutes = 15
): string[] => {
  const slots: string[] = [];
  let currentHour = startHour;
  let currentMinute = 30; // iniciar 09:30
  const endMinute = 30; // terminar 22:30

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMinute <= endMinute)
  ) {
    const h = currentHour.toString().padStart(2, "0");
    const m = currentMinute.toString().padStart(2, "0");
    slots.push(`${h}:${m}`);

    currentMinute += intervalMinutes;
    if (currentMinute >= 60) {
      currentMinute = 0;
      currentHour++;
    }
  }
  return slots;
};

export const getReservationsByDate = (
  reservations: AdminReservation[],
  date: string
): AdminReservation[] =>
  reservations.filter((r) => r.reservation_date === date);

export const getAvailabilityForDate = (
  reservations: AdminReservation[],
  date: string
): AvailabilitySlot[] => {
  const timeSlots = generateDynamicTimeSlots();
  const dateReservations = getReservationsByDate(reservations, date);

  return timeSlots.map((time) => {
    const slotReservations = dateReservations.filter(
      (r) => r.reservation_time === time && r.status !== "cancelled"
    );
    const reserved = slotReservations.reduce(
      (sum, r) => sum + r.number_of_people,
      0
    );

    // Bloqueio por reserva confirmada
    const hasConfirmedReservation = dateReservations.some(
      (r) => r.reservation_time === time && r.status === "confirmed"
    );
    if (hasConfirmedReservation) {
      return {
        date,
        time,
        status: "blocked_by_reservation",
        capacity: 4,
        reserved,
        available: false,
        reason: "Reserva confirmada",
      };
    }

    // Disponível ou indisponível por lotação
    if (reserved < 4) {
      return {
        date,
        time,
        status: "available",
        capacity: 4,
        reserved,
        available: true,
      };
    } else {
      return {
        date,
        time,
        status: "unavailable",
        capacity: 4,
        reserved,
        available: false,
      };
    }
  });
};

export const getAvailabilityWithBlocks = (
  reservations: AdminReservation[],
  blockedPeriods: {
    date: string;
    startTime?: string;
    endTime?: string;
    reason?: string;
  }[],
  date: string
): AvailabilitySlot[] => {
  const timeSlots = generateDynamicTimeSlots();
  const dateReservations = getReservationsByDate(reservations, date);

  return timeSlots.map((time) => {
    const slotReservations = dateReservations.filter(
      (r) => r.reservation_time === time && r.status !== "cancelled"
    );
    const reserved = slotReservations.reduce(
      (sum, r) => sum + r.number_of_people,
      0
    );

    // Bloqueio por reserva confirmada
    const hasConfirmedReservation = dateReservations.some(
      (r) => r.reservation_time === time && r.status === "confirmed"
    );
    if (hasConfirmedReservation) {
      return {
        date,
        time,
        status: "blocked_by_reservation",
        capacity: 4,
        reserved,
        available: false,
        reason: "Reserva confirmada",
      };
    }

    // Bloqueio manual do admin
    const adminBlock = blockedPeriods.find(
      (b) => b.date === date && b.startTime === time
    );
    if (adminBlock) {
      return {
        date,
        time,
        status: "blocked_by_admin",
        capacity: 4,
        reserved,
        available: false,
        reason: adminBlock.reason,
      };
    }

    // Bloqueio do dia inteiro
    const dayBlock = blockedPeriods.find(
      (b) => b.date === date && !b.startTime && !b.endTime
    );
    if (dayBlock) {
      return {
        date,
        time,
        status: "blocked_by_admin",
        capacity: 4,
        reserved,
        available: false,
        reason: dayBlock.reason || "Dia bloqueado pelo administrador",
      };
    }

    // Disponível ou indisponível por lotação
    if (reserved < 4) {
      return {
        date,
        time,
        status: "available",
        capacity: 4,
        reserved,
        available: true,
      };
    } else {
      return {
        date,
        time,
        status: "unavailable",
        capacity: 4,
        reserved,
        available: false,
      };
    }
  });
};
