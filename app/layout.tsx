import type { Metadata } from 'next';
import { Providers } from './providers';
import { Toaster } from "@/components/ui/sonner";
import './globals.css';

export const metadata: Metadata = {
  title: 'Nanki - Master Your Memory',
  description: 'Brain-first learning designed for the flow state.',
  icons: {
    icon: [
      { url: '/images/logo-icon.png' },
      { url: '/images/logo-icon.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/images/logo-icon.png',
    apple: '/images/logo-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/logo-icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/logo-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body>
        <Providers>
          <main className="min-h-screen bg-surface">
            {children}
          </main>
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}