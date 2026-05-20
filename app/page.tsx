'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ── Nav ──────────────────────────────────────────────────────────────────────

function LandingNav() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined fill text-tertiary-container text-[28px]">psychology</span>
          <span className="text-xl font-extrabold text-primary tracking-tight">Nanki</span>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-on-surface-variant">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth/signin"
            className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signin"
            className="bg-primary text-on-primary text-sm font-bold px-5 py-2.5 rounded-full hover:bg-primary-container transition-all shadow-[0px_4px_20px_rgba(0,0,0,0.1)] flex items-center gap-1.5"
          >
            Get started free
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {/* Mobile: single CTA + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/auth/signin"
            className="bg-primary text-on-primary text-sm font-bold px-4 py-2 rounded-full"
          >
            Get started
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-on-surface-variant"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-outline-variant/40 bg-surface-container-lowest px-4 py-4 flex flex-col gap-4 text-sm font-semibold text-on-surface-variant">
          <a href="#features" onClick={() => setMenuOpen(false)} className="hover:text-primary">Features</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="hover:text-primary">How it works</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)} className="hover:text-primary">Pricing</a>
          <Link href="/auth/signin" className="text-primary">Sign in</Link>
        </div>
      )}
    </nav>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden bg-background pt-20 pb-24 px-4 sm:px-6 flex flex-col items-center text-center">
      {/* Ambient decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-20 select-none">
        <div className="absolute top-[8%] left-[4%] w-72 h-72 rounded-full border border-primary/20" />
        <div className="absolute top-[20%] left-[18%] w-36 h-36 rounded-full border border-tertiary-container/30" />
        <div className="absolute bottom-[8%] right-[4%] w-96 h-96 rounded-full border border-primary/15" />
        <div className="absolute top-[50%] right-[14%] w-52 h-52 rounded-full border border-tertiary-container/20" />
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <line stroke="#00407e" strokeOpacity="0.1" strokeWidth="1" x1="10%" y1="20%" x2="40%" y2="55%" />
          <line stroke="#00407e" strokeOpacity="0.1" strokeWidth="1" x1="80%" y1="60%" x2="60%" y2="82%" />
        </svg>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto animate-fadeIn">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-surface-container border border-outline-variant/60 text-on-surface-variant text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-tertiary-container inline-block" />
          Science-backed &bull; Spaced repetition &bull; Free to start
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-on-surface leading-tight mb-6">
          Stop forgetting.<br />
          <span className="text-primary">Start mastering.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed mb-10">
          Nanki uses <strong className="text-on-surface font-semibold">active recall</strong> and{' '}
          <strong className="text-on-surface font-semibold">spaced repetition</strong> — the most effective study
          methods proven by neuroscience — to help you retain more, study less, and actually ace your exams.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => router.push('/auth/signin')}
            className="bg-primary text-on-primary font-bold text-base px-8 py-3.5 rounded-full hover:bg-primary-container active:scale-95 transition-all shadow-[0px_4px_20px_rgba(0,0,0,0.12)] flex items-center gap-2 group cursor-pointer"
          >
            Start learning free
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
          <a
            href="#how-it-works"
            className="text-on-surface-variant font-semibold text-sm flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            See how it works
            <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
          </a>
        </div>

        {/* Social proof */}
        <div className="mt-14 pt-8 border-t border-outline-variant/40 flex flex-col items-center gap-3">
          <div className="flex -space-x-3">
            {[
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
              'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
            ].map((src, i) => (
              <img
                key={i}
                alt={`Student ${i + 1}`}
                src={src}
                className="w-10 h-10 rounded-full border-2 border-surface-bright object-cover"
              />
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-surface-bright bg-surface-container-high flex items-center justify-center font-bold text-xs text-on-surface-variant">
              +9k
            </div>
          </div>
          <p className="text-xs text-on-surface-variant font-medium">
            Joined by <strong className="text-on-surface">10,000+ students</strong> worldwide
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Stats strip ───────────────────────────────────────────────────────────────

function StatsStrip() {
  const stats = [
    { value: '85%', label: 'average mastery improvement', icon: 'trending_up' },
    { value: '7 days', label: 'average streak maintained', icon: 'local_fire_department' },
    { value: '10,000+', label: 'active learners worldwide', icon: 'people' },
  ];

  return (
    <section className="border-y border-outline-variant/40 bg-surface-container-low py-8 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((s) => (
          <div key={s.value} className="flex flex-col items-center text-center gap-1">
            <span className="material-symbols-outlined fill text-primary text-[28px] mb-1">{s.icon}</span>
            <span className="text-3xl font-extrabold text-on-surface">{s.value}</span>
            <span className="text-sm text-on-surface-variant">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Problem ───────────────────────────────────────────────────────────────────

function ProblemSection() {
  const problems = [
    {
      icon: 'menu_book',
      title: 'Re-reading doesn\'t work.',
      body: 'Highlighting and re-reading create an illusion of learning. You recognise the words — but on exam day, you can\'t recall a thing.',
    },
    {
      icon: 'alarm',
      title: 'Cramming fades fast.',
      body: 'Information stored via cramming disappears within 48 hours. You might pass the test, but a week later? Gone.',
    },
    {
      icon: 'trending_down',
      title: 'Passive notes go nowhere.',
      body: 'Hours spent writing perfect notes that you never test yourself on. Without retrieval practice, knowledge never sticks.',
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/8 px-3 py-1 rounded-full">
            The Problem
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-on-surface">
            Traditional studying is broken.
          </h2>
          <p className="mt-3 text-on-surface-variant max-w-xl mx-auto">
            Most students rely on methods that feel productive but deliver almost nothing. Sound familiar?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((p) => (
            <div
              key={p.title}
              className="bg-surface-container-low border border-outline-variant/50 rounded-3xl p-7 flex flex-col gap-4"
            >
              <span className="material-symbols-outlined text-destructive text-[36px]">{p.icon}</span>
              <h3 className="text-lg font-bold text-on-surface">{p.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Solution ──────────────────────────────────────────────────────────────────

function SolutionSection() {
  const bullets = [
    { icon: 'quiz', text: 'Active recall via quizzes & flashcard flip' },
    { icon: 'schedule', text: 'Spaced repetition scheduling (Again · Hard · Good · Easy)' },
    { icon: 'local_fire_department', text: 'Gamified streaks + XP to keep you consistent' },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 bg-surface-container-low">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-tertiary bg-tertiary/8 px-3 py-1 rounded-full">
            The Nanki Way
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-on-surface">
            Learning that actually works.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="space-y-6">
            <p className="text-on-surface-variant leading-relaxed">
              Nanki is built around two of the most well-researched principles in cognitive science:{' '}
              <strong className="text-on-surface">active recall</strong> forces your brain to retrieve information
              (which strengthens it), and <strong className="text-on-surface">spaced repetition</strong> surfaces
              cards at exactly the right moment — right before you forget them.
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              The result? You study <em>less</em> and remember <em>more</em>. Every session is optimised.
              Every minute counts.
            </p>
            <ul className="space-y-4">
              {bullets.map((b) => (
                <li key={b.text} className="flex items-start gap-3">
                  <span className="material-symbols-outlined fill text-primary text-[22px] mt-0.5 shrink-0">{b.icon}</span>
                  <span className="text-on-surface font-medium">{b.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — flashcard mock */}
          <div className="relative flex flex-col items-center">
            <div className="w-full max-w-sm bg-surface-container-lowest border border-outline-variant/50 rounded-3xl shadow-[0px_8px_32px_rgba(0,0,0,0.08)] overflow-hidden">
              {/* Card header */}
              <div className="bg-primary/6 border-b border-outline-variant/40 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined fill text-primary text-[18px]">style</span>
                  <span className="text-xs font-bold text-primary">Biology 101</span>
                </div>
                <span className="text-xs text-on-surface-variant">Card 3 of 12</span>
              </div>

              {/* Flashcard */}
              <div className="px-6 py-8 text-center min-h-[180px] flex flex-col items-center justify-center gap-3">
                <span className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold">Front</span>
                <p className="text-lg font-bold text-on-surface leading-snug">
                  What is the powerhouse of the cell?
                </p>
                <div className="mt-2 px-3 py-1 bg-surface-container rounded-full text-xs text-on-surface-variant border border-outline-variant/40">
                  Tap to reveal answer
                </div>
              </div>

              {/* Spaced repetition buttons */}
              <div className="border-t border-outline-variant/40 px-4 py-3 grid grid-cols-4 gap-2">
                {[
                  { label: 'Again', color: 'text-error', sub: '<1m' },
                  { label: 'Hard', color: 'text-on-surface-variant', sub: '6m' },
                  { label: 'Good', color: 'text-primary', sub: '10m' },
                  { label: 'Easy', color: 'text-tertiary', sub: '4d' },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    className="flex flex-col items-center gap-0.5 bg-surface-container hover:bg-surface-container-high rounded-xl py-2 transition-colors"
                  >
                    <span className={`text-xs font-bold ${btn.color}`}>{btn.label}</span>
                    <span className="text-[10px] text-on-surface-variant">{btn.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Floating streak badge */}
            <div className="absolute -top-3 -right-3 bg-primary text-on-primary rounded-2xl px-3 py-1.5 text-xs font-bold shadow-[0px_4px_12px_rgba(0,0,0,0.15)] flex items-center gap-1">
              <span className="material-symbols-outlined fill text-[14px]">local_fire_department</span>
              7-day streak
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────

function FeaturesSection() {
  const features = [
    {
      icon: 'quiz',
      title: 'Practice Quizzes',
      body: 'Timed multiple-choice questions with instant feedback, progress tracking, and mastery scoring that improves each attempt.',
      color: 'text-primary',
      bg: 'bg-primary/8',
    },
    {
      icon: 'style',
      title: 'Flashcard Decks',
      body: 'Science-backed flip cards with spaced repetition buttons. Nanki decides what to show you and when — so you never over-study.',
      color: 'text-tertiary',
      bg: 'bg-tertiary/8',
    },
    {
      icon: 'local_fire_department',
      title: 'Streaks & XP',
      body: 'Daily streaks, experience points, levels, and badges that reward consistency — because motivation is half the battle.',
      color: 'text-chart-5',
      bg: 'bg-chart-5/10',
    },
    {
      icon: 'travel_explore',
      title: 'Discover & Share',
      body: 'Browse thousands of community-created study sets. Share your own decks and quizzes with a single link.',
      color: 'text-chart-2',
      bg: 'bg-chart-2/10',
    },
    {
      icon: 'bar_chart',
      title: 'Progress Analytics',
      body: 'Track mastery percentage per subject, see your personal best streak, and monitor total quizzes taken over time.',
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
    {
      icon: 'devices',
      title: 'Works Everywhere',
      body: 'Fully responsive across desktop and mobile. Study on the bus, in bed, between classes — Nanki is always with you.',
      color: 'text-primary',
      bg: 'bg-primary/8',
    },
  ];

  return (
    <section id="features" className="py-24 px-4 sm:px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/8 px-3 py-1 rounded-full">
            Everything you need
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-on-surface">
            Two powerful study modes.<br />One platform.
          </h2>
          <p className="mt-3 text-on-surface-variant max-w-xl mx-auto">
            Quizzes for active recall. Flashcards for spaced repetition. Gamification to keep you coming back.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-surface-container-low border border-outline-variant/50 rounded-3xl p-7 flex flex-col gap-4 hover:shadow-[0px_4px_20px_rgba(0,0,0,0.06)] transition-shadow"
            >
              <div className={`w-11 h-11 rounded-2xl ${f.bg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined fill ${f.color} text-[22px]`}>{f.icon}</span>
              </div>
              <h3 className="text-base font-bold text-on-surface">{f.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────

function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      icon: 'add_circle',
      title: 'Create or discover',
      body: 'Sign up free and build your own quiz or flashcard deck in minutes — or browse thousands created by the community.',
    },
    {
      number: '02',
      icon: 'psychology',
      title: 'Study smarter',
      body: 'Nanki schedules exactly what to review and when. No planning needed. Every session is optimised for your brain.',
    },
    {
      number: '03',
      icon: 'emoji_events',
      title: 'Watch your mastery grow',
      body: 'Track streaks, XP, and mastery percentage as concepts lock into long-term memory. See real progress, every day.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 bg-surface-container-low">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/8 px-3 py-1 rounded-full">
            Get started in minutes
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-on-surface">
            From zero to mastery in 3 steps.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.number} className="flex flex-col items-center text-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-[0px_4px_16px_rgba(0,64,126,0.25)]">
                  <span className="material-symbols-outlined fill text-on-primary text-[28px]">{s.icon}</span>
                </div>
                <span className="absolute -top-1 -right-1 bg-surface-container-lowest border border-outline-variant/50 text-primary text-[10px] font-extrabold w-6 h-6 rounded-full flex items-center justify-center">
                  {s.number}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute" />
              )}
              <h3 className="text-lg font-bold text-on-surface">{s.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────

function TestimonialsSection() {
  const testimonials = [
    {
      quote: 'I went from 40% to 92% on my Biology midterm in 3 weeks. The spaced repetition is unreal — I actually remember stuff now.',
      name: 'Maya R.',
      role: 'Pre-Med, Year 2',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    },
    {
      quote: 'I finally stopped re-reading my notes. Nanki quizzes force me to actually think. My grades have never been better.',
      name: 'James T.',
      role: 'History Major',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120',
    },
    {
      quote: 'My streak is 34 days. I\'ve never been this consistent with studying in my life. The streak system is genuinely addictive.',
      name: 'Priya K.',
      role: 'Computer Science, Year 3',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/8 px-3 py-1 rounded-full">
            Loved by students
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-on-surface">
            Real results from real learners.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-surface-container-low border border-outline-variant/50 rounded-3xl p-7 flex flex-col gap-5"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="material-symbols-outlined fill text-chart-5 text-[18px]">star</span>
                ))}
              </div>
              <p className="text-sm text-on-surface leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-outline-variant/40">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-surface-bright"
                />
                <div>
                  <p className="text-sm font-bold text-on-surface">{t.name}</p>
                  <p className="text-xs text-on-surface-variant">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────────────

type BillingCycle = 'monthly' | 'annual';

interface PricingPlan {
  name: string;
  badge?: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  annualTotal?: number;
  description: string;
  cta: string;
  highlight: boolean;
  features: { text: string; included: boolean }[];
}

const PLANS: PricingPlan[] = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Everything you need to get started. Forever free.',
    cta: 'Get started free',
    highlight: false,
    features: [
      { text: 'Up to 10 quizzes', included: true },
      { text: 'Up to 5 flashcard decks', included: true },
      { text: 'Basic progress tracking', included: true },
      { text: 'Streak & XP system', included: true },
      { text: 'Discover & share content', included: true },
      { text: 'Mobile + desktop access', included: true },
      { text: 'Export to PDF / Anki', included: false },
      { text: 'Study reminders', included: false },
      { text: 'Streak protection', included: false },
      { text: 'Advanced analytics', included: false },
      { text: 'Organization workspace', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    name: 'Student Pro',
    badge: 'Most popular',
    monthlyPrice: 7.99,
    annualPrice: 4.99,
    annualTotal: 59.88,
    description: 'Unlimited everything. Built for serious students.',
    cta: 'Start Pro trial',
    highlight: true,
    features: [
      { text: 'Unlimited quizzes', included: true },
      { text: 'Unlimited flashcard decks', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Streak & XP system', included: true },
      { text: 'Discover & share content', included: true },
      { text: 'Mobile + desktop access', included: true },
      { text: 'Export to PDF / Anki', included: true },
      { text: 'Study reminders', included: true },
      { text: 'Streak protection (1×/month)', included: true },
      { text: 'Ad-free experience', included: true },
      { text: 'Organization workspace', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    name: 'Scholar',
    monthlyPrice: 14.99,
    annualPrice: 9.99,
    annualTotal: 119.88,
    description: 'Team workspaces for study groups and classrooms.',
    cta: 'Start Scholar trial',
    highlight: false,
    features: [
      { text: 'Unlimited quizzes', included: true },
      { text: 'Unlimited flashcard decks', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Streak & XP system', included: true },
      { text: 'Discover & share content', included: true },
      { text: 'Mobile + desktop access', included: true },
      { text: 'Export to PDF / Anki', included: true },
      { text: 'Study reminders', included: true },
      { text: 'Streak protection (unlimited)', included: true },
      { text: 'Organization (up to 10 members)', included: true },
      { text: 'Bulk CSV import/export', included: true },
      { text: 'Priority support', included: true },
    ],
  },
];

function PricingSection() {
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const router = useRouter();

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 bg-surface-container-low">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/8 px-3 py-1 rounded-full">
            Simple, transparent pricing
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-on-surface">
            Invest in your memory.
          </h2>
          <p className="mt-3 text-on-surface-variant">
            Start free. Upgrade when you&rsquo;re ready.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <button
            onClick={() => setBilling('monthly')}
            className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-all ${billing === 'monthly' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('annual')}
            className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-all flex items-center gap-2 ${billing === 'annual' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Annual
            <span className="text-[10px] font-bold bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-full">
              Save 37%
            </span>
          </button>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => {
            const price = billing === 'annual' ? plan.annualPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-7 flex flex-col gap-6 transition-shadow ${
                  plan.highlight
                    ? 'bg-primary text-on-primary shadow-[0px_8px_40px_rgba(0,64,126,0.3)] scale-[1.02]'
                    : 'bg-surface-container-lowest border border-outline-variant/50 hover:shadow-[0px_4px_20px_rgba(0,0,0,0.07)]'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-tertiary-container text-on-tertiary-container text-[11px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Header */}
                <div>
                  <p className={`text-sm font-bold mb-2 ${plan.highlight ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1 mb-1">
                    {price === 0 ? (
                      <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-on-primary' : 'text-on-surface'}`}>
                        Free
                      </span>
                    ) : (
                      <>
                        <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-on-primary' : 'text-on-surface'}`}>
                          ${price}
                        </span>
                        <span className={`text-sm mb-1 ${plan.highlight ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>
                          /mo
                        </span>
                      </>
                    )}
                  </div>
                  {billing === 'annual' && plan.annualTotal && (
                    <p className={`text-xs ${plan.highlight ? 'text-on-primary/60' : 'text-on-surface-variant'}`}>
                      Billed ${plan.annualTotal}/year
                    </p>
                  )}
                  <p className={`text-sm mt-3 leading-relaxed ${plan.highlight ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>
                    {plan.description}
                  </p>
                </div>

                {/* CTA */}
                <button
                  onClick={() => router.push('/auth/signin')}
                  className={`w-full py-3 rounded-full font-bold text-sm transition-all active:scale-95 cursor-pointer ${
                    plan.highlight
                      ? 'bg-on-primary text-primary hover:bg-primary-fixed'
                      : 'bg-primary text-on-primary hover:bg-primary-container'
                  }`}
                >
                  {plan.cta}
                </button>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-2.5">
                      <span
                        className={`material-symbols-outlined fill text-[18px] mt-0.5 shrink-0 ${
                          f.included
                            ? plan.highlight ? 'text-on-primary' : 'text-primary'
                            : plan.highlight ? 'text-on-primary/30' : 'text-outline'
                        }`}
                      >
                        {f.included ? 'check_circle' : 'cancel'}
                      </span>
                      <span
                        className={`text-sm ${
                          f.included
                            ? plan.highlight ? 'text-on-primary' : 'text-on-surface'
                            : plan.highlight ? 'text-on-primary/40' : 'text-on-surface-variant/50'
                        }`}
                      >
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-on-surface-variant mt-8">
          No credit card required for the free plan. Cancel anytime. All prices in USD.
        </p>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Is Nanki really free?',
      a: 'Yes. The free plan is free forever with no credit card required. You get 10 quizzes, 5 flashcard decks, full streak tracking, and access to the discovery library — with no time limit.',
    },
    {
      q: 'How is this different from Anki or Quizlet?',
      a: 'Nanki combines quiz-based active recall and spaced repetition flashcards in one modern, gamified interface designed for flow state learning. Unlike Anki, there\'s no setup friction. Unlike Quizlet, the study algorithm actually adapts to you.',
    },
    {
      q: 'Can I import my existing flashcards?',
      a: 'Pro and Scholar plans support bulk CSV import, making it easy to migrate from Anki, Quizlet, or your own spreadsheets. Free users can create cards manually — it only takes a few minutes.',
    },
    {
      q: 'What subjects does Nanki support?',
      a: 'Everything: Biology, History, Physics, Computer Science, Languages, Math, Art, and more. If you can write it down, you can study it on Nanki. There\'s no subject limit.',
    },
    {
      q: 'Can I use Nanki on mobile?',
      a: 'Absolutely. Nanki is fully responsive and works beautifully on any device — phone, tablet, or desktop. Study on the bus, between classes, or wherever works best for you.',
    },
    {
      q: 'What is streak protection?',
      a: 'Streak protection lets you miss a day without losing your streak — like a pass. Pro members get one per month. Scholar members get unlimited. It\'s there for the days life gets busy.',
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 bg-background">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/8 px-3 py-1 rounded-full">
            Questions
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-on-surface">
            Frequently asked.
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-outline-variant/50 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left gap-4 hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <span className="font-semibold text-on-surface text-sm">{faq.q}</span>
                <span className={`material-symbols-outlined text-on-surface-variant text-[20px] shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}>
                  keyboard_arrow_down
                </span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5 text-sm text-on-surface-variant leading-relaxed border-t border-outline-variant/30 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────────────

function FinalCTASection() {
  const router = useRouter();

  return (
    <section className="py-28 px-4 sm:px-6 bg-primary relative overflow-hidden">
      {/* Decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 rounded-full border border-on-primary/30" />
        <div className="absolute bottom-[-15%] right-[-5%] w-72 h-72 rounded-full border border-on-primary/20" />
      </div>

      <div className="relative max-w-2xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-on-primary mb-4 leading-tight">
          Your memory is your superpower.
        </h2>
        <p className="text-on-primary/75 text-base sm:text-lg mb-10 leading-relaxed">
          Join 10,000+ students already learning smarter. No credit card required. Free to start today.
        </p>
        <button
          onClick={() => router.push('/auth/signin')}
          className="bg-on-primary text-primary font-extrabold text-base px-10 py-4 rounded-full hover:bg-primary-fixed active:scale-95 transition-all shadow-[0px_4px_24px_rgba(0,0,0,0.2)] flex items-center gap-2 mx-auto cursor-pointer group"
        >
          Start learning free
          <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/40 px-4 sm:px-6 py-12">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined fill text-tertiary-container text-[24px]">psychology</span>
            <span className="text-lg font-extrabold text-primary">Nanki</span>
          </div>
          <p className="text-xs text-on-surface-variant max-w-[200px] text-center md:text-left">
            Brain-first learning designed for the flow state.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-3 text-sm text-on-surface-variant">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
          <Link href="/auth/signin" className="hover:text-primary transition-colors">Sign in</Link>
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-outline-variant/30 text-center text-xs text-on-surface-variant">
        &copy; {new Date().getFullYear()} Nanki. All rights reserved.
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <LandingNav />
      <HeroSection />
      <StatsStrip />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
