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
  public: {
    Tables: {
      appointment_availability: {
        Row: {
          counselor_id: string
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          start_time: string
        }
        Insert: {
          counselor_id: string
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          start_time: string
        }
        Update: {
          counselor_id?: string
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_availability_counselor_id_fkey"
            columns: ["counselor_id"]
            isOneToOne: false
            referencedRelation: "counselor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          cancellation_reason: string | null
          counselor_id: string
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          notes: string | null
          status: Database["public"]["Enums"]["appointment_status"] | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          cancellation_reason?: string | null
          counselor_id: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          notes?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          cancellation_reason?: string | null
          counselor_id?: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          notes?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_counselor_id_fkey"
            columns: ["counselor_id"]
            isOneToOne: false
            referencedRelation: "counselor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_logs: {
        Row: {
          conversation_id: string
          created_at: string | null
          crisis_flag: boolean | null
          has_consent: boolean
          id: string
          message: string
          role: string
          user_id: string
        }
        Insert: {
          conversation_id?: string
          created_at?: string | null
          crisis_flag?: boolean | null
          has_consent?: boolean
          id?: string
          message: string
          role: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          crisis_flag?: boolean | null
          has_consent?: boolean
          id?: string
          message?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      counselor_profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          experience_years: number | null
          id: string
          is_available: boolean | null
          languages: string[] | null
          qualification: string | null
          specialization: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          experience_years?: number | null
          id?: string
          is_available?: boolean | null
          languages?: string[] | null
          qualification?: string | null
          specialization?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          experience_years?: number | null
          id?: string
          is_available?: boolean | null
          languages?: string[] | null
          qualification?: string | null
          specialization?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      crisis_alerts: {
        Row: {
          alert_message: string
          assessment_id: string | null
          created_at: string | null
          id: string
          is_resolved: boolean | null
          notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: Database["public"]["Enums"]["crisis_severity"]
          user_id: string
        }
        Insert: {
          alert_message: string
          assessment_id?: string | null
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: Database["public"]["Enums"]["crisis_severity"]
          user_id: string
        }
        Update: {
          alert_message?: string
          assessment_id?: string | null
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["crisis_severity"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crisis_alerts_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "psychological_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_quests: {
        Row: {
          all_complete_bonus: boolean
          created_at: string
          id: string
          quest_date: string
          quests: Json
          user_id: string
        }
        Insert: {
          all_complete_bonus?: boolean
          created_at?: string
          id?: string
          quest_date?: string
          quests?: Json
          user_id: string
        }
        Update: {
          all_complete_bonus?: boolean
          created_at?: string
          id?: string
          quest_date?: string
          quests?: Json
          user_id?: string
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          language: string | null
          name: string
          phone: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          name: string
          phone: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          name?: string
          phone?: string
          type?: string
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          attempts: number | null
          category: string
          created_at: string
          difficulty: string
          id: string
          puzzle_word: string
          solved: boolean | null
          time_taken: number | null
          user_id: string
        }
        Insert: {
          attempts?: number | null
          category: string
          created_at?: string
          difficulty: string
          id?: string
          puzzle_word: string
          solved?: boolean | null
          time_taken?: number | null
          user_id: string
        }
        Update: {
          attempts?: number | null
          category?: string
          created_at?: string
          difficulty?: string
          id?: string
          puzzle_word?: string
          solved?: boolean | null
          time_taken?: number | null
          user_id?: string
        }
        Relationships: []
      }
      mental_health_analytics: {
        Row: {
          counseling_bookings: number | null
          created_at: string | null
          crisis_alerts: number | null
          date: string
          forum_posts: number | null
          gad7_avg_score: number | null
          high_risk_count: number | null
          id: string
          phq9_avg_score: number | null
          resource_views: number | null
          total_assessments: number | null
        }
        Insert: {
          counseling_bookings?: number | null
          created_at?: string | null
          crisis_alerts?: number | null
          date?: string
          forum_posts?: number | null
          gad7_avg_score?: number | null
          high_risk_count?: number | null
          id?: string
          phq9_avg_score?: number | null
          resource_views?: number | null
          total_assessments?: number | null
        }
        Update: {
          counseling_bookings?: number | null
          created_at?: string | null
          crisis_alerts?: number | null
          date?: string
          forum_posts?: number | null
          gad7_avg_score?: number | null
          high_risk_count?: number | null
          id?: string
          phq9_avg_score?: number | null
          resource_views?: number | null
          total_assessments?: number | null
        }
        Relationships: []
      }
      moderation_logs: {
        Row: {
          action: string
          auto_moderated: boolean | null
          comment_id: string | null
          created_at: string | null
          id: string
          moderator_id: string | null
          post_id: string | null
          reason: string | null
        }
        Insert: {
          action: string
          auto_moderated?: boolean | null
          comment_id?: string | null
          created_at?: string | null
          id?: string
          moderator_id?: string | null
          post_id?: string | null
          reason?: string | null
        }
        Update: {
          action?: string
          auto_moderated?: boolean | null
          comment_id?: string | null
          created_at?: string | null
          id?: string
          moderator_id?: string | null
          post_id?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_logs_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "peer_support_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_logs_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "peer_support_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_logs_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "peer_support_posts_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      peer_support_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          is_flagged: boolean | null
          likes_count: number | null
          post_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_flagged?: boolean | null
          likes_count?: number | null
          post_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_flagged?: boolean | null
          likes_count?: number | null
          post_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "peer_support_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "peer_support_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_support_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "peer_support_posts_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      peer_support_likes: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "peer_support_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "peer_support_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_support_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "peer_support_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_support_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "peer_support_posts_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      peer_support_posts: {
        Row: {
          author_id: string
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          is_flagged: boolean | null
          is_moderated: boolean | null
          likes_count: number | null
          moderated_at: string | null
          moderated_by: string | null
          pseudo_id: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_flagged?: boolean | null
          is_moderated?: boolean | null
          likes_count?: number | null
          moderated_at?: string | null
          moderated_by?: string | null
          pseudo_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_flagged?: boolean | null
          is_moderated?: boolean | null
          likes_count?: number | null
          moderated_at?: string | null
          moderated_by?: string | null
          pseudo_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      player_progress: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          journals_completed: number
          last_active_date: string | null
          level: number
          longest_streak: number
          meditations_completed: number
          moods_completed: number
          puzzles_completed: number
          quests_completed: number
          streak_shields: number
          total_xp_earned: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          journals_completed?: number
          last_active_date?: string | null
          level?: number
          longest_streak?: number
          meditations_completed?: number
          moods_completed?: number
          puzzles_completed?: number
          quests_completed?: number
          streak_shields?: number
          total_xp_earned?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          journals_completed?: number
          last_active_date?: string | null
          level?: number
          longest_streak?: number
          meditations_completed?: number
          moods_completed?: number
          puzzles_completed?: number
          quests_completed?: number
          streak_shields?: number
          total_xp_earned?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          anonymous_mode: boolean | null
          avatar_url: string | null
          bio: string | null
          birthday: string | null
          created_at: string
          department: string | null
          full_name: string | null
          id: string
          language_preference: string | null
          location: string | null
          phone: string | null
          updated_at: string
          user_id: string
          website: string | null
          year: number | null
        }
        Insert: {
          anonymous_mode?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          birthday?: string | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          id?: string
          language_preference?: string | null
          location?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          year?: number | null
        }
        Update: {
          anonymous_mode?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          birthday?: string | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          id?: string
          language_preference?: string | null
          location?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          year?: number | null
        }
        Relationships: []
      }
      psycho_resources: {
        Row: {
          category: string[] | null
          content_type: string
          content_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_featured: boolean | null
          language: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          category?: string[] | null
          content_type: string
          content_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_featured?: boolean | null
          language?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          category?: string[] | null
          content_type?: string
          content_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_featured?: boolean | null
          language?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      psychological_assessments: {
        Row: {
          assessment_type: Database["public"]["Enums"]["assessment_type"]
          counselor_notified: boolean | null
          created_at: string | null
          id: string
          recommendations: string | null
          requires_intervention: boolean | null
          responses: Json
          score: number
          severity: Database["public"]["Enums"]["crisis_severity"]
          user_id: string
        }
        Insert: {
          assessment_type: Database["public"]["Enums"]["assessment_type"]
          counselor_notified?: boolean | null
          created_at?: string | null
          id?: string
          recommendations?: string | null
          requires_intervention?: boolean | null
          responses: Json
          score: number
          severity: Database["public"]["Enums"]["crisis_severity"]
          user_id: string
        }
        Update: {
          assessment_type?: Database["public"]["Enums"]["assessment_type"]
          counselor_notified?: boolean | null
          created_at?: string | null
          id?: string
          recommendations?: string | null
          requires_intervention?: boolean | null
          responses?: Json
          score?: number
          severity?: Database["public"]["Enums"]["crisis_severity"]
          user_id?: string
        }
        Relationships: []
      }
      stress_reports: {
        Row: {
          ai_analysis: string | null
          badges: string[] | null
          coping_tip: string
          created_at: string
          game_session_id: string | null
          id: string
          stress_level: string
          user_id: string
          weekly_score: number
        }
        Insert: {
          ai_analysis?: string | null
          badges?: string[] | null
          coping_tip: string
          created_at?: string
          game_session_id?: string | null
          id?: string
          stress_level: string
          user_id: string
          weekly_score?: number
        }
        Update: {
          ai_analysis?: string | null
          badges?: string[] | null
          coping_tip?: string
          created_at?: string
          game_session_id?: string | null
          id?: string
          stress_level?: string
          user_id?: string
          weekly_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "stress_reports_game_session_id_fkey"
            columns: ["game_session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      student_volunteers: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          moderation_count: number | null
          training_completed: boolean | null
          training_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          moderation_count?: number | null
          training_completed?: boolean | null
          training_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          moderation_count?: number | null
          training_completed?: boolean | null
          training_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_2fa: {
        Row: {
          backup_codes: string[] | null
          created_at: string
          id: string
          is_enabled: boolean
          secret: string
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          secret: string
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          secret?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_description: string
          achievement_icon: string
          achievement_id: string
          achievement_name: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_description: string
          achievement_icon: string
          achievement_id: string
          achievement_name: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_description?: string
          achievement_icon?: string
          achievement_id?: string
          achievement_name?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_game_stats: {
        Row: {
          average_solve_time: number | null
          current_streak: number | null
          id: string
          last_played_date: string | null
          max_streak: number | null
          total_puzzles_solved: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          average_solve_time?: number | null
          current_streak?: number | null
          id?: string
          last_played_date?: string | null
          max_streak?: number | null
          total_puzzles_solved?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          average_solve_time?: number | null
          current_streak?: number | null
          id?: string
          last_played_date?: string | null
          max_streak?: number | null
          total_puzzles_solved?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          amount_paid: number | null
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          payment_id: string | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          payment_id?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          payment_id?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      peer_support_posts_safe: {
        Row: {
          author_id: string | null
          comments_count: number | null
          content: string | null
          created_at: string | null
          id: string | null
          is_anonymous: boolean | null
          is_flagged: boolean | null
          is_moderated: boolean | null
          likes_count: number | null
          pseudo_id: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          author_id?: never
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          is_anonymous?: boolean | null
          is_flagged?: boolean | null
          is_moderated?: boolean | null
          likes_count?: number | null
          pseudo_id?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: never
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string | null
          is_anonymous?: boolean | null
          is_flagged?: boolean | null
          is_moderated?: boolean | null
          likes_count?: number | null
          pseudo_id?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_premium: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "student" | "counselor" | "admin" | "volunteer"
      appointment_status: "pending" | "confirmed" | "completed" | "cancelled"
      assessment_type: "phq9" | "gad7" | "ghq12"
      crisis_severity: "low" | "moderate" | "high" | "critical"
      subscription_plan: "free" | "premium_monthly" | "premium_yearly"
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
      app_role: ["student", "counselor", "admin", "volunteer"],
      appointment_status: ["pending", "confirmed", "completed", "cancelled"],
      assessment_type: ["phq9", "gad7", "ghq12"],
      crisis_severity: ["low", "moderate", "high", "critical"],
      subscription_plan: ["free", "premium_monthly", "premium_yearly"],
    },
  },
} as const
