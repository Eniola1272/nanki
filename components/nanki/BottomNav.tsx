'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useNankiStore } from '@/lib/nanki-store';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
  { id: 'discover', label: 'Discover', icon: 'explore', href: '/discover' },
  { id: 'create', label: 'Create', icon: 'add_circle', href: null },
  { id: 'profile', label: 'Profile', icon: 'person', href: '/profile' },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, setShowCreatorSelector } = useNankiStore();

  const handleNav = (item: typeof navItems[0]) => {
    if (item.href === null) {
      setShowCreatorSelector(true);
    } else {
      router.push(item.href);
    }
  };

  const isActive = (item: typeof navItems[0]) => {
    if (!item.href) return false;
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-surface-container-lowest border-t border-outline-variant pb-safe shadow-lg">
        <div className="flex justify-around items-center py-2 h-16">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item)}
                className={`flex flex-col items-center justify-center w-20 py-1 rounded-xl transition-all active:scale-95 cursor-pointer ${
                  active ? 'text-primary font-bold' : 'text-secondary hover:text-on-surface'
                }`}
              >
                <span className={`material-symbols-outlined mb-0.5 text-[24px] ${active ? 'fill' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-[11px] tracking-wide font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop side rail */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-24 xl:w-64 border-r border-outline-variant bg-surface-container-lowest pt-20 z-30">
        <div className="flex-1 px-4 py-8 flex flex-col gap-2">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all cursor-pointer text-left ${
                  active ? 'text-primary bg-primary/10 font-bold' : 'text-secondary hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <span className={`material-symbols-outlined text-[24px] ${active ? 'fill' : ''}`}>
                  {item.icon}
                </span>
                <span className="hidden xl:block font-label-md text-sm tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-outline-variant">
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center gap-3 w-full hover:bg-surface-container-low p-2 rounded-xl transition-colors text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant flex-shrink-0">
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="hidden xl:block overflow-hidden truncate">
              <p className="font-label-md text-sm text-on-surface truncate">{profile.name}</p>
              <p className="font-caption text-xs text-secondary truncate">{profile.streak} Day Streak 🔥</p>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
