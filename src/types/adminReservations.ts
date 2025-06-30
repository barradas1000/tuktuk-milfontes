
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
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  total_price: number;
  created_at: string;
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
