// /components/AdminCalendar/WhatsappMessageModal.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone } from "lucide-react";
import { AdminReservation } from "@/types/adminReservations";
import ReservationDetails from './ReservationDetails';

interface WhatsappMessageModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  reservation: AdminReservation | null;
  editableMessage: string;
  setEditableMessage: (message: string) => void;
  onSend: () => void;
  getClientLanguage: (reservation: AdminReservation) => string;
  getTourDisplayName: (tourType: string) => string;
}

const WhatsappMessageModal = ({
  isOpen,
  onOpenChange,
  reservation,
  editableMessage,
  setEditableMessage,
  onSend,
  getClientLanguage,
  getTourDisplayName,
}: WhatsappMessageModalProps) => {
  if (!reservation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-500" />
            Editar Mensagem do WhatsApp
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-120px)] pr-2">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">
              Detalhes da Reserva:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p>
                <strong>Cliente:</strong>{" "}
                {reservation.customer_name}
              </p>
              <p>
                <strong>Telefone:</strong>{" "}
                {reservation.customer_phone}
              </p>
              <p>
                <strong>Idioma:</strong>{" "}
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getClientLanguage(
                    reservation
                  ).toUpperCase()}
                </span>
              </p>
              <p>
                <strong>Tour:</strong>{" "}
                {getTourDisplayName(reservation.tour_type)}
              </p>
              <p>
                <strong>Data:</strong>{" "}
                {reservation.reservation_date}
              </p>
              <p>
                <strong>Hora:</strong>{" "}
                {reservation.reservation_time}
              </p>
              <p>
                <strong>Pessoas:</strong>{" "}
                {reservation.number_of_people}
              </p>
              <p>
                <strong>Valor:</strong> €
                {reservation.total_price}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp-message">
              Mensagem para o cliente:
            </Label>
            <Textarea
              id="whatsapp-message"
              value={editableMessage}
              onChange={(e) => setEditableMessage(e.target.value)}
              rows={8}
              className="font-mono text-sm"
              placeholder="Digite a mensagem que será enviada via WhatsApp..."
            />
            <div className="text-xs text-gray-500">
              Caracteres: {editableMessage.length} | Linhas:{" "}
              {editableMessage.split("\n").length}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <strong>Dica:</strong> A mensagem será enviada para o
              WhatsApp do cliente (
              {reservation.customer_phone}) no idioma{" "}
              {getClientLanguage(reservation).toUpperCase()}.
            </p>
            <ul className="text-sm text-green-700 mt-1 list-disc list-inside">
              <li>Pode personalizar a mensagem conforme necessário</li>
              <li>
                Use emojis para tornar a comunicação mais amigável
              </li>
              <li>
                Inclua informações importantes como local de encontro
              </li>
              <li>
                A mensagem inicial foi gerada automaticamente no idioma
                do cliente
              </li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={onSend}
            disabled={!editableMessage.trim()}
            className="bg-green-500 hover:bg-green-600"
          >
            <Phone className="w-4 h-4 mr-2" />
            Abrir WhatsApp do Cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsappMessageModal;