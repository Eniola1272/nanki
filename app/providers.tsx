'use client';

/**
 * App-level providers wrapper.
 * NextAuth SessionProvider has been removed — Supabase Auth handles
 * sessions via cookies and middleware, no client-side provider needed.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}