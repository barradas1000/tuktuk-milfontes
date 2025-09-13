// components/admin/AdminCalendar/CalendarSidebar.tsx
import MainCalendarCard from "./MainCalendarCard";
import ActiveConductorsPanel from "./ActiveConductorsPanel";

export default function CalendarSidebar({ selectedDate, onDateSelect }) {
  return (
    <div className="space-y-4">
      <MainCalendarCard selectedDate={selectedDate} onDateSelect={onDateSelect} />
      <ActiveConductorsPanel date={selectedDate} />
    </div>
  );
}
