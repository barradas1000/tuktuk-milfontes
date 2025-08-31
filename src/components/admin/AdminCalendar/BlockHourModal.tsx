// /components/AdminCalendar/BlockHourModal.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface BlockHourModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  blockDate: Date | null;
  setBlockDate: (date: Date) => void;
  blockHourStart: string;
  setBlockHourStart: (start: string) => void;
  blockHourEnd: string;
  setBlockHourEnd: (end: string) => void;
  blockTimeReason: Record<string, string>;
  setBlockTimeReason: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  timeSlots: string[];
  blockTime: (date: Date, time: string, reason: string) => void;
  blockTimeRange: (date: Date, start: string, end: string, reason: string) => void;
  getAllDayBlocks: (date: Date) => any[]; // Adjust type as per your BlockedPeriod type
  unblockTime: (date: Date, time: string) => void;
}

const BlockHourModal = ({
  isOpen,
  onOpenChange,
  blockDate,
  setBlockDate,
  blockHourStart,
  setBlockHourStart,
  blockHourEnd,
  setBlockHourEnd,
  blockTimeReason,
  setBlockTimeReason,
  timeSlots,
  blockTime,
  blockTimeRange,
  getAllDayBlocks,
  unblockTime,
}: BlockHourModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Bloquear/Desbloquear Horas</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-120px)] pr-2">
          <div className="space-y-2">
            <label
              className="font-semibold text-sm"
              htmlFor="block-hour-date"
            >
              Data:
            </label>
            <input
              id="block-hour-date"
              name="block-hour-date"
              type="date"
              value={blockDate ? format(blockDate, "yyyy-MM-dd") : ""}
              onChange={(e) => setBlockDate(new Date(e.target.value))}
              className="border rounded p-2 w-full"
            />
          </div>

          <div className="space-y-2 border-t pt-4">
            <h4 className="font-semibold text-sm">
              Bloquear horário individual:
            </h4>
            <div className="flex items-center gap-2">
              <select
                value={blockHourStart}
                onChange={(e) => setBlockHourStart(e.target.value)}
                className="border rounded p-2 flex-1"
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                variant="default"
                onClick={() =>
                  blockDate &&
                  blockTime(
                    blockDate,
                    blockHourStart,
                    blockTimeReason[blockHourStart] || ""
                  )
                }
                disabled={!blockDate}
              >
                Bloquear
              </Button>
            </div>
            <input
              id="block-hour-reason"
              name="block-hour-reason"
              type="text"
              placeholder="Motivo (opcional)"
              className="border rounded p-2 text-sm w-full"
              value={blockTimeReason[blockHourStart] || ""}
              onChange={(e) =>
                setBlockTimeReason((prev) => ({
                  ...prev,
                  [blockHourStart]: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2 border-t pt-4">
            <h4 className="font-semibold text-sm">
              Bloquear intervalo de horários:
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-sm">De:</span>
              <select
                value={blockHourStart}
                onChange={(e) => setBlockHourStart(e.target.value)}
                className="border rounded p-2 flex-1"
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              <span className="text-sm">Até:</span>
              <select
                value={blockHourEnd}
                onChange={(e) => setBlockHourEnd(e.target.value)}
                className="border rounded p-2 flex-1"
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                variant="default"
                onClick={() =>
                  blockDate &&
                  blockTimeRange(
                    blockDate,
                    blockHourStart,
                    blockHourEnd,
                    blockTimeReason[
                      `${blockHourStart}-${blockHourEnd}`
                    ] || ""
                  )
                }
                disabled={!blockDate}
              >
                Bloquear
              </Button>
            </div>
            <input
              id="block-hour-range-reason"
              name="block-hour-range-reason"
              type="text"
              placeholder="Motivo (opcional)"
              className="border rounded p-2 text-sm w-full"
              value={
                blockTimeReason[`${blockHourStart}-${blockHourEnd}`] || ""
              }
              onChange={(e) =>
                setBlockTimeReason((prev) => ({
                  ...prev,
                  [`${blockHourStart}-${blockHourEnd}`]: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-sm">
                Horários bloqueados:
              </h4>
              {blockDate &&
                getAllDayBlocks(blockDate).filter((b) => b.startTime)
                  .length > 3 && (
                  <span className="text-xs text-gray-500">
                    (Role para ver mais)
                  </span>
                )}
            </div>
            {blockDate &&
            getAllDayBlocks(blockDate).filter((b) => b.startTime)
              .length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-4">
                Nenhum horário bloqueado neste dia.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-2 bg-gray-25">
                {blockDate &&
                  [
                    ...new Map(
                      getAllDayBlocks(blockDate)
                        .filter((b) => b.startTime)
                        .map((block) => [
                          block.date + "-" + block.startTime,
                          block,
                        ])
                    ).values(),
                  ].map((block) => (
                    <div
                      key={block.id}
                      className="flex items-center justify-between p-2 bg-white rounded border shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <span className="font-medium text-sm">
                          {block.startTime}
                        </span>
                        {block.reason && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({block.reason})
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          blockDate &&
                          unblockTime(blockDate, block.startTime!)
                        }
                      >
                        Desbloquear
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlockHourModal;