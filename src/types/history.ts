export interface Conductor {
  id: string;
  name: string;
  whatsapp?: string;
  is_active?: boolean;
}

export interface LocationPoint {
  conductor_id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  created_at?: string;
}

export interface HistoryFilters {
  conductorId: string;
  dateRange: {
    from: Date;
    to: Date;
  };
}

export interface TripStatistics {
  totalDistance: number; // km
  duration: number; // segundos
  averageSpeed: number; // km/h
  startTime: Date;
  endTime: Date;
}

export interface StatusAudit {
  id: string;
  conductor_id: string;
  old_status: string | null;
  new_status: string | null;
  changed_by?: string | null;
  reason?: string | null;
  timestamp?: string;
  created_at?: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
  session_id: string | null;
  additional_data: Record<string, unknown> | null;
}

export interface ExpandedHistoryFilters {
  conductorId: string;
  dateRange: {
    from: Date;
    to: Date;
  };
  includeStatusAudit?: boolean;
  includeActivityLogs?: boolean;
  statusFilter?: string;
  actionFilter?: string;
}
