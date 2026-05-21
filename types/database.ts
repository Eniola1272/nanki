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
      profiles: {
        Row: {
          id: string
          email: string | null
          name: string | null
          avatar_url: string | null
          is_premium: boolean
          is_admin: boolean
          stripe_customer_id: string | null
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
          owner_id: string
          is_premium?: boolean
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
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
          published?: boolean
          shareable_slug?: string | null
          updated_at?: string
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
      [_ in never]: never
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
