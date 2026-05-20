'use client';

import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background text-on-background">
      {/* Ambient background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-15 select-none z-0">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full border border-primary/20"></div>
        <div className="absolute top-[20%] left-[18%] w-32 h-32 rounded-full border border-tertiary-container/30"></div>
        <div className="absolute bottom-[10%] right-[5%] w-96 h-96 rounded-full border border-primary/15"></div>
        <div className="absolute top-[50%] right-[15%] w-48 h-48 rounded-full border border-tertiary-container/20"></div>
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <line className="text-outline-variant/30" stroke="currentColor" strokeWidth="1" x1="10%" y1="20%" x2="40%" y2="50%" />
          <line className="text-outline-variant/30" stroke="currentColor" strokeWidth="1" x1="80%" y1="60%" x2="60%" y2="80%" />
        </svg>
      </div>

      <main className="relative z-10 w-full max-w-[800px] px-6 flex flex-col items-center justify-center text-center">
        <header className="mb-12 cursor-pointer" onClick={() => router.push('/dashboard')}>
          <h1 className="font-headline-lg-mobile text-3xl font-bold text-primary flex items-center justify-center gap-2">
            <span className="material-symbols-outlined fill text-tertiary-container text-[36px] md:text-[44px]">psychology</span>
            Nanki
          </h1>
        </header>

        <section className="space-y-6 w-full flex flex-col items-center">
          <div className="space-y-3">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-on-surface">
              Master your memory.
            </h2>
            <p className="font-body-lg text-sm md:text-lg text-on-surface-variant max-w-xl mx-auto leading-relaxed">
              Brain-first learning designed for the flow state. Unlock your potential with structured, science-backed study routines.
            </p>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="bg-primary text-on-primary font-bold text-base md:text-lg px-8 py-3.5 rounded-full hover:bg-primary-container active:scale-95 transition-all shadow-[0px_4px_20px_rgba(0,0,0,0.06)] flex items-center gap-2 cursor-pointer mt-4 group"
          >
            <span>Start Learning</span>
            <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </section>

        <section className="mt-16 pt-8 border-t border-outline-variant/40 w-full max-w-[500px] flex flex-col items-center gap-3">
          <div className="flex -space-x-3">
            {[
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
              'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
            ].map((src, i) => (
              <img key={i} alt={`Student ${i + 1}`} className="w-10 h-10 rounded-full border-2 border-surface-bright object-cover" src={src} />
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-surface-bright bg-surface-container-high flex items-center justify-center font-bold text-xs text-on-surface-variant">+9k</div>
          </div>
          <p className="font-label-md text-xs text-on-surface-variant">Joined by 10,000+ students worldwide</p>
        </section>
      </main>
    </div>
  );
}
