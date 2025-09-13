// components/admin/AdminCalendar/index.tsx
import React from "react";
import { Tabs } from "@/components/ui/tabs";
import { useAdminCalendarState } from "./useAdminCalendarState";
import CalendarSidebar from "./CalendarSidebar";
import AdminCalendarTabs from "./AdminCalendarTabs";
import AdminModals from "./AdminModals";

export default function AdminCalendar() {
  const { calendarDate, setCalendarDate } = useAdminCalendarState();
  const [activeTab, setActiveTab] = React.useState<"reservations" | "availability">("reservations");

  return (
    <div className="p-4 flex gap-4">
      {/* Sidebar */}
      <div className="w-1/4">
        <CalendarSidebar
          selectedDate={calendarDate}
          onDateSelect={setCalendarDate}
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
