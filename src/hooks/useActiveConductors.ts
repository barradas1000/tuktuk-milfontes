import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchActiveConductors, fetchConductors } from '@/services/supabaseService';

export interface ActiveConductor {
  id: string;
  conductor_id: string;
  is_active: boolean;
  is_available: boolean;
  current_latitude?: number | null;
  current_longitude?: number | null;
  accuracy?: number | null;
  updated_at?: string | null;
  name?: string;
  status?: string;
  occupied_until?: string | null;
}

interface UseActiveConductorsReturn {
  conductors: ActiveConductor[];
  loading: boolean;
  error: string | null;
  refreshConductors: () => Promise<void>;
}

export const useActiveConductors = (): UseActiveConductorsReturn => {
  const [conductors, setConductors] = useState<ActiveConductor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar condutores ativos
      const activeConductorIds = await fetchActiveConductors();

      if (activeConductorIds.length === 0) {
        setConductors([]);
        setLoading(false);
        return;
      }

      // Buscar detalhes dos condutores ativos
      const { data: activeData, error: activeError } = await supabase
        .from('active_conductors')
        .select(`
          id,
          conductor_id,
          is_active,
          is_available,
          current_latitude,
          current_longitude,
          accuracy,
          updated_at,
          status,
          occupied_until
        `)
        .in('conductor_id', activeConductorIds);

      if (activeError) {
        console.error('[useActiveConductors] Error fetching active conductors:', activeError);
        setError(activeError.message);
        setLoading(false);
        return;
      }

      // Buscar nomes dos condutores
      const allConductors = await fetchConductors();
      const conductorsMap = new Map(
        allConductors.map(c => [c.id, c])
      );

      // Combinar dados
      const enrichedConductors = (activeData || []).map((conductor): ActiveConductor => ({
        id: conductor.conductor_id,
        conductor_id: conductor.conductor_id,
        is_active: conductor.is_active || false,
        is_available: conductor.is_available || false,
        current_latitude: conductor.current_latitude,
        current_longitude: conductor.current_longitude,
        accuracy: conductor.accuracy,
        updated_at: conductor.updated_at,
        status: conductor.status,
        occupied_until: conductor.occupied_until,
        name: conductorsMap.get(conductor.conductor_id)?.name || `Condutor ${conductor.conductor_id}`,
      }));

      setConductors(enrichedConductors);
    } catch (err) {
      console.error('[useActiveConductors] Unexpected error:', err);
      setError('Erro ao carregar condutores ativos');
    } finally {
      setLoading(false);
    }
  };

  const refreshConductors = async () => {
    await fetchData();
  };

  useEffect(() => {
    fetchData();

    // Subscrever mudanças realtime nos condutores ativos
    const channel = supabase
      .channel('active_conductors_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_conductors',
        },
        () => {
          console.log('[useActiveConductors] Realtime change detected, refreshing...');
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    conductors,
    loading,
    error,
    refreshConductors,
  };
};
