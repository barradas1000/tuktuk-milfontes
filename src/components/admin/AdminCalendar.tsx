import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar as CalendarIcon,
  Eye,
} from "lucide-react";
import { useAdminReservations } from "@/hooks/useAdminReservations";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface AdminCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

const AdminCalendar = ({ selectedDate, onDateSelect }: AdminCalendarProps) => {
  const { getReservationsByDate, getAvailabilityForDate } =
    useAdminReservations();
  const [calendarDate, setCalendarDate] = useState<Date>(
    new Date(selectedDate)
  );
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quickViewDate, setQuickViewDate] = useState<Date | null>(null);

  // Mock: dias de serviço não ativo (férias, etc.)
  const [inactiveDays] = useState<string[]>([
    // Formato: 'YYYY-MM-DD'
    "2025-07-10",
    "2025-07-11",
    "2025-07-12",
  ]);

  // Função para obter o estado do dia
  const getDayStatus = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    if (inactiveDays.includes(dateString)) return "inactive";
    const reservas = getReservationsByDate(dateString);
    if (reservas.length === 0) return "empty";
    // Lógica simples: 1-2 reservas = verde, 3-4 = amarelo, >4 = vermelho
    if (reservas.length <= 2) return "low";
    if (reservas.length <= 4) return "medium";
    return "full";
  };

  // Função para obter o label amigável do estado do dia
  const getDayLabel = (status: string) => {
    switch (status) {
      case "inactive":
        return "Serviço não ativo";
      case "empty":
        return "Sem reservas";
      case "low":
        return "Poucas reservas";
      case "medium":
        return "Várias reservas";
      case "full":
        return "Cheio";
      default:
        return "";
    }
  };

  // Modifiers para react-day-picker
  const modifiers = {
    inactive: (date: Date) => getDayStatus(date) === "inactive",
    empty: (date: Date) => getDayStatus(date) === "empty",
    low: (date: Date) => getDayStatus(date) === "low",
    medium: (date: Date) => getDayStatus(date) === "medium",
    full: (date: Date) => getDayStatus(date) === "full",
  };
  const modifiersClassNames = {
    inactive: "bg-blue-200 text-blue-900",
    empty: "bg-gray-100 text-gray-400",
    low: "bg-green-200 text-green-900",
    medium: "bg-yellow-200 text-yellow-900",
    full: "bg-red-300 text-red-900",
  };

  const selectedDateReservations = getReservationsByDate(selectedDate);
  const availabilitySlots = getAvailabilityForDate(selectedDate);

  const handleDayClick = (date: Date | undefined) => {
    if (date) {
      setQuickViewDate(date);
      setQuickViewOpen(true);
      handleDateSelect(date);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateString = format(date, "yyyy-MM-dd");
      setCalendarDate(date);
      onDateSelect(dateString);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: AlertCircle,
        text: "Pendente",
      },
      confirmed: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        text: "Confirmada",
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        text: "Cancelada",
      },
      completed: {
        color: "bg-blue-100 text-blue-800",
        icon: CheckCircle,
        text: "Concluída",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Quick View Dialog */}
      <Dialog open={quickViewOpen} onOpenChange={setQuickViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Reservas em{" "}
              {quickViewDate
                ? format(quickViewDate, "dd/MM/yyyy", { locale: pt })
                : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {quickViewDate &&
              getReservationsByDate(format(quickViewDate, "yyyy-MM-dd"))
                .length === 0 && (
                <div className="text-center text-gray-500">
                  Nenhuma reserva para este dia.
                </div>
              )}
            {quickViewDate &&
              getReservationsByDate(format(quickViewDate, "yyyy-MM-dd")).map(
                (reserva) => (
                  <div
                    key={reserva.id}
                    className="p-3 rounded-lg border bg-white shadow flex flex-col gap-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">
                        {reserva.customer_name}
                      </span>
                      <span
                        className="text-xs px-2 py-1 rounded-full font-medium "
                        style={{
                          background:
                            reserva.status === "confirmed"
                              ? "#bbf7d0"
                              : reserva.status === "pending"
                              ? "#fef08a"
                              : reserva.status === "cancelled"
                              ? "#fecaca"
                              : "#c7d2fe",
                          color: "#222",
                        }}
                      >
                        {reserva.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm mt-1">
                      <span>
                        <b>Pagamento:</b>{" "}
                        {reserva.total_price ? `€${reserva.total_price}` : "-"}
                      </span>
                      <span>
                        <b>Percurso:</b> {reserva.tour_type}
                      </span>
                      <span>
                        <b>Hora:</b> {reserva.reservation_time}
                      </span>
                      <span>
                        <b>Pessoas:</b> {reserva.number_of_people}
                      </span>
                    </div>
                    {reserva.special_requests && (
                      <div className="text-xs text-gray-500 italic mt-1">
                        "{reserva.special_requests}"
                      </div>
                    )}
                  </div>
                )
              )}
          </div>
          <DialogClose asChild>
            <Button variant="outline" className="mt-4 w-full">
              Fechar
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
      {/* Calendar */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl shadow-xl bg-white p-2">
            <DayPicker
              mode="single"
              selected={calendarDate}
              onSelect={handleDayClick}
              className="rounded-2xl border-0"
              locale={pt}
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              components={{
                Day: (props) => {
                  const status = getDayStatus(props.date);
                  const isSelected =
                    format(props.date, "yyyy-MM-dd") ===
                    format(calendarDate, "yyyy-MM-dd");
                  const isToday =
                    format(props.date, "yyyy-MM-dd") ===
                    format(new Date(), "yyyy-MM-dd");
                  const textColor = "text-black";
                  return (
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
                            (status === "inactive"
                              ? "bg-blue-200 "
                              : status === "empty"
                              ? "bg-gray-100 "
                              : status === "low"
                              ? "bg-green-200 "
                              : status === "medium"
                              ? "bg-yellow-200 "
                              : status === "full"
                              ? "bg-red-300 "
                              : "") +
                            textColor +
                            " hover:scale-110 hover:shadow-lg focus:outline-none"
                          }
                          onClick={() => handleDayClick(props.date)}
                        >
                          {props.date.getDate()}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{getDayLabel(status)}</TooltipContent>
                    </Tooltip>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Details */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {format(new Date(selectedDate), "dd MMMM yyyy", { locale: pt })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Time Slots Availability */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Disponibilidade por Horário</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availabilitySlots.map((slot) => (
                <div
                  key={slot.time}
                  className={`p-3 rounded-lg border text-center ${
                    slot.available
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="font-semibold">{slot.time}</div>
                  <div className="text-sm text-gray-600">
                    {slot.reserved}/{slot.capacity} pessoas
                  </div>
                  <div
                    className={`text-xs font-medium mt-1 ${
                      slot.available ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {slot.available ? "Disponível" : "Completo"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reservations List */}
          <div>
            <h3 className="font-semibold mb-3">
              Reservas ({selectedDateReservations.length})
            </h3>
            {selectedDateReservations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma reserva para este dia</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="p-4 border rounded-lg bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">
                          {reservation.customer_name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {reservation.tour_type}
                        </p>
                      </div>
                      {getStatusBadge(reservation.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {reservation.reservation_time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        {reservation.number_of_people} pessoas
                      </div>
                    </div>

                    <div className="mt-2 text-sm">
                      <p className="font-semibold">
                        €{reservation.total_price}
                      </p>
                      {reservation.special_requests && (
                        <p className="text-gray-600 italic">
                          "{reservation.special_requests}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCalendar;
