import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
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

export const useAdminReservations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUsingMockData, setIsUsingMockData] = useState(false);

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
    isLoading,
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
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (isUsingMockData) {
        console.log("Mock update reservation:", { id, status });
        return { id, status };
      }

      return await updateReservationInSupabase(id, status);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-reservations"] });
      toast({
        title: "Reserva atualizada",
        description: `Status alterado para: ${variables.status}`,
      });
    },
    onError: (error: any) => {
      console.error("Error updating reservation:", error);
      toast({
        title: "Erro ao atualizar reserva",
        description: error.message || "Tente novamente mais tarde",
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
    onError: (error: any) => {
      console.error("Error updating manual payment:", error);
      toast({
        title: "Erro ao atualizar pagamento",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  // Calculate statistics
  const statistics: ReservationStatistics = calculateStatistics(reservations);

  // Get reservations by date
  const getReservationsByDate = (date: string): AdminReservation[] => {
    return reservations.filter(
      (reservation) => reservation.reservation_date === date
    );
  };

  // Get availability for date - fixed the parameter order
  const getAvailabilityForDateWrapper = (date: string): AvailabilitySlot[] => {
    const dateReservations = getReservationsByDate(date);
    return getAvailabilityForDate(reservations, date);
  };

  return {
    reservations,
    isLoading,
    reservationsLoading: isLoading, // Alias for compatibility
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
  };
};
