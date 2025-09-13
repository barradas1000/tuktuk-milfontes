// components/admin/AdminCalendar/index.tsx
import React from "react";
import { Tabs } from "@/components/ui/tabs";
import { useAdminCalendar } from "./useAdminCalendarState";
import CalendarSidebar from "./CalendarSidebar";
import AdminCalendarTabs from "./AdminCalendarTabs";
import AdminModals from "./AdminModals";

export default function AdminCalendar() {
  const [selectedDate, setSelectedDate] = React.useState<string>(new Date().toISOString());
  const [activeTab, setActiveTab] = React.useState<"reservations" | "availability">("reservations");

  const { calendarDate } = useAdminCalendar({
    selectedDate: selectedDate,
    onDateSelect: setSelectedDate
  });

  return (
    <div className="p-4 flex gap-4">
      {/* Sidebar */}
      <div className="w-1/4">
        <CalendarSidebar
          selectedDate={calendarDate}
          onDateSelect={setSelectedDate}
        />
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1">
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "reservations" | "availability")
          }
        >
          <AdminCalendarTabs activeTab={activeTab} selectedDate={calendarDate} />
        </Tabs>
      </div>

      {/* Modais */}
      <AdminModals selectedDate={calendarDate} />
    </div>
  );
}
