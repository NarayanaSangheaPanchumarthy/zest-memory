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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          location: string | null
          patient_id: string
          provider_name: string | null
          status: string
          title: string
        }
        Insert: {
          appointment_date: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          location?: string | null
          patient_id: string
          provider_name?: string | null
          status?: string
          title: string
        }
        Update: {
          appointment_date?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          location?: string | null
          patient_id?: string
          provider_name?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      care_tasks: {
        Row: {
          assigned_to: string
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          patient_id: string
          priority: string
          status: string
          title: string
        }
        Insert: {
          assigned_to: string
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          patient_id: string
          priority?: string
          status?: string
          title: string
        }
        Update: {
          assigned_to?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          patient_id?: string
          priority?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      communication_logs: {
        Row: {
          author_id: string
          created_at: string
          id: string
          log_type: string
          message: string
          patient_id: string
        }
        Insert: {
          author_id: string
          created_at?: string
          id?: string
          log_type?: string
          message: string
          patient_id: string
        }
        Update: {
          author_id?: string
          created_at?: string
          id?: string
          log_type?: string
          message?: string
          patient_id?: string
        }
        Relationships: []
      }
      daily_tasks: {
        Row: {
          category: string
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          is_completed: boolean
          patient_id: string
          scheduled_time: string | null
          task_date: string
          title: string
        }
        Insert: {
          category?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean
          patient_id: string
          scheduled_time?: string | null
          task_date?: string
          title: string
        }
        Update: {
          category?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean
          patient_id?: string
          scheduled_time?: string | null
          task_date?: string
          title?: string
        }
        Relationships: []
      }
      emergency_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_resolved: boolean
          message: string
          patient_id: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_resolved?: boolean
          message: string
          patient_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_resolved?: boolean
          message?: string
          patient_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          accuracy: number | null
          created_at: string
          difficulty: string
          duration_seconds: number | null
          game_type: string
          id: string
          max_score: number
          patient_id: string
          score: number
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          difficulty?: string
          duration_seconds?: number | null
          game_type?: string
          id?: string
          max_score?: number
          patient_id: string
          score?: number
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          difficulty?: string
          duration_seconds?: number | null
          game_type?: string
          id?: string
          max_score?: number
          patient_id?: string
          score?: number
        }
        Relationships: []
      }
      geofence_zones: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          latitude: number
          longitude: number
          name: string
          patient_id: string
          radius_meters: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          latitude: number
          longitude: number
          name: string
          patient_id: string
          radius_meters?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number
          longitude?: number
          name?: string
          patient_id?: string
          radius_meters?: number
        }
        Relationships: []
      }
      help_tickets: {
        Row: {
          created_at: string
          id: string
          message: string
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medications: {
        Row: {
          created_at: string
          dosage: string | null
          frequency: string
          id: string
          is_active: boolean
          name: string
          notes: string | null
          patient_id: string
          time_of_day: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          patient_id: string
          time_of_day?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dosage?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          patient_id?: string
          time_of_day?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          created_at: string
          energy_level: number | null
          entry_date: string
          id: string
          mood: string
          notes: string | null
          patient_id: string
          symptoms: string[] | null
        }
        Insert: {
          created_at?: string
          energy_level?: number | null
          entry_date?: string
          id?: string
          mood: string
          notes?: string | null
          patient_id: string
          symptoms?: string[] | null
        }
        Update: {
          created_at?: string
          energy_level?: number | null
          entry_date?: string
          id?: string
          mood?: string
          notes?: string | null
          patient_id?: string
          symptoms?: string[] | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_patient_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_patient_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_patient_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      patient_assignments: {
        Row: {
          assigned_user_id: string
          created_at: string
          id: string
          patient_id: string
        }
        Insert: {
          assigned_user_id: string
          created_at?: string
          id?: string
          patient_id: string
        }
        Update: {
          assigned_user_id?: string
          created_at?: string
          id?: string
          patient_id?: string
        }
        Relationships: []
      }
      patient_documents: {
        Row: {
          created_at: string
          description: string | null
          file_type: string | null
          file_url: string | null
          id: string
          patient_id: string
          title: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          patient_id: string
          title: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          patient_id?: string
          title?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      patient_locations: {
        Row: {
          accuracy: number | null
          id: string
          latitude: number
          longitude: number
          patient_id: string
          recorded_at: string
        }
        Insert: {
          accuracy?: number | null
          id?: string
          latitude: number
          longitude: number
          patient_id: string
          recorded_at?: string
        }
        Update: {
          accuracy?: number | null
          id?: string
          latitude?: number
          longitude?: number
          patient_id?: string
          recorded_at?: string
        }
        Relationships: []
      }
      patient_vitals: {
        Row: {
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          created_at: string
          id: string
          oxygen_saturation: number | null
          patient_id: string
          pulse_rate: number | null
          recorded_at: string
          source: string | null
          temperature: number | null
        }
        Insert: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string
          id?: string
          oxygen_saturation?: number | null
          patient_id: string
          pulse_rate?: number | null
          recorded_at?: string
          source?: string | null
          temperature?: number | null
        }
        Update: {
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string
          id?: string
          oxygen_saturation?: number | null
          patient_id?: string
          pulse_rate?: number | null
          recorded_at?: string
          source?: string | null
          temperature?: number | null
        }
        Relationships: []
      }
      privacy_settings: {
        Row: {
          allow_ai_analysis: boolean
          created_at: string
          emergency_contacts_visible: boolean
          id: string
          share_location: boolean
          share_vitals_with_caregiver: boolean
          share_vitals_with_clinician: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_ai_analysis?: boolean
          created_at?: string
          emergency_contacts_visible?: boolean
          id?: string
          share_location?: boolean
          share_vitals_with_caregiver?: boolean
          share_vitals_with_clinician?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_ai_analysis?: boolean
          created_at?: string
          emergency_contacts_visible?: boolean
          id?: string
          share_location?: boolean
          share_vitals_with_caregiver?: boolean
          share_vitals_with_clinician?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_assigned_to: {
        Args: { _patient_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "patient" | "caregiver" | "clinician"
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
      app_role: ["patient", "caregiver", "clinician"],
    },
  },
} as const
