/**
 * Database types matching the Supabase table schemas.
 *
 * Table naming follows Supabase/PostgreSQL convention (snake_case).
 * These types can later be auto-generated with:
 *   npx supabase gen types typescript --project-id <your-project-id> > types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      card_reviews: {
        Row: { id: string; user_id: string; deck_id: string; card_id: string; rating: string; reviewed_at: string; study_day: string };
        Insert: { id: string; user_id: string; deck_id: string; card_id: string; rating: string; reviewed_at: string; study_day: string };
        Update: never;
        Relationships: [];
      };
      review_preferences: {
        Row: { user_id: string; new_cards: number; reviews: number };
        Insert: { user_id: string; new_cards: number; reviews: number };
        Update: { new_cards?: number; reviews?: number };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string
          email: string | null
          name: string | null
          avatar_url: string | null
          is_premium: boolean
          is_admin: boolean
          stripe_customer_id: string | null
          plan: 'FREE' | 'PRO' | 'SCHOLAR'
          subscription_status: 'INACTIVE' | 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED'
          trial_ends_at: string | null
          has_used_trial: boolean
          subscription_ends_at: string | null
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          billing_cycle: 'monthly' | 'annual' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          name?: string | null
          avatar_url?: string | null
          is_premium?: boolean
          is_admin?: boolean
          stripe_customer_id?: string | null
          plan?: 'FREE' | 'PRO' | 'SCHOLAR'
          subscription_status?: 'INACTIVE' | 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED'
          trial_ends_at?: string | null
          has_used_trial?: boolean
          subscription_ends_at?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          billing_cycle?: 'monthly' | 'annual' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          avatar_url?: string | null
          is_premium?: boolean
          is_admin?: boolean
          stripe_customer_id?: string | null
          plan?: 'FREE' | 'PRO' | 'SCHOLAR'
          subscription_status?: 'INACTIVE' | 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED'
          trial_ends_at?: string | null
          has_used_trial?: boolean
          subscription_ends_at?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          billing_cycle?: 'monthly' | 'annual' | null
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string
          cover_image: string | null
          author_id: string | null
          published: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content?: string
          cover_image?: string | null
          author_id?: string | null
          published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          cover_image?: string | null
          author_id?: string | null
          published?: boolean
          published_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          owner_id: string
          is_premium: boolean
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          owner_id: string
          is_premium?: boolean
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          owner_id?: string
          is_premium?: boolean
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          role: 'ADMIN' | 'MEMBER' | 'VIEWER'
          joined_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id: string
          role?: 'ADMIN' | 'MEMBER' | 'VIEWER'
          joined_at?: string
        }
        Update: {
          user_id?: string
          organization_id?: string
          role?: 'ADMIN' | 'MEMBER' | 'VIEWER'
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          id: string
          title: string
          description: string | null
          content: Json
          category: string | null
          mastered_percentage: number | null
          time_limit: number | null
          published: boolean
          shareable_slug: string | null
          user_id: string | null
          organization_id: string | null
          max_attempts: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          content: Json
          category?: string | null
          mastered_percentage?: number | null
          time_limit?: number | null
          published?: boolean
          shareable_slug?: string | null
          user_id?: string | null
          organization_id?: string | null
          max_attempts?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          content?: Json
          category?: string | null
          mastered_percentage?: number | null
          time_limit?: number | null
          published?: boolean
          shareable_slug?: string | null
          user_id?: string | null
          organization_id?: string | null
          max_attempts?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      decks: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string | null
          content: Json
          user_id: string | null
          organization_id: string | null
          published: boolean
          shareable_slug: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category?: string | null
          content?: Json
          user_id?: string | null
          organization_id?: string | null
          published?: boolean
          shareable_slug?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          category?: string | null
          content?: Json
          user_id?: string | null
          organization_id?: string | null
          published?: boolean
          shareable_slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      flashcard_sessions: {
        Row: { id: string; user_id: string; deck_id: string; deck_snapshot: Json; cards_reviewed: number; completed_at: string; study_day: string }
        Insert: { id: string; user_id: string; deck_id: string; deck_snapshot: Json; cards_reviewed: number; completed_at: string; study_day: string }
        Update: { [_ in never]: never }
        Relationships: []
      }
      content_likes: {
        Row: { id: string; user_id: string; quiz_id: string | null; deck_id: string | null; created_at: string }
        Insert: { id?: string; user_id: string; quiz_id?: string | null; deck_id?: string | null }
        Update: { [_ in never]: never }
        Relationships: []
      }
      content_reports: {
        Row: {
          id: string
          user_id: string
          quiz_id: string | null
          deck_id: string | null
          reason: 'inaccurate' | 'inappropriate' | 'spam' | 'copyright' | 'other'
          details: string | null
          status: 'pending' | 'reviewed' | 'dismissed' | 'actioned'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          quiz_id?: string | null
          deck_id?: string | null
          reason: 'inaccurate' | 'inappropriate' | 'spam' | 'copyright' | 'other'
          details?: string | null
          status?: 'pending' | 'reviewed' | 'dismissed' | 'actioned'
          created_at?: string
        }
        Update: {
          status?: 'pending' | 'reviewed' | 'dismissed' | 'actioned'
        }
        Relationships: []
      }
      organization_invites: {
        Row: {
          id: string
          organization_id: string
          email: string
          role: 'ADMIN' | 'MEMBER' | 'VIEWER'
          invited_by: string
          token: string
          status: 'pending' | 'accepted' | 'revoked'
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          email: string
          role?: 'ADMIN' | 'MEMBER' | 'VIEWER'
          invited_by: string
          token: string
          status?: 'pending' | 'accepted' | 'revoked'
          created_at?: string
          expires_at?: string
        }
        Update: {
          status?: 'pending' | 'accepted' | 'revoked'
          role?: 'ADMIN' | 'MEMBER' | 'VIEWER'
        }
        Relationships: []
      }
      organization_activities: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          action: 'created_quiz' | 'created_deck' | 'completed_quiz' | 'reviewed_cards' | 'joined_workspace' | 'invited_member'
          target_title: string
          target_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          action: 'created_quiz' | 'created_deck' | 'completed_quiz' | 'reviewed_cards' | 'joined_workspace' | 'invited_member'
          target_title: string
          target_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          target_title?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          id: string
          quiz_id: string
          user_id: string
          score: number | null
          max_score: number | null
          answers: Json | null
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          quiz_id: string
          user_id: string
          score?: number | null
          max_score?: number | null
          answers?: Json | null
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          score?: number | null
          max_score?: number | null
          answers?: Json | null
          completed_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_user_trial: {
        Args: { trial_days?: number }
        Returns: Json
      }
      save_mistake_flashcards: { Args: { p_deck_id: string; p_title: string; p_category: string; p_cards: Json }; Returns: Json };
      content_like_stats: {
        Args: Record<string, never>
        Returns: { kind: string; content_id: string; like_count: number; liked_by_me: boolean }[]
      }
      get_creator_profile: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_creator_stats: {
        Args: { p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      membership_role: 'ADMIN' | 'MEMBER' | 'VIEWER'
    }
  }
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row']
export type BlogPost = Database['public']['Tables']['blog_posts']['Row']
export type Organization = Database['public']['Tables']['organizations']['Row']
export type Membership = Database['public']['Tables']['memberships']['Row']
export type DbQuiz = Database['public']['Tables']['quizzes']['Row']
export type QuizAttempt = Database['public']['Tables']['quiz_attempts']['Row']
export type OrganizationInvite = Database['public']['Tables']['organization_invites']['Row']
export type OrganizationActivity = Database['public']['Tables']['organization_activities']['Row']
