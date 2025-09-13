// /components/admin/AdminCalendar/WhatsappMessageModal.tsx
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AdminReservation } from "@/types/adminReservations";
import { getTourDisplayName, getClientLanguage } from "./helpers";

interface WhatsappMessageModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: AdminReservation | null;
  editableMessage: string;
  setEditableMessage: (msg: string) => void;
  onSend: () => void;
}

const WhatsappMessageModal = ({
  isOpen,
  onOpenChange,
  reservation,
  editableMessage,
  setEditableMessage,
  onSend,
}: WhatsappMessageModalProps) => {
  if (!reservation) return null;

  const language = getClientLanguage(reservation);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mensagem WhatsApp</DialogTitle>
        </DialogHeader>
        <p>
          Enviar mensagem para{" "}
          <strong>{reservation.customer_name}</strong> ({language}) sobre{" "}
          <em>{getTourDisplayName(reservation.tour_type)}</em>.
        </p>
        <Textarea
          value={editableMessage}
          onChange={(e) => setEditableMessage(e.target.value)}
        />
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSend}>Enviar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsappMessageModal;
