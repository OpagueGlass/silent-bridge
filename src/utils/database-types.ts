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
    PostgrestVersion: "13.0.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      appointment: {
        Row: {
          deaf_user_id: string
          end_time: string
          hospital_name: string | null
          id: number
          interpreter_id: string | null
          meeting_url: string | null
          start_time: string
          status: string
        }
        Insert: {
          deaf_user_id: string
          end_time: string
          hospital_name?: string | null
          id?: number
          interpreter_id?: string | null
          meeting_url?: string | null
          start_time: string
          status?: string
        }
        Update: {
          deaf_user_id?: string
          end_time?: string
          hospital_name?: string | null
          id?: number
          interpreter_id?: string | null
          meeting_url?: string | null
          start_time?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_deaf_user_id_fkey"
            columns: ["deaf_user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_interpreter_id_fkey"
            columns: ["interpreter_id"]
            isOneToOne: false
            referencedRelation: "interpreter_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      availability: {
        Row: {
          day_id: number
          end_time: string
          id: number
          interpreter_id: string
          start_time: string
        }
        Insert: {
          day_id: number
          end_time: string
          id?: number
          interpreter_id?: string
          start_time: string
        }
        Update: {
          day_id?: number
          end_time?: string
          id?: number
          interpreter_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "day"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_interpreter_id_fkey"
            columns: ["interpreter_id"]
            isOneToOne: false
            referencedRelation: "interpreter_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          file_name: string | null
          file_path: string | null
          file_size: number | null
          height: number | null
          id: string
          mime_type: string | null
          room_id: string
          sender_id: string
          type: string | null
          width: number | null
        }
        Insert: {
          content: string
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          mime_type?: string | null
          room_id: string
          sender_id: string
          type?: string | null
          width?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          mime_type?: string | null
          room_id?: string
          sender_id?: string
          type?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id?: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      day: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id?: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      interpreter_language: {
        Row: {
          id: number
          interpreter_id: string
          language_id: number
        }
        Insert: {
          id?: number
          interpreter_id?: string
          language_id: number
        }
        Update: {
          id?: number
          interpreter_id?: string
          language_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "interpreter_language_interpreter_id_fkey"
            columns: ["interpreter_id"]
            isOneToOne: false
            referencedRelation: "interpreter_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interpreter_language_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "language"
            referencedColumns: ["id"]
          },
        ]
      }
      interpreter_profile: {
        Row: {
          id: string
        }
        Insert: {
          id: string
        }
        Update: {
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interpreter_profile_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      interpreter_specialisation: {
        Row: {
          id: number
          interpreter_id: string
          specialisation_id: number
        }
        Insert: {
          id?: number
          interpreter_id?: string
          specialisation_id: number
        }
        Update: {
          id?: number
          interpreter_id?: string
          specialisation_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "interpreter_specialisation_interpreter_id_fkey"
            columns: ["interpreter_id"]
            isOneToOne: false
            referencedRelation: "interpreter_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interpreter_specialisation_specialisation_id_fkey"
            columns: ["specialisation_id"]
            isOneToOne: false
            referencedRelation: "specialisation"
            referencedColumns: ["id"]
          },
        ]
      }
      language: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id?: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      notification: {
        Row: {
          body: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          id: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      profile: {
        Row: {
          avg_rating: number | null
          date_of_birth: string
          email: string
          fcm_token: string | null
          gender: string
          id: string
          location: string
          name: string
          photo: string
          receive_notification: boolean | null
        }
        Insert: {
          avg_rating?: number | null
          date_of_birth: string
          email: string
          fcm_token?: string | null
          gender: string
          id: string
          location: string
          name: string
          photo: string
          receive_notification?: boolean | null
        }
        Update: {
          avg_rating?: number | null
          date_of_birth?: string
          email?: string
          fcm_token?: string | null
          gender?: string
          id?: string
          location?: string
          name?: string
          photo?: string
          receive_notification?: boolean | null
        }
        Relationships: []
      }
      rating: {
        Row: {
          appointment_id: number
          id: number
          message: string | null
          rated_user_id: string
          rater_id: string
          score: number
        }
        Insert: {
          appointment_id: number
          id?: number
          message?: string | null
          rated_user_id?: string
          rater_id?: string
          score: number
        }
        Update: {
          appointment_id?: number
          id?: number
          message?: string | null
          rated_user_id?: string
          rater_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "rating_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rating_rated_user_id_fkey"
            columns: ["rated_user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rating_rater_id_fkey"
            columns: ["rater_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      request: {
        Row: {
          appointment_id: number
          id: number
          interpreter_id: string
          is_accepted: boolean | null
          is_expired: boolean
          note: string | null
        }
        Insert: {
          appointment_id: number
          id?: number
          interpreter_id?: string
          is_accepted?: boolean | null
          is_expired?: boolean
          note?: string | null
        }
        Update: {
          appointment_id?: number
          id?: number
          interpreter_id?: string
          is_accepted?: boolean | null
          is_expired?: boolean
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_interpreter_id_fkey"
            columns: ["interpreter_id"]
            isOneToOne: false
            referencedRelation: "interpreter_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      specialisation: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id?: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_or_get_chat_room: {
        Args: { other_user_id: string }
        Returns: string
      }
      get_other_participant: { Args: { p_room: string }; Returns: string }
      get_requests_with_overlaps: {
        Args: { p_interpreter_id: string }
        Returns: {
          appointment_data: Json
          has_overlap: boolean
          note: string
          overlapping_appointments: Json[]
          profile_data: Json
          request_id: number
        }[]
      }
      get_user_chats: {
        Args: { p_user_id: string }
        Returns: {
          profile_data: Json
          room_id: string
        }[]
      }
      is_member_of_room: {
        Args: { _room_id: string; _user_id: string }
        Returns: boolean
      }
      is_room_member: { Args: { p_room_id: string }; Returns: boolean }
      old_search_interpreters: {
        Args: {
          p_appointment_end: string
          p_appointment_start: string
          p_day: number
          p_end_time: string
          p_gender: string | null
          p_language: number
          p_max_dob: string
          p_min_dob: string
          p_min_rating: number
          p_spec: number
          p_start_time: string
          p_state: string
        }
        Returns: {
          availability: Json
          languages: Json
          profile_data: Json
          specialisations: Json
        }[]
      }
      search_interpreters: {
        Args: {
          p_appointment_end: string
          p_appointment_start: string
          p_day: number
          p_end_time: string
          p_gender: string | null
          p_language: number
          p_max_dob: string
          p_min_dob: string
          p_min_rating: number
          p_spec: number
          p_start_time: string
          p_state: string
        }
        Returns: {
          profile_data: Json
        }[]
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
