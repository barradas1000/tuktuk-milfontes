import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon, Lock } from "lucide-react";
import { DayPicker, DayProps } from "react-day-picker";
import { pt } from "date-fns/locale";
import { format } from "date-fns";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface MainCalendarCardProps {
  calendarDate: Date;
  handleDayClick: (date: Date | undefined) => void;
  modifiers: Record<string, (date: Date) => boolean>;
  modifiersClassNames: Record<string, string>;
  getDayStatus: (date: Date) => string;
  isDayBlocked: (date: Date) => boolean;
  getDayBlockReason: (date: Date) => string;
  getDayLabel: (status: string) => string;
  isValidDate: (date: unknown) => date is Date;
}



const MainCalendarCard: React.FC<MainCalendarCardProps> = ({
  calendarDate,
  handleDayClick,
  modifiers,
  modifiersClassNames,
  getDayStatus,
  isDayBlocked,
  getDayBlockReason,
  getDayLabel,
  isValidDate,
}) => {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Disponibilidade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <>
          {/* Removido bloco dos botões de bloqueio/desbloqueio */}
          <div className="rounded-2xl shadow-xl bg-white p-2">
            <DayPicker
              mode="single"
              selected={calendarDate}
              defaultMonth={calendarDate}
              onSelect={handleDayClick}
              className="rounded-2xl border-0"
              locale={pt}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              components={{
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                Day: ({ date, displayMonth, ...props }: any) => {
                  // Verificar se date existe
                  if (!date) {
                    return <td className="text-gray-300"> </td>; // célula vazia
                  }

                  const currentDate = new Date(date);
                  if (isNaN(currentDate.getTime())) {
                    console.warn("Data inválida no componente Day:", date);
                    return <td className="text-red-500">X</td>;
                  }

                  const status = getDayStatus(date);
                  const isSelected = isValidDate(date) && isValidDate(calendarDate)
                    ? format(date, "yyyy-MM-dd") === format(calendarDate, "yyyy-MM-dd")
                    : false;
                  const isToday = isValidDate(date)
                    ? format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                    : false;
                  const blocked = isValidDate(date) ? isDayBlocked(date) : true;
                  const textColor = blocked ? "text-gray-400" : "text-black";

                  return (
                    <td className="rdp-cell">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className={
                              `h-10 w-10 flex items-center justify-center rounded-full transition-all duration-150 ` +
                              (isSelected
                                ? "ring-2 ring-blue-500 bg-blue-100 font-bold "
                                : "") +
                              (isToday
                                ? "ring-2 ring-purple-600 ring-offset-2 "
                                : "") +
                              (blocked
                                ? "bg-gray-300 cursor-pointer hover:bg-gray-400 "
                                : modifiersClassNames[
                                    status as keyof typeof modifiersClassNames
                                  ] + " ") +
                              textColor +
                              " hover:scale-110 hover:shadow-lg focus:outline-none"
                            }
                            onClick={() => isValidDate(date) && handleDayClick(date)}
                          >
                            {blocked ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              date.getDate()
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {blocked
                            ? `${getDayBlockReason(
                                date
                              )} - Clique para desbloquear`
                            : `${getDayLabel(status)} - Clique para bloquear`}
                        </TooltipContent>
                      </Tooltip>
                    </td>
                  );
                },
              }}
            />
          </div>
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold text-sm">Legenda:</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-300 rounded"></div>
                <span>Sem reservas</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span>Poucas reservas</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-300 rounded"></div>
                <span>Várias reservas</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-400 rounded"></div>
                <span>Cheio</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-300 rounded"></div>
                <span>Serviço não ativo</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-300 rounded flex items-center justify-center">
                  <Lock className="w-2 h-2" />
                </div>
                <span>Dia bloqueado (clique para desbloquear)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-white border border-gray-300 rounded flex items-center justify-center">
                  <span className="text-xs">+</span>
                </div>
                <span>Dia disponível (clique para bloquear)</span>
              </div>
            </div>
          </div>
        </>
      </CardContent>
    </Card>
  );
};

export default MainCalendarCard;
