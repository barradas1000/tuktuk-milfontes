// components/admin/AdminCalendar/AdminCalendarTabs.tsx
import { TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ReservationsTab from "./ReservationsTab";
import AvailabilityTab from "./AvailabilityTab";
import { getTourDisplayName } from "./helpers";

export default function AdminCalendarTabs({ activeTab, selectedDate }) {
  return (
    <>
      <TabsList className="mb-4">
        <TabsTrigger value="reservations">Reservas</TabsTrigger>
        <TabsTrigger value="availability">Disponibilidade</TabsTrigger>
      </TabsList>

      <TabsContent value="reservations">
        <ReservationsTab
          selectedDate={selectedDate}
          getTourDisplayName={getTourDisplayName}
        />
      </TabsContent>

      <TabsContent value="availability">
        <AvailabilityTab selectedDate={selectedDate} />
      </TabsContent>
    </>
  );
}
