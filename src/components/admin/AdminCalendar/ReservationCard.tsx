// src/components/admin/AdminCalendar/ReservationCard.tsx
import React, { useState } from "react";
import { format } from "date-fns";
import { Clock, Users, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminReservation } from "@/types/adminReservations";
import { useAdminReservations } from "@/hooks/useAdminReservations";

interface ReservationCardProps {
  reservation: AdminReservation;
  getTourDisplayName: (tourType: string) => string;
}

export const ReservationCard = ({ reservation, getTourDisplayName }: ReservationCardProps) => {
  const { updateReservation, isUpdating } = useAdminReservations();
  const [cancellationReason, setCancellationReason] = useState("");

  const handleStatusChange = async (newStatus: string) => {
    await updateReservation({
      id: reservation.id,
      status: newStatus,
      cancellation_reason: newStatus === "cancelled" ? cancellationReason : undefined,
    });
  };

  const getStatusBadge = () => {
    switch (reservation.status) {
      case "confirmed":
        return <Badge variant="secondary">Confirmada</Badge>;
      case "pending":
        return <Badge variant="outline">Pendente</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  return (
    <Card key={reservation.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 flex justify-between items-center">
        <CardTitle className="text-lg">{reservation.customer_name}</CardTitle>
        {getStatusBadge()}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{format(new Date(reservation.reservation_date), "dd/MM/yyyy")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{reservation.reservation_time}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{reservation.number_of_people} pessoas</span>
          </div>
          <div>
            <span>{getTourDisplayName(reservation.tour_type)}</span>
          </div>
        </div>

        {reservation.total_price && (
          <p className="text-sm">
            <strong>Preço total:</strong> €{reservation.total_price}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          {reservation.status !== "confirmed" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange("confirmed")}
              disabled={isUpdating}
            >
              Confirmar
            </Button>
          )}
          {reservation.status !== "cancelled" && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleStatusChange("cancelled")}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
          )}
          {reservation.status !== "pending" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange("pending")}
              disabled={isUpdating}
            >
              Pendente
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
