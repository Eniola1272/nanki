'use client';

import { ReviewProvider } from '@/lib/review/provider';
import { NankiProvider } from '@/lib/nanki-store';

export function Providers({ children }: { children: React.ReactNode }) {
  return <NankiProvider><ReviewProvider>{children}</ReviewProvider></NankiProvider>;
}
