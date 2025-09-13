// /components/AdminCalendar/HourlyAvailabilityCard.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { AvailabilitySlot } from "@/utils/reservationUtils";

interface HourlyAvailabilityCardProps {
  calendarDate: Date;
  availabilitySlots: AvailabilitySlot[];
  unblockTime: (date: Date, time: string) => void;
  blockTime: (date: Date, time: string, reason: string) => void;
}

const HourlyAvailabilityCard = ({
  calendarDate,
  availabilitySlots,
  unblockTime,
  blockTime,
}: HourlyAvailabilityCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Disponibilidade Horária - {format(calendarDate, "dd/MM/yyyy", { locale: pt })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {availabilitySlots.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum slot de disponibilidade para este dia</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {availabilitySlots.map((slot) => {
                const isAvailable = slot.status === 'available';
                return (
                  <div
                    key={slot.time}
                    className={`p-3 border rounded-lg text-center ${
                      isAvailable
                        ? "bg-green-100 border-green-300 text-green-800"
                        : "bg-red-100 border-red-300 text-red-800"
                    }`}
                  >
                    <div className="font-semibold">{slot.time}</div>
                    <div className="text-sm">
                      {isAvailable ? "Disponível" : "Indisponível"}
                    </div>
                    {!isAvailable && (
                      <div className="text-xs mt-1">
                        {slot.reserved}/{slot.capacity} lugares
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HourlyAvailabilityCard;
