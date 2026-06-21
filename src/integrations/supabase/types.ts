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
      attendees: {
        Row: {
          created_at: string
          email: string
          event_id: string | null
          id: string
          link_shared: boolean | null
          name: string
          response: string | null
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string
          email: string
          event_id?: string | null
          id?: string
          link_shared?: boolean | null
          name: string
          response?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          event_id?: string | null
          id?: string
          link_shared?: boolean | null
          name?: string
          response?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          agenda: Json | null
          bride_name: string | null
          created_at: string
          date: string
          description: string | null
          groom_name: string | null
          id: string
          is_active: boolean | null
          image_url: string | null
          background_image_url: string | null
          location: string
          location_url: string | null
          mobile_number: string | null
          slider_images: string[] | null
          status: string | null
          theme_id: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agenda?: Json | null
          bride_name?: string | null
          created_at?: string
          date: string
          description?: string | null
          groom_name?: string | null
          id?: string
          is_active?: boolean | null
          image_url?: string | null
          background_image_url?: string | null
          location: string
          location_url?: string | null
          mobile_number?: string | null
          slider_images?: string[] | null
          status?: string | null
          theme_id?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agenda?: Json | null
          bride_name?: string | null
          created_at?: string
          date?: string
          description?: string | null
          groom_name?: string | null
          id?: string
          is_active?: boolean | null
          image_url?: string | null
          background_image_url?: string | null
          location?: string
          location_url?: string | null
          mobile_number?: string | null
          slider_images?: string[] | null
          status?: string | null
          theme_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          is_admin: boolean | null
          created_at: string
        }
        Insert: {
          id: string
          is_admin?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          is_admin?: boolean | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      Budget: {
        Row: {
          id: string
          user_id: string
          task_id: string
          status: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Budget_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      budget_ledger: {
        Row: {
          id: string
          user_id: string
          type: string
          for_what: string
          vendor: string
          amount: number
          notes: string | null
          date: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          for_what: string
          vendor: string
          amount: number
          notes?: string | null
          date?: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          for_what?: string
          vendor?: string
          amount?: number
          notes?: string | null
          date?: string
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      budget_settings: {
        Row: {
          user_id: string
          total_budget: number
          updated_at: string
        }
        Insert: {
          user_id: string
          total_budget?: number
          updated_at?: string
        }
        Update: {
          user_id?: string
          total_budget?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      short_urls: {
        Row: {
          clicks: number | null
          created_at: string
          expires_at: string
          id: number
          original_url: string
          short_id: string
        }
        Insert: {
          clicks?: number | null
          created_at: string
          expires_at: string
          id?: number
          original_url: string
          short_id: string
        }
        Update: {
          clicks?: number | null
          created_at?: string
          expires_at?: string
          id?: number
          original_url?: string
          short_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clean_expired_events: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_short_urls: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
