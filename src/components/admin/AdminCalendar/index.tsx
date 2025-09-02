// src/components/AdminCalendar/index.tsx

// Importamos o React para usar JSX e Hooks
import React from "react";

// Importamos funções do date-fns para manipulação de datas
import { format } from "date-fns";

// Importamos componentes de UI como Badge e ícones
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

// Importamos o hook principal que gerencia o estado do calendário
import { useAdminCalendar } from "./useAdminCalendarState";

// Importamos utilitários para exibir nomes de tours e idioma do cliente
import { getTourDisplayName, getClientLanguage } from "@/utils/calendarUtils";

// Importamos o tipo dos slots de disponibilidade
import { AvailabilitySlot } from "@/utils/reservationUtils";

// Importamos componentes menores do AdminCalendar
import ActiveConductorsPanel from "./ActiveConductorsPanel";
import TuktukAvailabilityPanel from "./TuktukAvailabilityPanel";
import HourlyAvailabilityCard from "./HourlyAvailabilityCard";
import MainCalendarCard from "./MainCalendarCard";
import BlockedPeriodsPanel from "./BlockedPeriodsPanel";
import DailyReservationsCard from "./DailyReservationsCard";


// Importamos todos os modais do AdminCalendar
import BlockDayModal from "./BlockDayModal";
import BlockHourModal from "./BlockHourModal";
import CancelReservationModal from "./CancelReservationModal";
import QuickViewModal from "./QuickViewModal";
import WhatsappMessageModal from "./WhatsappMessageModal";

// Definição das props que o AdminCalendar recebe
interface AdminCalendarProps {
  selectedDate: string; // Data atualmente selecionada no calendário
  onDateSelect: (date: string) => void; // Função chamada ao selecionar uma data
  renderAfterActiveBlock?: (params: {
    activeConductors: string[]; // IDs dos condutores ativos
    activeConductorsWithNames: { id: string; name: string }[]; // Condutores ativos com nomes
  }) => React.ReactNode; // Renderiza conteúdo extra após o painel de condutores
}

// Componente principal do AdminCalendar
const AdminCalendar: React.FC<AdminCalendarProps> = ({
  selectedDate,
  onDateSelect,
  renderAfterActiveBlock,
}) => {
  // Desestruturamos tudo que o hook useAdminCalendar retorna
  const {
    calendarDate,              // Data atual do calendário
    blockedPeriods,            // Lista de períodos bloqueados
    availabilitySlots,         // Slots de disponibilidade calculados
    selectedDateReservations,  // Reservas da data selecionada
    handleDayClick,            // Função para clique em um dia
    isValidDate,               // Função para validar datas
    unblockTime,               // Função para desbloquear horário
    blockTime,                 // Função para bloquear horário
    blockDayModalOpen,         // Estado modal de bloqueio de dia
    setBlockDayModalOpen,      // Função para abrir/fechar modal de dia
    blockHourModalOpen,        // Estado modal de bloqueio de hora
    setBlockHourModalOpen,     // Função para abrir/fechar modal de hora
    cancelReservationModalOpen,// Estado modal de cancelamento de reserva
    setCancelReservationModalOpen,
    whatsappMessageModalOpen,  // Estado modal de WhatsApp
    setWhatsappMessageModalOpen,
    tuktukStatus,              // Estado do TukTuk
    setTuktukStatus,           // Função para atualizar TukTuk
    occupiedMinutes,           // Minutos ocupados
    setOccupiedMinutes,        // Função para atualizar minutos ocupados
    occupiedUntil,             // Horário até onde está ocupado
    setOccupiedUntil,          // Função para atualizar ocupado até
    activeConductorIds,        // IDs dos condutores ativos
    conductors,                // Lista de condutores
    conductorsLoading,         // Loading dos condutores
    conductorsError            // Erro ao carregar condutores
  } = useAdminCalendar({ selectedDate, onDateSelect });

  // Função para criar badges de status de reservas
  const getStatusBadge = (status: string) => {
    // Definimos a variante padrão
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    let Icon = null; // Ícone que será exibido
    let text = status.charAt(0).toUpperCase() + status.slice(1); // Texto padrão

    // Ajustamos a badge de acordo com o status
    switch (status) {
      case "confirmed":
        variant = "secondary"; Icon = CheckCircle; text = "Confirmada"; break;
      case "cancelled":
        variant = "destructive"; Icon = XCircle; text = "Cancelada"; break;
      case "pending":
        variant = "outline"; Icon = AlertCircle; text = "Pendente"; break;
    }

    // Retornamos o componente Badge
    return (
      <Badge variant={variant}>
        {Icon && <Icon className="h-3 w-3 mr-1" />}
        {text}
      </Badge>
    );
  };

  // Função para confirmar o bloqueio de um dia
  const handleConfirmBlockDay = () => {
    setBlockDayModalOpen(false); // Fecha modal
  };

  // Renderização do componente
  return (
    <>
      {/* Painel de condutores ativos */}
      <ActiveConductorsPanel
        conductors={conductors}
        loading={conductorsLoading}
        error={conductorsError}
        updateConductorStatus={async () => true}
        getCurrentWhatsapp={() => "351968784043"}
        renderAfterActiveBlock={renderAfterActiveBlock}
      />

      {/* Painel de disponibilidade do TukTuk */}
      <TuktukAvailabilityPanel
        tuktukStatus={tuktukStatus}
        setTuktukStatus={setTuktukStatus}
        occupiedUntil={occupiedUntil}
        setOccupiedUntil={setOccupiedUntil}
        occupiedMinutes={occupiedMinutes}
        setOccupiedMinutes={setOccupiedMinutes}
        activeConductorIds={activeConductorIds}
        updateTuktukStatus={async () => {}}
      />

      {/* Card de horários disponíveis */}
      <HourlyAvailabilityCard
        calendarDate={calendarDate}
        availabilitySlots={availabilitySlots}
        unblockTime={unblockTime}
        blockTime={blockTime}
      />

      {/* Calendário principal */}
      <MainCalendarCard
        calendarDate={calendarDate}
        handleDayClick={handleDayClick}
        getDayStatus={() => "available"}
        isDayBlocked={() => false}
        getDayBlockReason={() => ""}
        getDayLabel={() => ""}
        isValidDate={(date): date is Date => {
          try {
            return date instanceof Date && !isNaN(date.getTime());
          } catch {
            return false;
          }
        }}
        modifiers={{}}
        modifiersClassNames={{}}
      />

      {/* Painel de períodos bloqueados */}
      <BlockedPeriodsPanel
        getFilteredBlocks={() => []}
        blockFilterType="all"
        setBlockFilterType={() => {}}
        blockFilterDate={format(calendarDate, "yyyy-MM-dd")}
        setBlockFilterDate={() => {}}
        unblockDay={async () => {}}
        unblockTime={async () => {}}
        blockedPeriods={blockedPeriods}
      />

      {/* Modais e cards adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QuickViewModal 
          isOpen={false} 
          onOpenChange={() => {}} 
          quickViewDate={calendarDate} 
          getReservationsByDate={() => []} 
          getStatusBadge={getStatusBadge} 
          getTourDisplayName={getTourDisplayName} 
        />
        <BlockDayModal 
          isOpen={blockDayModalOpen} 
          onOpenChange={setBlockDayModalOpen} 
          blockDate={calendarDate} 
          blockDayReason="" 
          setBlockDayReason={() => {}} 
          onConfirm={handleConfirmBlockDay} 
        />
        <BlockHourModal 
          isOpen={blockHourModalOpen} 
          onOpenChange={setBlockHourModalOpen} 
          blockDate={calendarDate} 
          setBlockDate={() => {}} 
          blockHourStart="" 
          setBlockHourStart={() => {}} 
          blockHourEnd="" 
          setBlockHourEnd={() => {}} 
          blockTimeReason="" 
          setBlockTimeReason={() => {}} 
          timeSlots={[]} 
          blockTime={blockTime} 
          blockTimeRange={() => {}} 
          getAllDayBlocks={() => []} 
          unblockTime={unblockTime} 
        />
        <CancelReservationModal 
          isOpen={cancelReservationModalOpen} 
          onOpenChange={setCancelReservationModalOpen} 
          reservation={null} 
          cancelReason="" 
          setCancelReason={() => {}} 
          onConfirm={() => {}} 
          isCancelling={false} 
          getTourDisplayName={getTourDisplayName} 
        />
        <WhatsappMessageModal 
          isOpen={whatsappMessageModalOpen} 
          onOpenChange={setWhatsappMessageModalOpen} 
          reservation={null} 
          editableMessage="" 
          setEditableMessage={() => {}} 
          onSend={() => {}} 
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

// Exportamos o componente para ser usado em outros lugares
export default AdminCalendar;
