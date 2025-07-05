import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Reservation {
  id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  reservation_date: string;
  reservation_time: string;
  number_of_people: number;
  tour_type: string;
  special_requests?: string;
  status?: string;
  total_price: number;
  language?: string;
}

export interface AvailableSlot {
  time: string;
  available: boolean;
  capacity: number;
  reserved: number;
}

export const useReservations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch reservations for a specific date
  const getReservationsForDate = async (date: string) => {
    const { data, error } = await (supabase as any)
      .from("reservations")
      .select("*")
      .eq("reservation_date", date)
      .neq("status", "cancelled");

    if (error) {
      console.error("Error fetching reservations:", error);
      return [];
    }

    return data || [];
  };

  // Check availability for a specific date
  const { data: availability, isLoading: availabilityLoading } = useQuery({
    queryKey: ["availability"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tuk_tuk_availability")
        .select("*");

      if (error) {
        console.error("Error fetching availability:", error);
        return [];
      }

      return data || [];
    },
  });

  // Get available time slots for a specific date
  const getAvailableSlots = async (date: string): Promise<AvailableSlot[]> => {
    const reservations = await getReservationsForDate(date);
    const timeSlots = [
      "09:00",
      "10:30",
      "12:00",
      "14:00",
      "15:30",
      "17:00",
      "18:30",
    ];

    return timeSlots.map((time) => {
      const slotReservations = reservations.filter(
        (r: any) => r.reservation_time === time && r.status !== "cancelled"
      );
      const reserved = slotReservations.reduce(
        (sum: number, r: any) => sum + r.number_of_people,
        0
      );

      return {
        time,
        available: reserved < 4,
        capacity: 4,
        reserved,
      };
    });
  };

  // Create a new reservation
  const createReservationMutation = useMutation({
    mutationFn: async (reservationData: Reservation[]) => {
      console.log("Creating reservations:", reservationData);

      const { data, error } = await (supabase as any)
        .from("reservations")
        .insert(reservationData)
        .select();

      if (error) {
        console.error("Error creating reservation:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      console.log("Reservations created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["reservations"] });

      const reservationCount = data?.length || 0;
      const totalPeople =
        data?.reduce(
          (sum: number, r: any) => sum + (r?.number_of_people || 0),
          0
        ) || 0;
      const totalPrice =
        data?.reduce((sum: number, r: any) => sum + (r?.total_price || 0), 0) ||
        0;
      const tourType = data?.[0]?.tour_type || "";
      const reservationDate = data?.[0]?.reservation_date || "";
      const reservationTime = data?.[0]?.reservation_time || "";

      toast({
        title: "Reserva criada com sucesso!",
        description: `${reservationCount} reserva(s) para ${totalPeople} pessoa(s) - €${totalPrice}`,
      });
    },
    onError: (error: any) => {
      console.error("Error creating reservation:", error);
      toast({
        title: "Erro ao criar reserva",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  // Get tour types
  const { data: tourTypes, isLoading: tourTypesLoading } = useQuery({
    queryKey: ["tourTypes"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("tour_types")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) {
        console.error("Error fetching tour types:", error);
        // Return default tour types if there's an error
        return [
          {
            id: "1",
            name: "Passeio panorâmico pela vila",
            base_price: 10,
            duration_minutes: 60,
          },
          {
            id: "2",
            name: "Vila Nova de Milfontes → Praia das Furnas",
            base_price: 14,
            duration_minutes: 90,
          },
          {
            id: "3",
            name: "Travessia pela ponte",
            base_price: 10,
            duration_minutes: 45,
          },
        ];
      }

      return data || [];
    },
  });

  return {
    availability,
    availabilityLoading,
    tourTypes,
    tourTypesLoading,
    createReservation: createReservationMutation.mutate,
    isCreatingReservation: createReservationMutation.isPending,
    getAvailableSlots,
    getReservationsForDate,
  };
};
