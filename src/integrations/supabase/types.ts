export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reservations: {
        Row: {
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
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
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          id?: string
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
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          id?: string
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
      tuk_tuk_availability: {
        Row: {
          available_date: string
          created_at: string | null
          id: string
          max_capacity: number | null
          time_slots: Json
          tuk_tuk_id: string
        }
        Insert: {
          available_date: string
          created_at?: string | null
          id?: string
          max_capacity?: number | null
          time_slots?: Json
          tuk_tuk_id: string
        }
        Update: {
          available_date?: string
          created_at?: string | null
          id?: string
          max_capacity?: number | null
          time_slots?: Json
          tuk_tuk_id?: string
        }
        Relationships: []
      }
      conductors: {
        Row: {
          id: string
          name: string
          whatsapp: string
          is_active: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          whatsapp: string
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          whatsapp?: string
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      active_conductors: {
        Row: {
          id: string
          conductor_id: string
          is_active: boolean
          activated_at: string | null
          deactivated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          conductor_id: string
          is_active?: boolean
          activated_at?: string | null
          deactivated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          conductor_id?: string
          is_active?: boolean
          activated_at?: string | null
          deactivated_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "active_conductors_conductor_id_fkey"
            columns: ["conductor_id"]
            isOneToOne: false
            referencedRelation: "conductors"
            referencedColumns: ["id"]
          }
        ]
      }
      blocked_periods: {
        Row: {
          id: string
          date: string
          start_time: string | null
          end_time: string | null
          reason: string | null
          created_by: string
          created_at: string | null
        }
        Insert: {
          id?: string
          date: string
          start_time?: string | null
          end_time?: string | null
          reason?: string | null
          created_by: string
          created_at?: string | null
        }
        Update: {
          id?: string
          date?: string
          start_time?: string | null
          end_time?: string | null
          reason?: string | null
          created_by?: string
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
