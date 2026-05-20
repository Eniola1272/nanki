'use client';

import { useRouter } from 'next/navigation';
import { useNankiStore } from '@/lib/nanki-store';

interface HeaderProps {
  hideAvatar?: boolean;
}

export default function Header({ hideAvatar = false }: HeaderProps) {
  const router = useRouter();
  const { profile } = useNankiStore();

  return (
    <header className="fixed top-0 w-full z-40 bg-surface-container-lowest border-b border-outline-variant shadow-sm backdrop-blur-md bg-opacity-90">
      <div className="max-w-[800px] mx-auto w-full flex justify-between items-center px-4 py-3">
        <div className="flex items-center gap-3">
          {!hideAvatar && (
            <button
              onClick={() => router.push('/profile')}
              className="w-10 h-10 rounded-full border border-outline-variant overflow-hidden hover:opacity-85 active:scale-95 transition-all cursor-pointer"
              title="View Profile"
            >
              <img src={profile.avatar} alt="Profile Avatar" className="w-full h-full object-cover" />
            </button>
          )}
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1 text-left cursor-pointer">
            <span className="material-symbols-outlined fill text-tertiary-container text-[28px] md:text-[32px]">psychology</span>
            <span className="text-[22px] md:text-[26px] font-extrabold text-primary tracking-tight">Nanki</span>
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
      </div>
    </header>
  );
}
