import { supabase } from "@/lib/supabase";
import { AdminReservation, BlockedPeriod } from "@/types/adminReservations";

export const checkSupabaseConfiguration = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.log("Supabase not configured, using mock data");
    return false;
  }
  return true;
};

export const fetchReservationsFromSupabase = async (): Promise<
  AdminReservation[]
> => {
  console.log("Fetching reservations from Supabase...");

  try {
    const { data, error } = await (supabase as any)
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return [];
    }

    console.log("Reservations loaded from Supabase:", data?.length || 0);
    return data || [];
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return [];
  }
};

export const updateReservationInSupabase = async (
  id: string,
  status: string
) => {
  console.log("Updating reservation in Supabase:", { id, status });

  try {
    const { data, error } = await (supabase as any)
      .from("reservations")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating reservation:", error);
      throw error;
    }

    return data?.[0];
  } catch (error) {
    console.error("Error updating reservation:", error);
    throw error;
  }
};

export const updateManualPaymentInSupabase = async (
  id: string,
  manualPayment: number
) => {
  console.log("Updating manual payment in Supabase:", { id, manualPayment });

  try {
    const { data, error } = await (supabase as any)
      .from("reservations")
      .update({
        manual_payment: manualPayment,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating manual payment:", error);
      throw error;
    }

    return data?.[0];
  } catch (error) {
    console.error("Error updating manual payment:", error);
    throw error;
  }
};

// --- Novas funções para condutores ---
export const fetchActiveConductors = async (): Promise<string[]> => {
  try {
    const { data, error } = await (supabase as any)
      .from("active_conductors")
      .select("conductor_id")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching active conductors:", error);
      return ["condutor2"]; // fallback para condutor 2
    }

    return data?.map((item: any) => item.conductor_id) || ["condutor2"];
  } catch (error) {
    console.error("Error fetching active conductors:", error);
    return ["condutor2"];
  }
};

export const updateActiveConductors = async (
  conductorIds: string[]
): Promise<void> => {
  try {
    // Primeiro, desativar todos os condutores
    await (supabase as any)
      .from("active_conductors")
      .update({
        is_active: false,
        deactivated_at: new Date().toISOString(),
      })
      .eq("is_active", true);

    // Depois, ativar apenas os selecionados
    for (const conductorId of conductorIds) {
      await (supabase as any).from("active_conductors").insert({
        conductor_id: conductorId,
        is_active: true,
        activated_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error updating active conductors:", error);
    throw error;
  }
};

export const fetchConductors = async () => {
  try {
    const { data, error } = await (supabase as any)
      .from("conductors")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching conductors:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching conductors:", error);
    return [];
  }
};

// --- Novas funções para bloqueios ---
export const fetchBlockedPeriods = async (): Promise<BlockedPeriod[]> => {
  try {
    const { data, error } = await (supabase as any)
      .from("blocked_periods")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching blocked periods:", error);
      return [];
    }

    // Mapear os campos do banco para a interface TypeScript
    return (data || []).map((item: any) => ({
      id: item.id,
      date: item.date,
      startTime: item.start_time,
      endTime: item.end_time,
      reason: item.reason,
      createdBy: item.created_by,
      createdAt: item.created_at, // <-- incluir campo de data de criação
    }));
  } catch (error) {
    console.error("Error fetching blocked periods:", error);
    return [];
  }
};

export const createBlockedPeriod = async (
  blockedPeriod: Omit<BlockedPeriod, "id"> & { createdAt?: string }
): Promise<BlockedPeriod> => {
  try {
    // Mapear os campos da interface para o banco de dados
    const dbBlockedPeriod = {
      date: blockedPeriod.date,
      start_time: blockedPeriod.startTime,
      end_time: blockedPeriod.endTime,
      reason: blockedPeriod.reason,
      created_by: blockedPeriod.createdBy,
      created_at: blockedPeriod.createdAt, // <-- incluir campo de data de criação se fornecido
    };

    const { data, error } = await (supabase as any)
      .from("blocked_periods")
      .insert(dbBlockedPeriod)
      .select()
      .single();

    if (error) {
      console.error("Error creating blocked period:", error);
      throw error;
    }

    // Mapear de volta para a interface TypeScript
    return {
      id: data.id,
      date: data.date,
      startTime: data.start_time,
      endTime: data.end_time,
      reason: data.reason,
      createdBy: data.created_by,
      createdAt: data.created_at, // <-- incluir campo de data de criação
    };
  } catch (error) {
    console.error("Error creating blocked period:", error);
    throw error;
  }
};

export const deleteBlockedPeriod = async (id: string): Promise<void> => {
  try {
    const { error } = await (supabase as any)
      .from("blocked_periods")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting blocked period:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error deleting blocked period:", error);
    throw error;
  }
};

export const deleteBlockedPeriodsByDate = async (
  date: string,
  startTime?: string
): Promise<void> => {
  try {
    console.log("Deletando bloqueios para data:", date, "horário:", startTime);

    let query = (supabase as any)
      .from("blocked_periods")
      .delete()
      .eq("date", date);

    if (startTime) {
      query = query.eq("start_time", startTime);
    } else {
      query = query.is("start_time", null);
    }

    const { error, count } = await query;

    if (error) {
      console.error("Error deleting blocked periods by date:", error);
      throw error;
    }

    console.log("Bloqueios deletados com sucesso. Count:", count);
  } catch (error) {
    console.error("Error deleting blocked periods by date:", error);
    throw error;
  }
};

export const cleanDuplicateBlockedPeriods = async (): Promise<number> => {
  try {
    console.log("Iniciando limpeza de bloqueios duplicados...");

    // Buscar todos os bloqueios
    const { data: allBlockedPeriods, error: fetchError } = await (
      supabase as any
    )
      .from("blocked_periods")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching blocked periods for cleanup:", fetchError);
      throw fetchError;
    }

    if (!allBlockedPeriods || allBlockedPeriods.length === 0) {
      console.log("Nenhum bloqueio encontrado para limpeza");
      return 0;
    }

    // Agrupar por data e horário
    const groupedByDateAndTime: { [key: string]: any[] } = {};

    allBlockedPeriods.forEach((period: any) => {
      const key = `${period.date}_${period.start_time}`;
      if (!groupedByDateAndTime[key]) {
        groupedByDateAndTime[key] = [];
      }
      groupedByDateAndTime[key].push(period);
    });

    // Identificar duplicados (mais de 1 bloqueio para mesma data/horário)
    const duplicatesToRemove: string[] = [];

    Object.values(groupedByDateAndTime).forEach((periods: any[]) => {
      if (periods.length > 1) {
        // Manter o mais recente (primeiro da lista, já ordenado por created_at desc)
        const toRemove = periods.slice(1); // Remove todos exceto o primeiro
        toRemove.forEach((period: any) => {
          duplicatesToRemove.push(period.id);
        });
      }
    });

    if (duplicatesToRemove.length === 0) {
      console.log("Nenhum bloqueio duplicado encontrado");
      return 0;
    }

    console.log(
      `Encontrados ${duplicatesToRemove.length} bloqueios duplicados para remoção`
    );

    // Remover duplicados
    const { error: deleteError, count } = await (supabase as any)
      .from("blocked_periods")
      .delete()
      .in("id", duplicatesToRemove);

    if (deleteError) {
      console.error("Error deleting duplicate blocked periods:", deleteError);
      throw deleteError;
    }

    console.log(`Limpeza concluída: ${count} bloqueios duplicados removidos`);
    return count || 0;
  } catch (error) {
    console.error("Error cleaning duplicate blocked periods:", error);
    throw error;
  }
};
