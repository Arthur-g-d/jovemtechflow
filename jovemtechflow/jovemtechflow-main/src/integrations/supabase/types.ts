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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      courses: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      event_contents: {
        Row: {
          author_id: string | null
          content_text: string | null
          content_type: string | null
          content_url: string | null
          created_at: string | null
          description: string | null
          event_id: string
          id: string
          is_required: boolean
          order_index: number
          title: string
        }
        Insert: {
          author_id?: string | null
          content_text?: string | null
          content_type?: string | null
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          event_id: string
          id?: string
          is_required?: boolean
          order_index?: number
          title: string
        }
        Update: {
          author_id?: string | null
          content_text?: string | null
          content_type?: string | null
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          event_id?: string
          id?: string
          is_required?: boolean
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_contents_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_progressions: {
        Row: {
          content_id: string
          event_id: string
          id: string
          progress_num: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content_id: string
          event_id: string
          id?: string
          progress_num?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content_id?: string
          event_id?: string
          id?: string
          progress_num?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_progressions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "event_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_progressions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          event_id: string
          id: string
          registered_at: string
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          event_date: string
          event_time: string
          id: string
          max_attendees: number | null
          tags: string[] | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date: string
          event_time: string
          id?: string
          max_attendees?: number | null
          tags?: string[] | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string
          event_time?: string
          id?: string
          max_attendees?: number | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      forum_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          created_at: string
          id: string
          solved: boolean | null
          title: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          id?: string
          solved?: boolean | null
          title: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          id?: string
          solved?: boolean | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_tracks: {
        Row: {
          course_id: string
          id: string
          progress_percent: number | null
          status: string | null
          title: string
        }
        Insert: {
          course_id: string
          id?: string
          progress_percent?: number | null
          status?: string | null
          title: string
        }
        Update: {
          course_id?: string
          id?: string
          progress_percent?: number | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_tracks_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      project_contents: {
        Row: {
          author_id: string | null
          content_text: string | null
          content_type: string
          content_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_required: boolean
          module_id: string | null
          order_index: number
          project_id: string
          title: string
        }
        Insert: {
          author_id?: string | null
          content_text?: string | null
          content_type?: string
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_required?: boolean
          module_id?: string | null
          order_index?: number
          project_id: string
          title: string
        }
        Update: {
          author_id?: string | null
          content_text?: string | null
          content_type?: string
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_required?: boolean
          module_id?: string | null
          order_index?: number
          project_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_contents_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "project_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_contents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_enrollments: {
        Row: {
          enrolled_at: string
          enrolled_by_admin: boolean | null
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          enrolled_at?: string
          enrolled_by_admin?: boolean | null
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          enrolled_at?: string
          enrolled_by_admin?: boolean | null
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_enrollments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          id: string
          joined_at: string
          project_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          project_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_modules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_required: boolean
          order_index: number
          project_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean
          order_index?: number
          project_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean
          order_index?: number
          project_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_modules_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_progressions: {
        Row: {
          content_id: string
          id: string
          module_id: string | null
          progress_num: number
          project_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content_id: string
          id?: string
          module_id?: string | null
          progress_num?: number
          project_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content_id?: string
          id?: string
          module_id?: string | null
          progress_num?: number
          project_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_progressions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "project_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_progressions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "project_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_progressions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          author_id: string | null
          created_at: string
          description: string | null
          enrollment_status: string | null
          id: string
          image_url: string | null
          max_enrollments: number | null
          tags: string[] | null
          title: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          description?: string | null
          enrollment_status?: string | null
          id?: string
          image_url?: string | null
          max_enrollments?: number | null
          tags?: string[] | null
          title: string
        }
        Update: {
          author_id?: string | null
          created_at?: string
          description?: string | null
          enrollment_status?: string | null
          id?: string
          image_url?: string | null
          max_enrollments?: number | null
          tags?: string[] | null
          title?: string
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
      calculate_module_progress: {
        Args: { p_user_id: string; p_module_id: string }
        Returns: number
      }
      calculate_project_progress: {
        Args: { p_user_id: string; p_project_id: string }
        Returns: number
      }
      get_user_by_email: {
        Args: { user_email: string }
        Returns: {
          user_id: string
          username: string
          email: string
        }[]
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
