import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { ReservationsTab } from "./AdminCalendar/ReservationsTab";
import { useReservationsManagement } from "@/hooks/adminCalendar/useReservationsManagement";
import AvailabilityTab from "./AdminCalendar/AvailabilityTab";

const AdminCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const { getReservationsByDate, getAvailabilityForDate } =
    useReservationsManagement();

  // Função utilitária para mostrar nomes bonitos para os tours
  const getTourDisplayName = (tourType: string) => {
    const map: Record<string, string> = {
      sunset: "Passeio Pôr do Sol",
      city: "Passeio pela Cidade",
      nature: "Passeio Natureza",
    };
    return map[tourType] || tourType;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📅 Gestão de Reservas e Disponibilidade</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="reservations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="reservations">Reservas</TabsTrigger>
            <TabsTrigger value="availability">Disponibilidade</TabsTrigger>
          </TabsList>

          {/* Aba Reservas */}
          <TabsContent value="reservations" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <Calendar
                  mode="single"
                  selected={selectedDate || undefined}
                  onSelect={(date) => setSelectedDate(date ?? null)}
                  locale={pt}
                  className="rounded-md border"
                />
              </div>
              <div className="md:col-span-2">
                <ReservationsTab
                  selectedDate={selectedDate}
                  getTourDisplayName={getTourDisplayName}
                />
              </div>
            </div>
          </TabsContent>

          {/* Aba Disponibilidade */}
          <TabsContent value="availability" className="space-y-4">
            <AvailabilityTab
              selectedDate={selectedDate}
              getAvailabilityForDate={getAvailabilityForDate}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminCalendar;
