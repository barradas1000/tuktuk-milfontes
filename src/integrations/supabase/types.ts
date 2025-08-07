export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      active_conductors: {
        Row: {
          activated_at: string | null
          conductor_id: string | null
          created_at: string | null
          current_latitude: number | null
          current_longitude: number | null
          id: string
          is_active: boolean
          is_available: boolean | null
          last_ping: string | null
          occupied_until: string | null
          session_end: string | null
          session_start: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          activated_at?: string | null
          conductor_id?: string | null
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          id?: string
          is_active?: boolean
          is_available?: boolean | null
          last_ping?: string | null
          occupied_until?: string | null
          session_end?: string | null
          session_start?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          activated_at?: string | null
          conductor_id?: string | null
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          id?: string
          is_active?: boolean
          is_available?: boolean | null
          last_ping?: string | null
          occupied_until?: string | null
          session_end?: string | null
          session_start?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "active_conductors_conductor_id_fkey"
            columns: ["conductor_id"]
            isOneToOne: false
            referencedRelation: "conductors"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          action: string
          additional_data: Json | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          additional_data?: Json | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          additional_data?: Json | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blocked_periods: {
        Row: {
          created_at: string | null
          created_by: string
          createdBy: string | null
          date: string
          end_time: string | null
          id: string
          reason: string | null
          start_time: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          createdBy?: string | null
          date: string
          end_time?: string | null
          id?: string
          reason?: string | null
          start_time?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          createdBy?: string | null
          date?: string
          end_time?: string | null
          id?: string
          reason?: string | null
          start_time?: string | null
        }
        Relationships: []
      }
      conductor_applications: {
        Row: {
          availability_hours: Json | null
          created_at: string | null
          documents: Json | null
          driver_license_expiry: string | null
          driver_license_number: string | null
          email: string
          experience_years: number | null
          full_name: string
          has_own_vehicle: boolean | null
          id: string
          phone: string
          preferred_zones: string[] | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submitted_at: string | null
          updated_at: string | null
          vehicle_details: Json | null
          whatsapp: string | null
        }
        Insert: {
          availability_hours?: Json | null
          created_at?: string | null
          documents?: Json | null
          driver_license_expiry?: string | null
          driver_license_number?: string | null
          email: string
          experience_years?: number | null
          full_name: string
          has_own_vehicle?: boolean | null
          id?: string
          phone: string
          preferred_zones?: string[] | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          vehicle_details?: Json | null
          whatsapp?: string | null
        }
        Update: {
          availability_hours?: Json | null
          created_at?: string | null
          documents?: Json | null
          driver_license_expiry?: string | null
          driver_license_number?: string | null
          email?: string
          experience_years?: number | null
          full_name?: string
          has_own_vehicle?: boolean | null
          id?: string
          phone?: string
          preferred_zones?: string[] | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          vehicle_details?: Json | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      conductor_locations: {
        Row: {
          accuracy: number | null
          altitude: number | null
          conductor_id: string | null
          created_at: string | null
          heading: number | null
          id: string
          is_active: boolean | null
          latitude: number
          longitude: number
          speed: number | null
          timestamp: string | null
        }
        Insert: {
          accuracy?: number | null
          altitude?: number | null
          conductor_id?: string | null
          created_at?: string | null
          heading?: number | null
          id?: string
          is_active?: boolean | null
          latitude: number
          longitude: number
          speed?: number | null
          timestamp?: string | null
        }
        Update: {
          accuracy?: number | null
          altitude?: number | null
          conductor_id?: string | null
          created_at?: string | null
          heading?: number | null
          id?: string
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          speed?: number | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conductor_locations_conductor_id_fkey"
            columns: ["conductor_id"]
            isOneToOne: false
            referencedRelation: "conductors"
            referencedColumns: ["id"]
          },
        ]
      }
      conductor_status_audit: {
        Row: {
          additional_data: Json | null
          change_reason: string | null
          change_timestamp: string | null
          changed_by: string | null
          conductor_id: string | null
          created_at: string | null
          id: string
          new_status: string | null
          old_status: string | null
        }
        Insert: {
          additional_data?: Json | null
          change_reason?: string | null
          change_timestamp?: string | null
          changed_by?: string | null
          conductor_id?: string | null
          created_at?: string | null
          id?: string
          new_status?: string | null
          old_status?: string | null
        }
        Update: {
          additional_data?: Json | null
          change_reason?: string | null
          change_timestamp?: string | null
          changed_by?: string | null
          conductor_id?: string | null
          created_at?: string | null
          id?: string
          new_status?: string | null
          old_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conductor_status_audit_conductor_id_fkey"
            columns: ["conductor_id"]
            isOneToOne: false
            referencedRelation: "conductors"
            referencedColumns: ["id"]
          },
        ]
      }
      conductor_vehicle_sessions: {
        Row: {
          conductor_id: string | null
          created_at: string | null
          end_location: Json | null
          ended_by: string | null
          fuel_consumed: number | null
          id: string
          kilometers_driven: number | null
          maintenance_issues: string[] | null
          session_end: string | null
          session_notes: string | null
          session_start: string | null
          start_location: Json | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          conductor_id?: string | null
          created_at?: string | null
          end_location?: Json | null
          ended_by?: string | null
          fuel_consumed?: number | null
          id?: string
          kilometers_driven?: number | null
          maintenance_issues?: string[] | null
          session_end?: string | null
          session_notes?: string | null
          session_start?: string | null
          start_location?: Json | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          conductor_id?: string | null
          created_at?: string | null
          end_location?: Json | null
          ended_by?: string | null
          fuel_consumed?: number | null
          id?: string
          kilometers_driven?: number | null
          maintenance_issues?: string[] | null
          session_end?: string | null
          session_notes?: string | null
          session_start?: string | null
          start_location?: Json | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conductor_vehicle_sessions_conductor_id_fkey"
            columns: ["conductor_id"]
            isOneToOne: false
            referencedRelation: "conductors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conductor_vehicle_sessions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "tuktuk_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      conductors: {
        Row: {
          block_reason: string | null
          blocked_at: string | null
          blocked_by: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          region: string | null
          restricted_zone: Json | null
          tuktuk_id: string | null
          updated_at: string | null
          updated_by: string | null
          user_id: string | null
          whatsapp: string
        }
        Insert: {
          block_reason?: string | null
          blocked_at?: string | null
          blocked_by?: string | null
          created_at?: string | null
          id: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          region?: string | null
          restricted_zone?: Json | null
          tuktuk_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
          whatsapp: string
        }
        Update: {
          block_reason?: string | null
          blocked_at?: string | null
          blocked_by?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          region?: string | null
          restricted_zone?: Json | null
          tuktuk_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "conductors_tuktuk_id_fkey"
            columns: ["tuktuk_id"]
            isOneToOne: false
            referencedRelation: "tuktuks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conductors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          admin_level: Database["public"]["Enums"]["admin_level"] | null
          created_at: string | null
          created_by: string | null
          email: string | null
          full_name: string | null
          id: string
          permissions: Json | null
          region: string | null
          role: string | null
          updated_at: string | null
          zone: string | null
        }
        Insert: {
          admin_level?: Database["public"]["Enums"]["admin_level"] | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          permissions?: Json | null
          region?: string | null
          role?: string | null
          updated_at?: string | null
          zone?: string | null
        }
        Update: {
          admin_level?: Database["public"]["Enums"]["admin_level"] | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          permissions?: Json | null
          region?: string | null
          role?: string | null
          updated_at?: string | null
          zone?: string | null
        }
        Relationships: []
      }
      reservations: {
        Row: {
          assigned_conductor_id: string | null
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          language: string | null
          manual_payment: number | null
          number_of_people: number
          reservation_date: string
          reservation_time: string
          special_requests: string | null
          status: string | null
          total_price: number | null
          tour_type: string
          updated_at: string | null
        }
        Insert: {
          assigned_conductor_id?: string | null
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          id?: string
          language?: string | null
          manual_payment?: number | null
          number_of_people: number
          reservation_date: string
          reservation_time: string
          special_requests?: string | null
          status?: string | null
          total_price?: number | null
          tour_type: string
          updated_at?: string | null
        }
        Update: {
          assigned_conductor_id?: string | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          language?: string | null
          manual_payment?: number | null
          number_of_people?: number
          reservation_date?: string
          reservation_time?: string
          special_requests?: string | null
          status?: string | null
          total_price?: number | null
          tour_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tour_types: {
        Row: {
          base_price: number
          created_at: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          max_people: number | null
          name: string
        }
        Insert: {
          base_price: number
          created_at?: string | null
          description?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean | null
          max_people?: number | null
          name: string
        }
        Update: {
          base_price?: number
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          max_people?: number | null
          name?: string
        }
        Relationships: []
      }
      tuktuk_vehicles: {
        Row: {
          created_at: string | null
          current_conductor: string | null
          id: string
          is_active: boolean | null
          is_available: boolean | null
          license_plate: string | null
          maintenance_status:
            | Database["public"]["Enums"]["vehicle_status"]
            | null
          managed_by: string | null
          region: string
          updated_at: string | null
          vehicle_info: Json | null
          vehicle_name: string
          vehicle_number: number
          zone: string | null
        }
        Insert: {
          created_at?: string | null
          current_conductor?: string | null
          id?: string
          is_active?: boolean | null
          is_available?: boolean | null
          license_plate?: string | null
          maintenance_status?:
            | Database["public"]["Enums"]["vehicle_status"]
            | null
          managed_by?: string | null
          region: string
          updated_at?: string | null
          vehicle_info?: Json | null
          vehicle_name: string
          vehicle_number: number
          zone?: string | null
        }
        Update: {
          created_at?: string | null
          current_conductor?: string | null
          id?: string
          is_active?: boolean | null
          is_available?: boolean | null
          license_plate?: string | null
          maintenance_status?:
            | Database["public"]["Enums"]["vehicle_status"]
            | null
          managed_by?: string | null
          region?: string
          updated_at?: string | null
          vehicle_info?: Json | null
          vehicle_name?: string
          vehicle_number?: number
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tuktuk_vehicles_current_conductor_fkey"
            columns: ["current_conductor"]
            isOneToOne: false
            referencedRelation: "conductors"
            referencedColumns: ["id"]
          },
        ]
      }
      tuktuks: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          id: string
          identificador: string
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          identificador: string
          nome: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          identificador?: string
          nome?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vehicle_maintenance: {
        Row: {
          completed_date: string | null
          cost: number | null
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          maintenance_type: string
          next_maintenance_date: string | null
          notes: string | null
          performed_by: string | null
          receipts: Json | null
          scheduled_date: string | null
          status: string | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          completed_date?: string | null
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          maintenance_type: string
          next_maintenance_date?: string | null
          notes?: string | null
          performed_by?: string | null
          receipts?: Json | null
          scheduled_date?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          completed_date?: string | null
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          maintenance_type?: string
          next_maintenance_date?: string | null
          notes?: string | null
          performed_by?: string | null
          receipts?: Json | null
          scheduled_date?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_maintenance_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "tuktuk_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      admin_level: "super_admin" | "admin_regional" | "admin_local"
      application_status:
        | "link_created"
        | "submitted"
        | "approved"
        | "rejected"
        | "expired"
      conductor_status: "active" | "blocked" | "expelled" | "inactive"
      vehicle_status: "operational" | "maintenance" | "out_of_service"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_level: ["super_admin", "admin_regional", "admin_local"],
      application_status: [
        "link_created",
        "submitted",
        "approved",
        "rejected",
        "expired",
      ],
      conductor_status: ["active", "blocked", "expelled", "inactive"],
      vehicle_status: ["operational", "maintenance", "out_of_service"],
    },
  },
} as const
