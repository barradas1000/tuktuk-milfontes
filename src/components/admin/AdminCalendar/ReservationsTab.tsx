// src/components/admin/AdminCalendar/ReservationsTab.tsx
import React from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useAdminReservations } from "@/hooks/useAdminReservations";
import { AdminReservation } from "@/types/adminReservations";
import { ReservationCard } from "./ReservationCard";

type Props = {
  selectedDate: Date | null;
  getTourDisplayName: (tourType: string) => string;
};

export const ReservationsTab = ({ selectedDate, getTourDisplayName }: Props) => {
  const { reservations, isLoading } = useAdminReservations();

  const dayReservations: AdminReservation[] = reservations.filter((res) => {
    if (!selectedDate) return false;
    return res.reservation_date === format(selectedDate, "yyyy-MM-dd");
  });

  if (!selectedDate) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Nenhuma data selecionada
            </h3>
            <p className="text-gray-500">
              Selecione uma data no calendário para ver as reservas.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando reservas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (dayReservations.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Nenhuma reserva encontrada
            </h3>
            <p className="text-gray-500">
              Não há reservas para a data selecionada.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {dayReservations.map((reservation) => (
        <ReservationCard
          key={reservation.id}
          reservation={reservation}
          getTourDisplayName={getTourDisplayName}
        />
      ))}
    </div>
  );
};

export default ReservationsTab;
