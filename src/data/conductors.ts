// src/data/conductors.ts
import { supabase } from "@/lib/supabase"; // garante que tens este cliente configurado

export type Conductor = {
  id: string;
  name?: string | null;
  whatsapp?: string | null;
  is_active?: boolean | null;
  tuktuk_id?: string | null;
};

// Type for raw Supabase response data
type ConductorRow = {
  id: string;
  name: string | null;
  whatsapp: string | null;
  is_active: boolean | null;
  tuktuk_id: string | null;
};

/**
 * Busca condutores activos do Supabase.
 * Retorna um array de Conductor[] (vazio em caso de erro).
 */
export async function fetchActiveConductorsFromSupabase(): Promise<Conductor[]> {
  try {
    const { data, error } = await supabase
      .from("conductors")
      .select("id, name, whatsapp, is_active, tuktuk_id")
      .eq("is_active", true);

    if (error) {
      console.error("[fetchActiveConductorsFromSupabase] Supabase error:", error);
      return [];
    }

    // data pode ser null em alguns cenários — garantir o tipo
    if (!data) return [];

    // Mapear para Conductor[]
    return (data as ConductorRow[]).map((d) => ({
      id: d.id,
      name: d.name ?? null,
      whatsapp: d.whatsapp ?? null,
      is_active: d.is_active ?? null,
      tuktuk_id: d.tuktuk_id ?? null,
    }));
  } catch (err) {
    console.error("[fetchActiveConductorsFromSupabase] unexpected error:", err);
    return [];
  }
}

/**
 * Utilitário: busca condutores ativos do Supabase.
 * Retorna lista vazia se não houver dados ou erro.
 */
export async function getActiveConductors(): Promise<Conductor[]> {
  const fromDb = await fetchActiveConductorsFromSupabase();
  return fromDb;
}
