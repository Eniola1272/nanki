/**
 * Supabase Auth type augmentations.
 *
 * The app uses Supabase Auth (not NextAuth). Session/user types
 * are defined in lib/auth.ts via the AuthSession interface.
 * This file is kept for reference but no longer augments next-auth.
 */

export interface AppUser {
  id: string
  email: string
  name: string
  image: string | null
  isPremium: boolean
}

export interface AppSession {
  user: AppUser
}