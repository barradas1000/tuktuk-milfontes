// /components/AdminCalendar/BlockDayModal.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Lock } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface BlockDayModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  blockDate: Date | null;
  blockDayReason: string;
  setBlockDayReason: (reason: string) => void;
  onConfirm: () => void;
}

const BlockDayModal = ({
  isOpen,
  onOpenChange,
  blockDate,
  blockDayReason,
  setBlockDayReason,
  onConfirm,
}: BlockDayModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Bloquear Dia
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {blockDate && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Dia selecionado:</strong>{" "}
                {format(blockDate, "dd/MM/yyyy", { locale: pt })}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {format(blockDate, "EEEE", { locale: pt })}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="block-day-reason">
              Motivo do bloqueio (opcional):
            </Label>
            <Textarea
              id="block-day-reason"
              placeholder="Ex: Manutenção, feriado, condições meteorológicas, etc."
              value={blockDayReason}
              onChange={(e) => setBlockDayReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Atenção:</strong> Ao bloquear este dia:
            </p>
            <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
              <li>Não será possível fazer novas reservas</li>
              <li>Reservas existentes continuarão válidas</li>
              <li>
                O dia ficará marcado como indisponível no calendário
              </li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button onClick={onConfirm}>
              Confirmar Bloqueio
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlockDayModal;