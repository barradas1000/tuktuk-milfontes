import { useState } from "react";
import { useAdminReservations } from "@/hooks/useAdminReservations";
import { AdminReservation } from "@/types/adminReservations";
// Update the path below to the correct relative path if needed
import { useToast } from "../use-toast";
import type { UpdateReservationInput } from "@/hooks/useAdminReservations";

/**
 * Hook para gerir reservas administrativas
 */
export const useReservationsManagement = () => {
  const {
    getReservationsByDate,
    getAvailabilityForDate,
    updateReservation,
    refetch,
  } = useAdminReservations();

  const { toast } = useToast();
  const [isCancelling, setIsCancelling] = useState(false);

  /**
   * Cancelar uma reserva
   */
  const cancelReservation = async (
    reservation: AdminReservation,
    reason = ""
  ) => {
    setIsCancelling(true);
    try {
      await updateReservation({
        id: reservation.id,
        status: "cancelled",
        cancellation_reason: reason,
      } as UpdateReservationInput); // Garantir tipo correto

      refetch();

      toast({
        title: "Reserva cancelada",
        description: `Reserva de ${reservation.customer_name} foi cancelada.`,
      });
    } catch (err) {
      console.error("Erro ao cancelar reserva:", err);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar a reserva",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return {
    getReservationsByDate,
    getAvailabilityForDate,
    updateReservation,
    refetch,
    cancelReservation,
    isCancelling,
  };
};
