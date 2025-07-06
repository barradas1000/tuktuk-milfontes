export interface AdminReservation {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  reservation_date: string;
  reservation_time: string;
  number_of_people: number;
  tour_type: string;
  special_requests?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  total_price: number;
  manual_payment?: number;
  created_at: string;
  language?: string;
}

export interface AvailabilitySlot {
  date: string;
  time: string;
  available: boolean;
  capacity: number;
  reserved: number;
}

export interface ReservationStatistics {
  totalReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  todayReservations: number;
  monthlyReservations: number;
  totalRevenue: number;
}

export interface BlockedPeriod {
  id: string;
  date: string; // formato yyyy-MM-dd
  startTime?: string; // formato HH:mm, opcional para bloqueio de dia inteiro
  endTime?: string; // formato HH:mm, opcional para bloqueio de dia inteiro
  reason?: string;
  createdBy: string;
  createdAt?: string; // Data/hora de criação do bloqueio
}
