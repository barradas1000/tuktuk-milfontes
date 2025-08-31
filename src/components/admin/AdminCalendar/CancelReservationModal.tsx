// /components/AdminCalendar/CancelReservationModal.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { XCircle } from "lucide-react";
import { AdminReservation } from "@/types/adminReservations";
import ReservationDetails from './ReservationDetails';

interface CancelReservationModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  reservation: AdminReservation | null;
  cancelReason: string;
  setCancelReason: (reason: string) => void;
  onConfirm: (reservation: AdminReservation, reason: string) => void;
  isCancelling: boolean;
  getTourDisplayName: (tourType: string) => string;
}

const CancelReservationModal = ({
  isOpen,
  onOpenChange,
  reservation,
  cancelReason,
  setCancelReason,
  onConfirm,
  isCancelling,
  getTourDisplayName,
}: CancelReservationModalProps) => {
  if (!reservation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Anular Reserva
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-120px)] pr-2">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">
              Confirmar anulação da reserva:
            </h4>
            <ReservationDetails reservation={reservation} getTourDisplayName={getTourDisplayName} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Motivo da anulação (opcional):</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Ex: Cliente solicitou cancelamento..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800"><strong>Atenção:</strong> Esta ação irá alterar o status para "Cancelada" e liberar o horário.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="destructive" onClick={() => onConfirm(reservation, cancelReason)} disabled={isCancelling}>
            {isCancelling ? "Anulando..." : "Confirmar Anulação"}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCancelling}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelReservationModal;