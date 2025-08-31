// /components/AdminCalendar/index.tsx
import React from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useAdminCalendar } from "@/hooks/useAdminCalendar";
import { getTourDisplayName, timeSlots, getClientLanguage } from "@/utils/calendarUtils";
import ActiveConductorsPanel from "./ActiveConductorsPanel";
import TuktukAvailabilityPanel from "./TuktukAvailabilityPanel";
import HourlyAvailabilityCard from "./HourlyAvailabilityCard";
import MainCalendarCard from "./MainCalendarCard";
import BlockedPeriodsPanel from "./BlockedPeriodsPanel";
import BlockDayModal from "./BlockDayModal";
import BlockHourModal from "./BlockHourModal";
import CancelReservationModal from "./CancelReservationModal";
import DailyReservationsCard from "./DailyReservationsCard";
import QuickViewModal from "./QuickViewModal";
import WhatsappMessageModal from "@/components/WhatsappMessageModal";
import { AdminReservation } from "@/types/adminReservations";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface AdminCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  renderAfterActiveBlock?: (params: {
    activeConductors: string[];
    activeConductorsWithNames: { id: string; name: string }[];
  }) => React.ReactNode;
}

const AdminCalendar = ({
  selectedDate,
  onDateSelect,
  renderAfterActiveBlock,
}: AdminCalendarProps) => {
  const {
    showCard,
    setShowCard,
    getReservationsByDate,
    getAvailabilityForDate,
    updateReservation,
    refetch,
    toast,
    t,
    conductors,
    conductorsLoading,
    conductorsError,
    updateConductorStatus,
    calendarDate,
    setCalendarDate,
    quickViewOpen,
    setQuickViewOpen,
    quickViewDate,
    setQuickViewDate,
    blockedPeriods,
    setBlockedPeriods,
    blockedPeriodsLoading,
    setBlockedPeriodsLoading,
    isLoadingBlockedPeriods,
    setIsLoadingBlockedPeriods,
    blockModalOpen,
    setBlockModalOpen,
    blockDate,
    setBlockDate,
    blockTab,
    setBlockTab,
    blockDayReason,
    setBlockDayReason,
    blockDaysStart,
    setBlockDaysStart,
    blockDaysEnd,
    setBlockDaysEnd,
    blockHourStart,
    setBlockHourStart,
    blockHourEnd,
    setBlockHourEnd,
    blockTimeReason,
    setBlockTimeReason,
    inactiveDays,
    blockDayModalOpen,
    setBlockDayModalOpen,
    blockHourModalOpen,
    setBlockHourModalOpen,
    makeAvailableModalOpen,
    setMakeAvailableModalOpen,
    slotToMakeAvailable,
    setSlotToMakeAvailable,
    quickBlockInfo,
    setQuickBlockInfo,
    showCancelReservation,
    setShowCancelReservation,
    cancelledReservation,
    setCancelledReservation,
    cancelReservationModalOpen,
    setCancelReservationModalOpen,
    reservationToCancel,
    setReservationToCancel,
    cancelReason,
    setCancelReason,
    isCancelling,
    setIsCancelling,
    whatsappMessageModalOpen,
    setWhatsappMessageModalOpen,
    editableMessage,
    setEditableMessage,
    messageType,
    setMessageType,
    reservationForMessage,
    setReservationForMessage,
    selectedConductorId,
    setSelectedConductorId,
    tuktukStatus,
    setTuktukStatus,
    activeConductorIds,
    occupiedMinutes,
    setOccupiedMinutes,
    occupiedUntil,
    setOccupiedUntil,
    blockFilterDate,
    setBlockFilterDate,
    blockFilterType,
    setBlockFilterType,
    isCleaningDuplicates,
    setIsCleaningDuplicates,
    sliderDays,
    setSliderDays,
    selectedSliderDate,
    setSelectedSliderDate,
    cancelReservation,
    openWhatsappMessageEditor,
    sendWhatsappMessage,
    getDayStatus,
    isDayBlocked,
    getDayBlockReason,
    isTimeBlocked,
    isBlockedByReservation,
    isBlockedByAdmin,
    getTimeBlockReason,
    getAllDayBlocks,
    getFilteredBlocks,
    blockDay,
    unblockDay,
    blockTime,
    unblockTime,
    makeTimeAvailable,
    handleBlockDaysRange,
    blockTimeRange,
    handleDateSelect,
    handleDayClick,
    openBlockModalForDate,
    getDayLabel,
    getStatusBadgeConfig,
    getCurrentWhatsapp,
    getWhatsappLink,
    confirmOccupiedTime,
    selectedDateReservations,
    availabilitySlots,
    modifiers,
    modifiersClassNames,
    isValidDate,
  } = useAdminCalendar(selectedDate, onDateSelect);

  const getStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    let Icon = null;
    let text = status.charAt(0).toUpperCase() + status.slice(1);

    switch (status) {
      case "confirmed":
        variant = "secondary";
        Icon = CheckCircle;
        text = "Confirmada";
        break;
      case "cancelled":
        variant = "destructive";
        Icon = XCircle;
        text = "Cancelada";
        break;
      case "pending":
        variant = "outline";
        Icon = AlertCircle;
        text = "Pendente";
        break;
      // Add more cases if needed
    }

    return (
      <Badge variant={variant}>
        {Icon && <Icon className="h-3 w-3 mr-1" />}
        {text}
      </Badge>
    );
  };

  const handleConfirmBlockDay = () => {
    if (blockDate) {
      blockDay(blockDate, blockDayReason);
      setBlockDayModalOpen(false);
      setBlockDayReason("");
      toast({
        title: "Dia bloqueado",
        description: `O dia ${format(blockDate, "dd/MM")} foi bloqueado com sucesso.`,
        variant: "success",
      });
    }
  };

  return (
    <>
      <ActiveConductorsPanel
        conductors={conductors}
        loading={conductorsLoading}
        error={conductorsError}
        updateConductorStatus={updateConductorStatus}
        getCurrentWhatsapp={getCurrentWhatsapp}
        renderAfterActiveBlock={renderAfterActiveBlock}
      />

      <TuktukAvailabilityPanel
        tuktukStatus={tuktukStatus}
        setTuktukStatus={setTuktukStatus}
        occupiedUntil={occupiedUntil}
        setOccupiedUntil={setOccupiedUntil}
        occupiedMinutes={occupiedMinutes}
        setOccupiedMinutes={setOccupiedMinutes}
        activeConductorIds={activeConductorIds}
        updateTuktukStatus={confirmOccupiedTime}
      />

      <HourlyAvailabilityCard
        calendarDate={calendarDate}
        availabilitySlots={availabilitySlots}
        unblockTime={unblockTime}
        blockTime={blockTime}
      />

      <MainCalendarCard
        calendarDate={calendarDate}
        handleDayClick={handleDayClick}
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        getDayStatus={getDayStatus}
        isDayBlocked={isDayBlocked}
        getDayBlockReason={getDayBlockReason}
        getDayLabel={getDayLabel}
        isValidDate={isValidDate}
      />

      <BlockedPeriodsPanel
        getFilteredBlocks={getFilteredBlocks}
        blockFilterType={blockFilterType}
        setBlockFilterType={setBlockFilterType}
        blockFilterDate={blockFilterDate}
        setBlockFilterDate={setBlockFilterDate}
        unblockDay={unblockDay}
        unblockTime={unblockTime}
        blockedPeriods={blockedPeriods}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QuickViewModal
          isOpen={quickViewOpen}
          onOpenChange={setQuickViewOpen}
          quickViewDate={quickViewDate}
          getReservationsByDate={getReservationsByDate}
          getStatusBadge={getStatusBadge}
          getTourDisplayName={getTourDisplayName}
        />

        <BlockDayModal
          isOpen={blockDayModalOpen}
          onOpenChange={setBlockDayModalOpen}
          blockDate={blockDate}
          blockDayReason={blockDayReason}
          setBlockDayReason={setBlockDayReason}
          onConfirm={handleConfirmBlockDay}
        />

        <BlockHourModal
          isOpen={blockHourModalOpen}
          onOpenChange={setBlockHourModalOpen}
          blockDate={blockDate}
          setBlockDate={setBlockDate}
          blockHourStart={blockHourStart}
          setBlockHourStart={setBlockHourStart}
          blockHourEnd={blockHourEnd}
          setBlockHourEnd={setBlockHourEnd}
          blockTimeReason={blockTimeReason}
          setBlockTimeReason={setBlockTimeReason}
          timeSlots={timeSlots}
          blockTime={blockTime}
          blockTimeRange={blockTimeRange}
          getAllDayBlocks={getAllDayBlocks}
          unblockTime={unblockTime}
        />

        <CancelReservationModal
          isOpen={cancelReservationModalOpen}
          onOpenChange={setCancelReservationModalOpen}
          reservation={reservationToCancel}
          cancelReason={cancelReason}
          setCancelReason={setCancelReason}
          onConfirm={cancelReservation}
          isCancelling={isCancelling}
          getTourDisplayName={getTourDisplayName}
        />

        <WhatsappMessageModal
          isOpen={whatsappMessageModalOpen}
          onOpenChange={setWhatsappMessageModalOpen}
          reservation={reservationForMessage}
          editableMessage={editableMessage}
          setEditableMessage={setEditableMessage}
          onSend={sendWhatsappMessage}
          getClientLanguage={getClientLanguage}
          getTourDisplayName={getTourDisplayName}
        />

        <DailyReservationsCard
          selectedDate={selectedDate}
          reservations={selectedDateReservations}
          getTourDisplayName={getTourDisplayName}
          getStatusBadge={getStatusBadge}
        />
      </div>
    </>
  );
};

export default AdminCalendar;
