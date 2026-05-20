'use client';

import { useState } from 'react';
import NankiShell from '@/components/nanki/NankiShell';
import { useNankiStore } from '@/lib/nanki-store';

export default function ProfilePage() {
  const { profile, quizzes, decks, handleDeleteQuiz, handleDeleteDeck, triggerToast } = useNankiStore();
  const [profileTab, setProfileTab] = useState<'quizzes' | 'decks'>('quizzes');

  return (
    <NankiShell>
      <main className="w-full max-w-[800px] mx-auto px-4 py-8 space-y-8 animate-fadeIn">

        {/* Profile header */}
        <section className="flex flex-col items-center text-center space-y-4 py-4">
          <div className="relative">
            <img alt="Profile Large" className="w-24 h-24 rounded-full object-cover border-4 border-surface-container-lowest shadow-md select-none" src={profile.avatar} />
            <button
              onClick={() => triggerToast('Profile avatar customization is disabled in demo mode.')}
              className="absolute bottom-0 right-0 bg-primary text-on-primary rounded-full p-2 shadow hover:bg-primary-container transition-transform cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-on-surface">{profile.name}</h1>
            <p className="text-xs md:text-sm text-on-surface-variant max-w-sm mt-1">{profile.bio}</p>
          </div>
          <div className="flex gap-2">
            <span className="bg-surface-container-highest text-on-surface-variant font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider">Level {profile.level}</span>
            <span className="bg-tertiary/10 text-tertiary font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider">Top 5% Learner</span>
          </div>
        </section>

        {/* Stats bento */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="col-span-2 md:col-span-1 bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex flex-col justify-between items-start shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1.5 text-primary mb-4 font-bold text-xs uppercase tracking-wide">
              <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
              <span>Mastery Level</span>
            </div>
            <div className="w-full">
              <div className="flex justify-between items-end mb-1">
                <span className="text-2xl font-extrabold text-on-surface leading-none">{profile.xpProgress}%</span>
                <span className="text-[11px] text-tertiary font-bold">+2% this week</span>
              </div>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-tertiary h-full rounded-full transition-all duration-300" style={{ width: `${profile.xpProgress}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-center gap-1.5 text-secondary font-bold text-xs uppercase tracking-wide">
              <span className="material-symbols-outlined text-secondary text-[20px]">quiz</span>
              <span>Total Quizzes</span>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-on-surface block leading-none mb-1">{profile.totalQuizzesTaken}</span>
              <span className="text-xs text-secondary font-medium">Across 8 subjects</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-center gap-1.5 text-tertiary font-bold text-xs uppercase tracking-wide">
              <span className="material-symbols-outlined text-tertiary fill text-[20px]">local_fire_department</span>
              <span>Current Streak</span>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-on-surface block leading-none mb-1">{profile.streak} Days</span>
              <span className="text-xs text-secondary font-medium">Personal best: {profile.personalBestStreak}</span>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section>
          <div className="flex justify-between items-center bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 gap-4 overflow-x-auto hide-scrollbar">
            {profile.badges.map(badge => (
              <div key={badge.id} className="flex-shrink-0 w-24 flex flex-col items-center gap-1">
                <div className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all ${badge.colorClass}`}>
                  <span className={`material-symbols-outlined text-[28px] ${badge.earned ? 'fill' : ''}`}>{badge.icon}</span>
                </div>
                <span className="text-[10px] text-center text-on-surface-variant font-bold leading-tight">{badge.title}</span>
              </div>
            ))}
          </div>
        </section>

        {/* My content tabs */}
        <section className="space-y-4">
          <div className="flex border-b border-outline-variant">
            {(['quizzes', 'decks'] as const).map(tab => (
              <button key={tab} onClick={() => setProfileTab(tab)}
                className={`flex-1 pb-3 text-center font-bold text-sm transition-colors cursor-pointer border-b-2 ${profileTab === tab ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-on-surface'}`}>
                {tab === 'quizzes' ? 'My Quizzes' : 'My Decks'}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {profileTab === 'quizzes' ? quizzes.map(item => (
              <div key={item.id} className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex items-center justify-between hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">science</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface">{item.title}</h4>
                    <p className="text-xs text-secondary">Category: {item.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="block text-sm font-bold text-tertiary">{item.masteredPercentage || 0}% avg</span>
                    <span className="text-[10px] text-outline">{item.questions.length} Questions</span>
                  </div>
                  <button
                    onClick={() => { if (confirm(`Delete quiz "${item.title}"?`)) handleDeleteQuiz(item.id); }}
                    className="text-outline hover:text-error p-1 hover:bg-surface-container rounded-full"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            )) : decks.map(deck => (
              <div key={deck.id} className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex items-center justify-between hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">style</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface">{deck.title}</h4>
                    <p className="text-xs text-secondary">Scope: {deck.cards.length} Flashcards</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="block text-sm font-bold text-primary">Study mode</span>
                    <span className="text-[10px] text-outline">{deck.cards.length} cards</span>
                  </div>
                  <button
                    onClick={() => { if (confirm(`Delete deck "${deck.title}"?`)) handleDeleteDeck(deck.id); }}
                    className="text-outline hover:text-error p-1 hover:bg-surface-container rounded-full"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </NankiShell>
  );
}
