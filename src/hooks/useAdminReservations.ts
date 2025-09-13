import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import {
  AdminReservation,
  ReservationStatistics,
  AvailabilitySlot,
} from "@/types/adminReservations";
import {
  checkSupabaseConfiguration,
  fetchReservationsFromSupabase,
  updateReservationInSupabase,
  updateManualPaymentInSupabase,
} from "@/services/supabaseService";
import { mockReservations } from "@/data/mockReservations";
import {
  calculateStatistics,
  getAvailabilityForDate,
} from "@/utils/reservationUtils";
// Importar novas funções da grid avançada
import {
  generateDayAvailability,
  generateWeeklyAvailability,
  canScheduleTour,
  type DayAvailability,
  type TimeSlot,
} from "@/services/availabilityService";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);


export const useAdminReservations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if Supabase is configured
  useEffect(() => {
    const isConfigured = checkSupabaseConfiguration();
    setIsUsingMockData(!isConfigured);
    if (!isConfigured) {
      console.log("Using mock data for admin reservations");
    }
  }, []);

  // Fetch reservations
  const {
    data: reservations = [],
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-reservations"],
    queryFn: async (): Promise<AdminReservation[]> => {
      if (isUsingMockData) {
        console.log("Returning mock reservations for admin");
        return mockReservations;
      }
      try {
        return await fetchReservationsFromSupabase();
      } catch (error) {
        console.error(
          "Failed to fetch from Supabase, falling back to mock data:",
          error
        );
        setIsUsingMockData(true);
        return mockReservations;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Update reservation status
  const updateReservationMutation = useMutation({
    mutationFn: async (input: UpdateReservationInput) => {
      if (isUsingMockData) {
        console.log("Mock update reservation:", input);
        return input;
      }
      const { error } = await supabase
        .from("reservations")
        .update({
          status: input.status,
          cancellation_reason: input.cancellation_reason,
        })
        .eq("id", input.id);

      if (error) throw error;
      return input;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-reservations"] });
      toast({
        title: "Reserva atualizada",
        description: `Status alterado para: ${variables.status}`,
      });
    },
    onError: (error: unknown) => {
      console.error("Error updating reservation:", error);
      toast({
        title: "Erro ao atualizar reserva",
        description:
          error instanceof Error ? error.message : "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  // Update manual payment
  const updateManualPaymentMutation = useMutation({
    mutationFn: async ({
      id,
      manualPayment,
    }: {
      id: string;
      manualPayment: number;
    }) => {
      if (isUsingMockData) {
        console.log("Mock update manual payment:", { id, manualPayment });
        // Update the mock data directly
        const reservationIndex = mockReservations.findIndex((r) => r.id === id);
        if (reservationIndex !== -1) {
          mockReservations[reservationIndex].manual_payment = manualPayment;
        }
        return { id, manualPayment };
      }

      return await updateManualPaymentInSupabase(id, manualPayment);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch to update statistics
      queryClient.invalidateQueries({ queryKey: ["admin-reservations"] });
      toast({
        title: "Pagamento atualizado",
        description: `Valor manual atualizado para €${variables.manualPayment}`,
      });
    },
    onError: (error: unknown) => {
      console.error("Error updating manual payment:", error);
      toast({
        title: "Erro ao atualizar pagamento",
        description:
          error instanceof Error ? error.message : "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  // Calculate statistics
  const statistics: ReservationStatistics = calculateStatistics(reservations);

  // Get reservations by date
  const getReservationsByDate = async (
    date: string
  ): Promise<AdminReservation[]> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/reservations?date=${date}`);
      return await response.json();
    } finally {
      setIsLoading(false);
    }
  };

  // Get availability for date - fixed the parameter order
  const getAvailabilityForDateWrapper = async (date: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/availability?date=${date}`);
      return await response.json();
    } finally {
      setIsLoading(false);
    }
  };

  return {
    reservations,
    error,
    refetch,
    statistics,
    getStatistics: () => statistics, // Method for compatibility
    updateReservation: updateReservationMutation.mutate,
    updateManualPayment: updateManualPaymentMutation.mutate,
    isUpdatingReservation: updateReservationMutation.isPending,
    isUpdating: updateReservationMutation.isPending, // Alias for compatibility
    getReservationsByDate,
    getAvailabilityForDate: getAvailabilityForDateWrapper,
    isUsingMockData,
    isSupabaseConfigured: !isUsingMockData, // For compatibility
    isLoading,
    // Novas funções da grid avançada
    generateDayAvailability,
    generateWeeklyAvailability,
    canScheduleTour,
  };
};

export type UpdateReservationInput = {
  id: string;
  status?: string;
  cancellation_reason?: string;
};
