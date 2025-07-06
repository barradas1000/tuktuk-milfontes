import { supabase } from "@/integrations/supabase/client";
import { mockReservations } from "@/data/mockReservations";
import { checkSupabaseConfiguration } from "./supabaseService";
import { generateDynamicTimeSlots } from "@/utils/reservationUtils";

export interface AvailabilityCheck {
  isAvailable: boolean;
  existingReservations: number;
  maxCapacity: number;
  alternativeTimes: string[];
  message: string;
}

export interface ReservationConflict {
  date: string;
  time: string;
  existingPeople: number;
  requestedPeople: number;
  maxCapacity: number;
}

const MAX_CAPACITY = 1; // Máximo de 1 reserva por horário (não importa o número de pessoas)

export const checkAvailability = async (
  date: string,
  time: string,
  numberOfPeople: number
): Promise<AvailabilityCheck> => {
  const isConfigured = checkSupabaseConfiguration();
  
  try {
    let existingReservations: any[] = [];
    
    if (isConfigured) {
      // Buscar reservas existentes no Supabase
      const { data, error } = await supabase
        .from("reservations")
        .select("number_of_people, status")
        .eq("reservation_date", date)
        .eq("reservation_time", time)
        .neq("status", "cancelled");

      if (error) {
        console.error("Error checking availability:", error);
        return {
          isAvailable: false,
          existingReservations: 0,
          maxCapacity: MAX_CAPACITY,
          alternativeTimes: [],
          message: "Erro ao verificar disponibilidade"
        };
      }
      
      existingReservations = data || [];
    } else {
      // Usar dados mock
      existingReservations = mockReservations.filter(
        r => r.reservation_date === date && 
             r.reservation_time === time && 
             r.status !== 'cancelled'
      );
    }

    // Verificar se já existe alguma reserva para este horário
    const hasExistingReservation = existingReservations.length > 0;
    
    // Verificar se há espaço suficiente (máximo 1 reserva por horário)
    const isAvailable = !hasExistingReservation;
    
    // Gerar horários alternativos se não estiver disponível
    const alternativeTimes = isAvailable ? [] : await generateAlternativeTimes(date, numberOfPeople);

    const message = isAvailable 
      ? "Horário disponível!"
      : `Este horário já está reservado por outro cliente.`;

    return {
      isAvailable,
      existingReservations: existingReservations.length,
      maxCapacity: MAX_CAPACITY,
      alternativeTimes,
      message
    };
  } catch (error) {
    console.error("Error checking availability:", error);
    return {
      isAvailable: false,
      existingReservations: 0,
      maxCapacity: MAX_CAPACITY,
      alternativeTimes: [],
      message: "Erro ao verificar disponibilidade"
    };
  }
};

export const generateAlternativeTimes = async (
  date: string,
  numberOfPeople: number
): Promise<string[]> => {
  const isConfigured = checkSupabaseConfiguration();
  const alternatives: string[] = [];

  try {
    const timeSlots = generateDynamicTimeSlots();
    for (const timeSlot of timeSlots) {
      let existingReservations: any[] = [];
      
      if (isConfigured) {
        const { data } = await supabase
          .from("reservations")
          .select("number_of_people, status")
          .eq("reservation_date", date)
          .eq("reservation_time", timeSlot)
          .neq("status", "cancelled");
        
        existingReservations = data || [];
      } else {
        existingReservations = mockReservations.filter(
          r => r.reservation_date === date && 
               r.reservation_time === timeSlot && 
               r.status !== 'cancelled'
        );
      }

      // Se não há reservas para este horário, está disponível
      if (existingReservations.length === 0) {
        alternatives.push(timeSlot);
      }
    }

    return alternatives;
  } catch (error) {
    console.error("Error generating alternative times:", error);
    return [];
  }
};

export const getAvailabilityForDate = async (date: string): Promise<Record<string, number>> => {
  const isConfigured = checkSupabaseConfiguration();
  const availability: Record<string, number> = {};

  try {
    const timeSlots = generateDynamicTimeSlots();
    for (const timeSlot of timeSlots) {
      let existingReservations: any[] = [];
      
      if (isConfigured) {
        const { data } = await supabase
          .from("reservations")
          .select("number_of_people, status")
          .eq("reservation_date", date)
          .eq("reservation_time", timeSlot)
          .neq("status", "cancelled");
        
        existingReservations = data || [];
      } else {
        existingReservations = mockReservations.filter(
          r => r.reservation_date === date && 
               r.reservation_time === timeSlot && 
               r.status !== 'cancelled'
        );
      }

      // 0 = disponível, 1 = ocupado
      availability[timeSlot] = existingReservations.length === 0 ? 0 : 1;
    }

    return availability;
  } catch (error) {
    console.error("Error getting availability for date:", error);
    return {};
  }
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};
