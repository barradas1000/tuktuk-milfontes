
import { supabase } from '@/integrations/supabase/client';
import { AdminReservation } from '@/types/adminReservations';

export const checkSupabaseConfiguration = (): boolean => {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return !!(url && anonKey);
  } catch (error) {
    console.log('Supabase not configured, using mock data');
    return false;
  }
};

export const fetchReservationsFromSupabase = async (): Promise<AdminReservation[]> => {
  console.log('Fetching reservations from Supabase...');
  
  const { data, error } = await (supabase as any)
    .from('reservations')
    .select('*')
    .order('reservation_date', { ascending: true });
  
  console.log('Supabase response:', { data, error });
  
  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }
  
  console.log('Reservations loaded from Supabase:', data?.length || 0);
  return data as AdminReservation[];
};

export const updateReservationInSupabase = async (id: string, status: string) => {
  console.log('Updating reservation in Supabase:', { id, status });
  
  const { data, error } = await (supabase as any)
    .from('reservations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
