import { supabase } from "@/lib/supabase";
import { AdminReservation, BlockedPeriod } from "@/types/adminReservations";

// Tipos auxiliares para dados do banco
interface Conductor {
  id: string;
  name: string;
  whatsapp?: string;
  // Dados estáticos apenas. Não incluir latitude, longitude ou is_active.
  // end interface Conductor
}

export interface ActiveConductor {
  conductor_id: string;
  is_active: boolean;
  status?: "available" | "busy";
  occupied_until?: string | null;
  session_start?: string;
}
// Atualiza status e occupied_until do condutor ativo
export const updateTuktukStatus = async (
  conductorId: string,
  status: "available" | "busy",
  occupiedUntil?: Date | null
) => {
  try {
    // Primeiro, verificar se existe registro para este condutor
    const { data: existingRecord } = await supabase
      .from("active_conductors")
      .select("*")
      .eq("conductor_id", conductorId)
      .eq("is_active", true);

    console.log("Registros existentes para condutor:", existingRecord); // Debug

    if (!existingRecord || existingRecord.length === 0) {
      console.error(
        "❌ Nenhum registro ativo encontrado para o condutor:",
        conductorId
      );
      return null;
    }

    // Converter status para boolean: "available" = true, "busy" = false
    const isAvailable = status === "available";

    console.log("Salvando status:", {
      conductorId,
      isAvailable,
      occupiedUntil,
    }); // Debug

    const { data, error } = await supabase
      .from("active_conductors")
      .update({
        is_available: isAvailable, // Usar boolean
        occupied_until: occupiedUntil?.toISOString() || null,
      })
      .eq("conductor_id", conductorId)
      .eq("is_active", true);

    console.log("Resultado da atualização:", { data, error }); // Debug

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao atualizar status do TukTuk:", error);
    throw error;
  }
};

// Busca status e occupied_until do condutor ativo
export const fetchTuktukStatus = async (
  conductorId: string
): Promise<{
  status: "available" | "busy";
  occupied_until: string | null;
} | null> => {
  try {
    const { data, error } = await supabase
      .from("active_conductors")
      .select("is_available, occupied_until")
      .eq("conductor_id", conductorId)
      .single();

    if (error) {
      console.error("Erro ao buscar status do TukTuk:", error);
      return null;
    }

    // ✅ Converter boolean para string
    const status = data.is_available ? "available" : "busy";

    return {
      status: status,
      occupied_until: data.occupied_until,
    };
  } catch (error) {
    console.error("Erro ao buscar status do TukTuk:", error);
    return null;
  }
};

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
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Supabase error:", error);
      return [];
    }
    console.log("Reservations loaded from Supabase:", data?.length || 0);
    return (data as AdminReservation[]) || [];
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return [];
  }
};

export const updateReservationInSupabase = async (
  id: string,
  status: string
): Promise<AdminReservation | undefined> => {
  console.log("Updating reservation in Supabase:", { id, status });
  try {
    const { data, error } = await supabase
      .from("reservations")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();
    if (error) {
      console.error("Error updating reservation:", error);
      throw error;
    }
    return (data as AdminReservation[])?.[0];
  } catch (error) {
    console.error("Error updating reservation:", error);
    throw error;
  }
};

export const updateManualPaymentInSupabase = async (
  id: string,
  manualPayment: number
): Promise<AdminReservation | undefined> => {
  console.log("Updating manual payment in Supabase:", { id, manualPayment });
  try {
    const { data, error } = await supabase
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
    return (data as AdminReservation[])?.[0];
  } catch (error) {
    console.error("Error updating manual payment:", error);
    throw error;
  }
};

// --- Novas funções para condutores ---
export const fetchActiveConductors = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("active_conductors")
      .select("conductor_id")
      .eq("is_active", true);
    if (error) {
      console.error("Error fetching active conductors:", error);
      return [];
    }
    return (
      (data as { conductor_id: string }[])?.map((item) => item.conductor_id) ||
      []
    );
  } catch (error) {
    console.error("Error fetching active conductors:", error);
    return [];
  }
};

export const updateActiveConductors = async (
  conductorIds: string[]
): Promise<void> => {
  try {
    // 1. Finalizar sessões ativas na tabela active_conductors
    await supabase
      .from("active_conductors")
      .update({
        is_active: false,
        session_end: new Date().toISOString(),
      })
      .eq("is_active", true);

    // 2. Ativar condutores selecionados
    if (conductorIds.length > 0) {
      // Criar registros na tabela active_conductors
      const activeRecords = conductorIds.map((id) => ({
        conductor_id: id,
        is_active: true,
        is_available: true,
        status: "available",
        session_start: new Date().toISOString(),
      }));

      await supabase.from("active_conductors").insert(activeRecords);
    }
  } catch (error) {
    console.error("Error updating active sessions:", error);
    throw error;
  }
};

export const fetchConductors = async (): Promise<Conductor[]> => {
  try {
    const { data, error } = await supabase
      .from("conductors")
      .select("id, name, tuktuk_id, whatsapp")
      .order("name");
    if (error) {
      console.error("Error fetching conductors:", error);
      return [];
    }
    return (data as Conductor[]) || [];
  } catch (error) {
    console.error("Error fetching conductors:", error);
    return [];
  }
};

// --- Novas funções para bloqueios ---
export const fetchBlockedPeriods = async (): Promise<BlockedPeriod[]> => {
  try {
    const { data, error } = await supabase
      .from("blocked_periods")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching blocked periods:", error);
      return [];
    }
    // Mapear os campos do banco para a interface TypeScript
    type DBBlockedPeriodRow = {
      id: string;
      date: string;
      start_time?: string | null;
      end_time?: string | null;
      reason?: string | null;
      created_by: string;
      created_at?: string | null;
    };

    return (
      (data as DBBlockedPeriodRow[] | null)?.map((item) => ({
        id: item.id,
        date: item.date,
        startTime: item.start_time,
        endTime: item.end_time,
        reason: item.reason,
        createdBy: item.created_by,
        createdAt: item.created_at,
      })) || []
    );
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

    const { data, error } = await supabase
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
    const { error } = await supabase
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

    let query = supabase.from("blocked_periods").delete().eq("date", date);

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
    const { data: allBlockedPeriods, error: fetchError } = await supabase
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
    type DBBlockedPeriodRow = {
      id: string;
      date: string;
      start_time?: string | null;
      end_time?: string | null;
      reason?: string | null;
      created_by: string;
      created_at?: string | null;
    };

    const groupedByDateAndTime: { [key: string]: DBBlockedPeriodRow[] } = {};

    (allBlockedPeriods as DBBlockedPeriodRow[]).forEach((period) => {
      const key = `${period.date}_${period.start_time}`;
      if (!groupedByDateAndTime[key]) {
        groupedByDateAndTime[key] = [];
      }
      groupedByDateAndTime[key].push(period);
    });

    // Identificar duplicados (mais de 1 bloqueio para mesma data/horário)
    const duplicatesToRemove: string[] = [];

    Object.values(groupedByDateAndTime).forEach((periods) => {
      if (periods.length > 1) {
        // Manter o mais recente (primeiro da lista, já ordenado por created_at desc)
        const toRemove = periods.slice(1); // Remove todos exceto o primeiro
        toRemove.forEach((period) => {
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
    const { error: deleteError, count } = await supabase
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

// Verificar se existem registros na tabela active_conductors
console.log("Verificando registros ativos...");
