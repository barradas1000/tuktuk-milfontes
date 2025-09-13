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
  number_of_people: number;
  special_requests?: string;
  total_price?: number;
  created_at?: string;
  status?: string;
  language?: string;
}

// Novo tipo para HourlyAvailabilityCard e reserva de slots
export interface AvailabilitySlot {
  time: string;            // hora do slot, ex: "09:00"
  available: boolean;      // se está disponível ou não
  reserved?: number;       // número de lugares reservados
  capacity?: number;       // capacidade total do slot
}

