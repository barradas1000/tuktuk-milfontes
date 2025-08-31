// /components/AdminCalendar/ReservationDetails.tsx
import React from 'react';
import { AdminReservation } from '@/types/adminReservations';

interface ReservationDetailsProps {
  reservation: AdminReservation;
  getTourDisplayName: (tourType: string) => string;
}

const ReservationDetails = ({ reservation, getTourDisplayName }: ReservationDetailsProps) => (
  <div className="space-y-1 text-sm">
    <p><strong>Cliente:</strong> {reservation.customer_name}</p>
    <p><strong>Telefone:</strong> {reservation.customer_phone}</p>
    <p><strong>Tour:</strong> {getTourDisplayName(reservation.tour_type)}</p>
    <p><strong>Data:</strong> {reservation.reservation_date}</p>
    <p><strong>Hora:</strong> {reservation.reservation_time}</p>
    <p><strong>Pessoas:</strong> {reservation.number_of_people}</p>
    <p><strong>Valor:</strong> €{reservation.total_price}</p>
  </div>
);

export default ReservationDetails;