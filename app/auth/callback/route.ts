import { NextResponse } from 'next/server'
import { createClient } from '@/lib/db/supabase-server'

/**
 * Auth callback handler — exchanges the OAuth code for a Supabase session.
 * After Google OAuth, Supabase redirects here with a `code` parameter.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If there's an error or no code, redirect to signin with error
  return NextResponse.redirect(`${origin}/auth/signin?error=AuthError`)
}
