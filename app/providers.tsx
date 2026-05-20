'use client';

import { NankiProvider } from '@/lib/nanki-store';

export function Providers({ children }: { children: React.ReactNode }) {
  return <NankiProvider>{children}</NankiProvider>;
}
