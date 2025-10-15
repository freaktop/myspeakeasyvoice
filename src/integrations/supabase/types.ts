export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      app_integrations: {
        Row: {
          app_name: string
          created_at: string
          encrypted_credentials: string | null
          id: string
          integration_type: string
          is_active: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          app_name: string
          created_at?: string
          encrypted_credentials?: string | null
          id?: string
          integration_type: string
          is_active?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          app_name?: string
          created_at?: string
          encrypted_credentials?: string | null
          id?: string
          integration_type?: string
          is_active?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      command_history: {
        Row: {
          action_performed: string
          command_text: string
          context_mode: string | null
          created_at: string
          id: string
          response_time_ms: number | null
          success: boolean | null
          user_id: string
        }
        Insert: {
          action_performed: string
          command_text: string
          context_mode?: string | null
          created_at?: string
          id?: string
          response_time_ms?: number | null
          success?: boolean | null
          user_id: string
        }
        Update: {
          action_performed?: string
          command_text?: string
          context_mode?: string | null
          created_at?: string
          id?: string
          response_time_ms?: number | null
          success?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      credential_access_log: {
        Row: {
          access_type: string
          created_at: string | null
          error_message: string | null
          id: string
          integration_id: string | null
          ip_address: unknown | null
          success: boolean | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          access_type: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          integration_id?: string | null
          ip_address?: unknown | null
          success?: boolean | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          access_type?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          integration_id?: string | null
          ip_address?: unknown | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credential_access_log_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "app_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          microphone_sensitivity: number | null
          preferred_mode: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
          voice_feedback_enabled: boolean | null
          wake_phrase: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          microphone_sensitivity?: number | null
          preferred_mode?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
          voice_feedback_enabled?: boolean | null
          wake_phrase?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          microphone_sensitivity?: number | null
          preferred_mode?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
          voice_feedback_enabled?: boolean | null
          wake_phrase?: string | null
        }
        Relationships: []
      }
      security_alerts: {
        Row: {
          alert_type: string
          created_at: string
          details: Json | null
          id: string
          resolved: boolean | null
          severity: string
          user_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          details?: Json | null
          id?: string
          resolved?: boolean | null
          severity?: string
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          resolved?: boolean | null
          severity?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      voice_command_rate_limit: {
        Row: {
          command_count: number
          created_at: string
          id: string
          user_id: string
          window_start: string
        }
        Insert: {
          command_count?: number
          created_at?: string
          id?: string
          user_id: string
          window_start?: string
        }
        Update: {
          command_count?: number
          created_at?: string
          id?: string
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      voice_commands: {
        Row: {
          action_data: Json | null
          action_type: string
          command_phrase: string
          context_mode: string | null
          created_at: string
          id: string
          is_active: boolean | null
          updated_at: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          action_data?: Json | null
          action_type: string
          command_phrase: string
          context_mode?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          action_data?: Json | null
          action_type?: string
          command_phrase?: string
          context_mode?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      voice_settings: {
        Row: {
          continuous_listening: boolean | null
          created_at: string
          id: string
          language: string | null
          offline_mode: boolean | null
          updated_at: string
          user_id: string
          voice_feedback: boolean | null
          voice_sensitivity: number | null
          wake_word: string | null
        }
        Insert: {
          continuous_listening?: boolean | null
          created_at?: string
          id?: string
          language?: string | null
          offline_mode?: boolean | null
          updated_at?: string
          user_id: string
          voice_feedback?: boolean | null
          voice_sensitivity?: number | null
          wake_word?: string | null
        }
        Update: {
          continuous_listening?: boolean | null
          created_at?: string
          id?: string
          language?: string | null
          offline_mode?: boolean | null
          updated_at?: string
          user_id?: string
          voice_feedback?: boolean | null
          voice_sensitivity?: number | null
          wake_word?: string | null
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          source: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          source?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      waitlist_rate_limit: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown
          signup_count: number | null
          updated_at: string | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address: unknown
          signup_count?: number | null
          updated_at?: string | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown
          signup_count?: number | null
          updated_at?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_credentials: {
        Args: { integration_id: string }
        Returns: boolean
      }
      check_voice_command_rate_limit: {
        Args: {
          _max_commands?: number
          _user_id: string
          _window_minutes?: number
        }
        Returns: boolean
      }
      check_waitlist_rate_limit: {
        Args: {
          _ip_address: unknown
          _max_signups?: number
          _window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_old_command_history: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_waitlist_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      decrypt_credentials: {
        Args: { encrypted_data: string }
        Returns: Json
      }
      encrypt_credentials: {
        Args: { credentials_data: Json }
        Returns: string
      }
      get_encryption_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_integrations: {
        Args: Record<PropertyKey, never>
        Returns: {
          app_name: string
          created_at: string
          credentials: Json
          id: string
          integration_type: string
          is_active: boolean
          updated_at: string
        }[]
      }
      get_user_integrations_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          app_name: string
          created_at: string
          has_credentials: boolean
          id: string
          integration_type: string
          is_active: boolean
          updated_at: string
          user_id: string
        }[]
      }
      get_user_integrations_summary_with_logging: {
        Args: Record<PropertyKey, never>
        Returns: {
          app_name: string
          created_at: string
          has_credentials: boolean
          id: string
          integration_type: string
          is_active: boolean
          updated_at: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_app_integration: {
        Args: {
          p_app_name: string
          p_credentials: Json
          p_integration_type: string
          p_is_active?: boolean
        }
        Returns: string
      }
      log_credential_access: {
        Args: {
          p_access_type: string
          p_error_message?: string
          p_integration_id: string
          p_success?: boolean
        }
        Returns: undefined
      }
      log_waitlist_signup: {
        Args: {
          _email: string
          _error_message?: string
          _ip_address: unknown
          _success: boolean
        }
        Returns: undefined
      }
      log_waitlist_unauthorized_access: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sanitize_command_text: {
        Args: { command_text: string }
        Returns: string
      }
      secure_waitlist_signup: {
        Args: { _email: string; _name?: string; _source?: string }
        Returns: Json
      }
      update_integration_credentials: {
        Args: { p_credentials: Json; p_integration_id: string }
        Returns: boolean
      }
      update_user_role: {
        Args: {
          new_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: boolean
      }
      validate_credential_access: {
        Args: { access_type?: string; integration_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
