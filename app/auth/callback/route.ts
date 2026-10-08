import { safeAuthRedirect } from '@/lib/auth/redirect'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/db/supabase-server'
import { sendNewUserSignupNotification } from '@/lib/email/resend'

/**
 * Auth callback handler — exchanges the OAuth code for a Supabase session.
 * After Google OAuth, Supabase redirects here with a `code` parameter.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeAuthRedirect(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // If user was created within the last 60 seconds, it's a new signup
      if (data?.user?.created_at) {
        const createdAt = new Date(data.user.created_at).getTime()
        const isBrandNew = Date.now() - createdAt < 60000
        if (isBrandNew && data.user.email) {
          sendNewUserSignupNotification({
            email: data.user.email,
            name:
              data.user.user_metadata?.full_name ||
              data.user.user_metadata?.name ||
              null,
            userId: data.user.id,
            authMethod: data.user.app_metadata?.provider || 'google',
            createdAt: data.user.created_at,
          }).catch(err => console.error('[OAuth Signup Notification Error]', err))
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If there's an error or no code, redirect to signin with error
  return NextResponse.redirect(`${origin}/auth/signin?error=AuthError`)
}
