'use client';

import Brand from '@/components/shared/Brand';
import { useRouter } from 'next/navigation';
import { useNankiStore } from '@/lib/nanki-store';

interface HeaderProps {
  hideAvatar?: boolean;
}

export default function Header({ hideAvatar = false }: HeaderProps) {
  const router = useRouter();
  const { profile, userId, resetAllState, signingOut } = useNankiStore();

  return (
    <header className="fixed top-0 w-full z-40 bg-surface/95 backdrop-blur-md">
      <div className="w-full h-20 flex justify-between items-center gap-3 px-5 md:px-8">
        <div className="flex items-center gap-3 mr-auto">
          {!hideAvatar && (
            <button
              onClick={() => router.push('/profile')}
              className="hidden sm:block w-10 h-10 rounded-full border border-outline-variant overflow-hidden hover:opacity-85 active:scale-95 transition-all cursor-pointer"
              title="View Profile"
            >
              <img src={profile.avatar} alt="Profile Avatar" className="w-full h-full object-cover" />
            </button>
          )}
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1 text-left cursor-pointer">
            <Brand />
          </button>
        </div>

        <button
          onClick={() => router.push('/profile')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container-highest transition-colors cursor-pointer active:scale-95 duration-200"
          title="Streak Details"
        >
          <span className="font-label-md text-primary font-bold">{profile.streak}</span>
          <span className="material-symbols-outlined text-orange-500 fill text-[18px]">local_fire_department</span>
        </button>
        {userId !== 'guest' && <button onClick={() => void resetAllState()} disabled={signingOut} className="text-xs font-bold text-secondary hover:text-primary px-2 py-2 disabled:opacity-50">{signingOut ? 'Logging out…' : 'Log out'}</button>}
      </div>
    </header>
  );
}
