'use client';

import { useEffect } from 'react';
import { ReviewProvider } from '@/lib/review/provider';
import { NankiProvider } from '@/lib/nanki-store';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Unlocks CSS :active pseudo-classes on iOS Safari and mobile WebKit
    const noop = () => {};
    document.addEventListener('touchstart', noop, { passive: true });
    return () => {
      document.removeEventListener('touchstart', noop);
    };
  }, []);

  return <NankiProvider><ReviewProvider>{children}</ReviewProvider></NankiProvider>;
}
