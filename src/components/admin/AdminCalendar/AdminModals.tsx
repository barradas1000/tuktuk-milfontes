// components/admin/AdminCalendar/AdminModals.tsx
import BlockDayModal from "./BlockDayModal";
import BlockHourModal from "./BlockHourModal";
import CancelReservationModal from "./CancelReservationModal";
import WhatsappMessageModal from "./WhatsappMessageModal";

type Props = {
  selectedDate: Date | null;
};

export default function AdminModals({ selectedDate }: Props) {
  return (
    <>
      <BlockDayModal selectedDate={selectedDate} />
      <BlockHourModal selectedDate={selectedDate} />
      <CancelReservationModal />
      <WhatsappMessageModal />
    </>
  );
}
