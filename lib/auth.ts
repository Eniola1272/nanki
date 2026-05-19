import { createClient } from '@/lib/db/supabase-server'
import type { Profile } from '@/types/database'

export interface AuthSession {
  user: {
    id: string
    email: string
    name: string
    image: string | null
    isPremium: boolean
  }
}

/**
 * Get the current authenticated user session.
 * Returns null if not authenticated.
 * Use this in Server Components, Route Handlers, and Server Actions.
 */
export async function auth(): Promise<AuthSession | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Fetch the profile for app-specific data (isPremium, etc.)
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  const profile = data as Profile | null

  return {
    user: {
      id: user.id,
      email: user.email ?? '',
      name: profile?.name ?? user.user_metadata?.full_name ?? 'User',
      image: profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
      isPremium: profile?.is_premium ?? false,
    },
  }
}
