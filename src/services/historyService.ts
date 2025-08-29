import { supabase } from '@/lib/supabase';
import { LocationPoint, Conductor, StatusAudit, ActivityLog, ExpandedHistoryFilters } from '@/types/history';

export const historyService = {
  // Buscar condutores para o dropdown
  async fetchConductors(): Promise<Conductor[]> {
    const { data, error } = await supabase
      .from('conductors')
      .select('id, name, whatsapp, is_active')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  // Buscar histórico de localizações
  async fetchLocationHistory(filters: {
    conductorId: string;
    from: Date;
    to: Date;
  }): Promise<LocationPoint[]> {
    const { data, error } = await supabase
      .from('conductor_locations')
      .select('*')
      .eq('conductor_id', filters.conductorId)
      .gte('timestamp', filters.from.toISOString())
      .lte('timestamp', filters.to.toISOString())
      .order('timestamp');
    
    if (error) throw error;
    return data || [];
  },

  // Buscar histórico de status dos condutores
  async fetchStatusAuditHistory(filters: {
    conductorId: string;
    from: Date;
    to: Date;
  }): Promise<StatusAudit[]> {
    const { data, error } = await supabase
      .from('conductor_status_audit')
      .select('*')
      .eq('conductor_id', filters.conductorId)
      .gte('timestamp', filters.from.toISOString())
      .lte('timestamp', filters.to.toISOString())
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Buscar logs de atividades
  async fetchActivityLogs(filters: {
    conductorId?: string;
    from: Date;
    to: Date;
    actionFilter?: string;
  }): Promise<ActivityLog[]> {
    let query = supabase
      .from('activity_logs')
      .select('*')
      .gte('timestamp', filters.from.toISOString())
      .lte('timestamp', filters.to.toISOString())
      .order('timestamp', { ascending: false });

    if (filters.conductorId) {
      query = query.eq('resource_id', filters.conductorId)
                   .eq('resource_type', 'conductor');
    }

    if (filters.actionFilter) {
      query = query.ilike('action', `%${filters.actionFilter}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Buscar dados expandidos do histórico
  async fetchExpandedHistory(filters: ExpandedHistoryFilters): Promise<{
    locations: LocationPoint[];
    statusAudits: StatusAudit[];
    activityLogs: ActivityLog[];
  }> {
    const [locations, statusAudits, activityLogs] = await Promise.all([
      filters.conductorId ? this.fetchLocationHistory({
        conductorId: filters.conductorId,
        from: filters.dateRange.from,
        to: filters.dateRange.to
      }) : Promise.resolve([]),
      
      filters.includeStatusAudit && filters.conductorId ? this.fetchStatusAuditHistory({
        conductorId: filters.conductorId,
        from: filters.dateRange.from,
        to: filters.dateRange.to
      }) : Promise.resolve([]),
      
      filters.includeActivityLogs ? this.fetchActivityLogs({
        conductorId: filters.conductorId,
        from: filters.dateRange.from,
        to: filters.dateRange.to,
        actionFilter: filters.actionFilter
      }) : Promise.resolve([])
    ]);

    return { locations, statusAudits, activityLogs };
  }
};
