
import React, { useState } from 'react';
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
  Eye
} from 'lucide-react';
import { useAdminReservations } from '@/hooks/useAdminReservations';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface AdminCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

const AdminCalendar = ({ selectedDate, onDateSelect }: AdminCalendarProps) => {
  const { getReservationsByDate, getAvailabilityForDate } = useAdminReservations();
  const [calendarDate, setCalendarDate] = useState<Date>(new Date(selectedDate));

  const selectedDateReservations = getReservationsByDate(selectedDate);
  const availabilitySlots = getAvailabilityForDate(selectedDate);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateString = format(date, 'yyyy-MM-dd');
      setCalendarDate(date);
      onDateSelect(dateString);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, text: 'Pendente' },
      confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Confirmada' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Cancelada' },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Concluída' }
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
      {/* Calendar */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={calendarDate}
            onSelect={handleDateSelect}
            className="rounded-md border"
            locale={pt}
          />
          
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold text-sm">Legenda:</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Disponível</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Parcial</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Ocupado</span>
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
            {format(new Date(selectedDate), 'dd MMMM yyyy', { locale: pt })}
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
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="font-semibold">{slot.time}</div>
                  <div className="text-sm text-gray-600">
                    {slot.reserved}/{slot.capacity} pessoas
                  </div>
                  <div className={`text-xs font-medium mt-1 ${
                    slot.available ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {slot.available ? 'Disponível' : 'Completo'}
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
                        <h4 className="font-semibold">{reservation.customer_name}</h4>
                        <p className="text-sm text-gray-600">{reservation.tour_type}</p>
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
                      <p className="font-semibold">€{reservation.total_price}</p>
                      {reservation.special_requests && (
                        <p className="text-gray-600 italic">"{reservation.special_requests}"</p>
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
