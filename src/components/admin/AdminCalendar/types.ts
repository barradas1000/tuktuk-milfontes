// Tipos e interfaces compartilhados

export interface BlockedPeriod {
  id: string;
  date: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
  createdAt?: string;
}

export interface AdminReservation {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  tour_type: string;
  reservation_date: string;
  reservation_time: string;
  number_of_people?: number;
  special_requests?: string;
  total_price?: number;
  created_at?: string;
  status?: string;
  language?: string;
}
