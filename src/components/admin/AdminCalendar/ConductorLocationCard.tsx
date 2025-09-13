// /components/admin/AdminCalendar/CancelReservationModal.tsx
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AdminReservation } from "@/types/adminReservations";
import { getTourDisplayName } from "./helpers";

interface CancelReservationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: AdminReservation | null;
  cancelReason: string;
  setCancelReason: (reason: string) => void;
  onConfirm: () => void;
  isCancelling: boolean;
}

const CancelReservationModal = ({
  isOpen,
  onOpenChange,
  reservation,
  cancelReason,
  setCancelReason,
  onConfirm,
  isCancelling,
}: CancelReservationModalProps) => {
  if (!reservation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar Reserva</DialogTitle>
        </DialogHeader>
        <p>
          Tens a certeza que queres cancelar a reserva de{" "}
          <strong>{reservation.customer_name}</strong> para{" "}
          <em>{getTourDisplayName(reservation.tour_type)}</em>?
        </p>
        <Textarea
          placeholder="Motivo do cancelamento"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isCancelling}>
            {isCancelling ? "A cancelar..." : "Confirmar Cancelamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelReservationModal;
