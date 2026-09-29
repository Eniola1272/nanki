import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Creates a Supabase client for use in Client Components.
 * Uses the anon key — RLS policies control data access.
 */
export function createClient() {
  // SSR 0.6 exposes the older SupabaseClient generic signature. Normalize the
  // return type at this boundary so database operations keep their schema types.
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ) as unknown as SupabaseClient<Database>
}
