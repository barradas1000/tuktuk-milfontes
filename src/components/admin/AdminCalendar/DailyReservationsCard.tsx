// /components/admin/AdminCalendar/DailyReservationsCard.tsx
import React from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock, Users, Eye } from "lucide-react";
import { AdminReservation } from "@/types/adminReservations";
import { getTourDisplayName, getStatusBadge } from "./helpers";

interface DailyReservationsCardProps {
  selectedDate: string;
  reservations: AdminReservation[];
}

const DailyReservationsCard = ({ selectedDate, reservations }: DailyReservationsCardProps) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          {format(new Date(selectedDate), "dd MMMM", { locale: pt })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <h3 className="font-semibold mb-3">
            Reservas ({reservations.length})
          </h3>
          {reservations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma reserva para este dia</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className={`p-4 border rounded-lg shadow-sm ${
                    reservation.status === "cancelled"
                      ? "bg-gray-100 opacity-60"
                      : "bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{reservation.customer_name}</h4>
                      <p className="text-sm text-gray-600">
                        {getTourDisplayName(reservation.tour_type)}
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
                    <p className="font-semibold">€{reservation.total_price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyReservationsCard;
