import { createClient } from '@/lib/db/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Profile } from '@/types/database';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/signin?callbackUrl=/admin');

  const { data } = await supabase
    .from('profiles')
    .select('is_admin, name, avatar_url')
    .eq('id', user.id)
    .single();
  const profile = data as Pick<Profile, 'is_admin' | 'name' | 'avatar_url'> | null;

  if (!profile?.is_admin) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Admin top bar */}
      <header className="border-b border-outline-variant/40 bg-surface-container-lowest px-4 sm:px-6">
        <div className="max-w-6xl mx-auto h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5">
              <span className="material-symbols-outlined fill text-tertiary-container text-[22px]">psychology</span>
              <span className="font-extrabold text-primary text-base">Nanki</span>
            </Link>
            <span className="text-outline-variant">/</span>
            <span className="text-sm font-semibold text-on-surface-variant">Admin</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-on-surface-variant">
            <Link href="/admin/blog" className="hover:text-primary transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">article</span>
              Blog posts
            </Link>
            <Link href="/blog" target="_blank" className="hover:text-primary transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              View blog
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {profile?.avatar_url && (
              <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border border-outline-variant/50" />
            )}
            <span className="text-sm font-semibold text-on-surface hidden sm:block">{profile?.name ?? 'Admin'}</span>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="md:hidden border-b border-outline-variant/40 bg-surface-container-low px-4 py-2 flex gap-4 text-sm font-semibold text-on-surface-variant">
        <Link href="/admin/blog" className="hover:text-primary transition-colors flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">article</span>
          Blog posts
        </Link>
        <Link href="/blog" target="_blank" className="hover:text-primary transition-colors flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          View blog
        </Link>
      </div>

      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
