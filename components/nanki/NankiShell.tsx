'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import BottomNav from './BottomNav';
import { useNankiStore } from '@/lib/nanki-store';

interface NankiShellProps {
  children: React.ReactNode;
}

export default function NankiShell({ children }: NankiShellProps) {
  const pathname = usePathname();
  const { setShowCreatorSelector } = useNankiStore();
  const isProfile = pathname.startsWith('/profile');

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface flex flex-col antialiased">
      <Header hideAvatar={isProfile} />

      <div className="flex-grow flex flex-col pt-14 pb-24 md:pb-6 md:ml-24 xl:ml-64">
        {children}
      </div>

      <BottomNav />

      {/* FAB */}
      <button
        onClick={() => setShowCreatorSelector(true)}
        className="fixed bottom-20 md:bottom-8 right-6 w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary-container hover:shadow-2xl active:scale-95 transition-all z-40 cursor-pointer"
        title="Create item"
      >
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>
    </div>
  );
}
