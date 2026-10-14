'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NankiShell from '@/components/nanki/NankiShell';
import InviteMemberModal from '@/components/workspaces/InviteMemberModal';
import { useNankiStore } from '@/lib/nanki-store';
import {
  canManageWorkspace,
  canCreateTeamContent,
  MAX_WORKSPACE_MEMBERS,
  type WorkspaceRole,
} from '@/lib/workspaces/roles';
import { showToast } from '@/lib/utils/toast';

interface WorkspaceData {
  organization: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    ownerId: string;
    createdAt: string;
  };
  userRole: WorkspaceRole;
  members: Array<{
    userId: string;
    role: WorkspaceRole;
    joinedAt: string;
    name: string;
    email: string;
    avatar: string;
    streak: number;
    xp: number;
    accuracy: number;
  }>;
  invites: Array<{
    id: string;
    email: string;
    role: WorkspaceRole;
    token: string;
    createdAt: string;
    expiresAt: string;
  }>;
  quizzes: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    masteredPercentage: number;
    published: boolean;
    createdAt: string;
    authorName: string;
    authorAvatar: string;
  }>;
  decks: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    author: string;
    cardCount: number;
    published: boolean;
    createdAt: string;
    authorName: string;
    authorAvatar: string;
  }>;
  activities: Array<{
    id: string;
    action: string;
    targetTitle: string;
    targetId?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
    userName: string;
    userAvatar: string;
  }>;
  analytics: {
    totalMembers: number;
    avgAccuracy: number;
    totalTeamXp: number;
    totalQuizzes: number;
    totalDecks: number;
  };
}

export default function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { userId } = useNankiStore();

  const [data, setData] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'quizzes' | 'decks' | 'analytics' | 'members' | 'activity'>('quizzes');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const fetchWorkspace = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/workspaces/${slug}`);
      if (res.status === 401) {
        router.push('/auth');
        return;
      }
      if (res.status === 403) {
        setError('You are not a member of this workspace.');
        return;
      }
      if (res.status === 404) {
        setError('Workspace not found.');
        return;
      }
      if (!res.ok) {
        throw new Error('Failed to load workspace data');
      }
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [slug]);

  if (loading) {
    return (
      <NankiShell>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-secondary">Loading workspace…</p>
        </div>
      </NankiShell>
    );
  }

  if (error || !data) {
    return (
      <NankiShell>
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-error-container/30 text-error flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[30px]">error</span>
          </div>
          <h2 className="text-xl font-bold text-on-surface mb-2">Workspace Access</h2>
          <p className="text-sm text-secondary mb-6">{error || 'Unable to access workspace.'}</p>
          <Link
            href="/workspaces"
            className="bg-primary text-on-primary font-bold text-xs px-5 py-2.5 rounded-full hover:bg-primary-container transition-all"
          >
            Back to Workspaces
          </Link>
        </div>
      </NankiShell>
    );
  }

  const { organization: org, userRole, members, invites, quizzes, decks, activities, analytics } = data;
  const isAdmin = canManageWorkspace(userRole);
  const canCreate = canCreateTeamContent(userRole);
  const memberCount = members.length;
  const isFull = memberCount >= MAX_WORKSPACE_MEMBERS;

  const copyInviteLink = (token: string) => {
    const url = `${window.location.origin}/workspace/join?token=${token}`;
    navigator.clipboard.writeText(url);
    showToast.success('Invite link copied to clipboard!');
  };

  const roleBadgeStyle = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'MEMBER':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      default:
        return 'bg-surface-container-highest text-secondary border-outline-variant';
    }
  };

  const activityIcon = (action: string) => {
    switch (action) {
      case 'created_quiz':
        return { icon: 'quiz', color: 'text-primary' };
      case 'created_deck':
        return { icon: 'style', color: 'text-secondary' };
      case 'completed_quiz':
        return { icon: 'check_circle', color: 'text-emerald-500' };
      case 'reviewed_cards':
        return { icon: 'psychology', color: 'text-amber-500' };
      case 'joined_workspace':
        return { icon: 'person_add', color: 'text-blue-500' };
      case 'invited_member':
        return { icon: 'mail', color: 'text-purple-500' };
      default:
        return { icon: 'schedule', color: 'text-secondary' };
    }
  };

  return (
    <NankiShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-secondary mb-4">
          <Link href="/workspaces" className="hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Workspaces
          </Link>
          <span>/</span>
          <span className="font-semibold text-on-surface">{org.name}</span>
        </div>

        {/* Workspace Hero Header */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-extrabold text-2xl shrink-0">
                {org.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="font-headline-sm text-2xl md:text-3xl font-extrabold text-on-surface">
                    {org.name}
                  </h1>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${roleBadgeStyle(userRole)}`}>
                    {userRole}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-surface-container text-secondary">
                    {memberCount}/{MAX_WORKSPACE_MEMBERS} members
                  </span>
                </div>
                <p className="text-xs text-outline font-mono mb-2">@{org.slug}</p>
                <p className="text-xs md:text-sm text-secondary max-w-2xl">
                  {org.description || 'Collaborative team workspace on Nanki.'}
                </p>
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowInviteModal(true)}
                  disabled={isFull}
                  className="flex items-center gap-1.5 bg-primary text-on-primary font-bold text-xs px-4 py-2.5 rounded-full hover:bg-primary-container hover:text-on-primary-container active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  {isFull ? 'Workspace Full' : 'Invite Member'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-outline-variant pb-2 mb-6 overflow-x-auto no-scrollbar">
          {[
            { id: 'quizzes', label: 'Quiz Banks', icon: 'quiz', count: quizzes.length },
            { id: 'decks', label: 'Team Decks', icon: 'style', count: decks.length },
            { id: 'analytics', label: 'Team Mastery', icon: 'monitoring' },
            { id: 'members', label: 'Members', icon: 'group', count: members.length },
            { id: 'activity', label: 'Activity Feed', icon: 'timeline', count: activities.length },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  active
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-secondary hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${active ? 'fill' : ''}`}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      active ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container text-secondary'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT: Quizzes */}
        {activeTab === 'quizzes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-on-surface">Collaborative Quiz Banks</h3>
                <p className="text-xs text-secondary">Quizzes created and shared within this workspace.</p>
              </div>
              {canCreate && (
                <button
                  onClick={() => router.push(`/quiz/new?workspace=${org.id}`)}
                  className="flex items-center gap-1.5 bg-primary text-on-primary font-bold text-xs px-4 py-2 rounded-full hover:bg-primary-container active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  New Team Quiz
                </button>
              )}
            </div>

            {quizzes.length === 0 ? (
              <div className="border border-dashed border-outline-variant rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-3 bg-surface-container-lowest/50">
                <span className="material-symbols-outlined text-[36px] text-outline">quiz</span>
                <p className="text-sm font-bold text-on-surface">No team quizzes yet</p>
                <p className="text-xs text-secondary max-w-sm">
                  Start building a collaborative question bank with your team members.
                </p>
                {canCreate && (
                  <button
                    onClick={() => router.push(`/quiz/new?workspace=${org.id}`)}
                    className="bg-primary text-on-primary text-xs font-bold px-4 py-2 rounded-full hover:bg-primary-container transition-all"
                  >
                    Create First Team Quiz
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="bg-surface-container-lowest border border-outline-variant hover:border-primary/50 rounded-3xl p-5 flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container text-secondary">
                          {quiz.category}
                        </span>
                        <span className="text-[11px] font-bold text-primary">
                          {quiz.masteredPercentage}% Mastery
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-on-surface line-clamp-1 mb-1">{quiz.title}</h4>
                      <p className="text-xs text-secondary line-clamp-2">{quiz.description}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-outline-variant/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {quiz.authorAvatar ? (
                          <img src={quiz.authorAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-[16px] text-secondary">account_circle</span>
                        )}
                        <span className="text-[11px] text-secondary truncate max-w-[90px]">{quiz.authorName}</span>
                      </div>
                      <button
                        onClick={() => router.push(`/quiz/${quiz.id}/play`)}
                        className="bg-primary text-on-primary font-bold text-xs px-3.5 py-1.5 rounded-full hover:bg-primary-container active:scale-95 transition-all cursor-pointer"
                      >
                        Take Quiz
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: Decks */}
        {activeTab === 'decks' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-on-surface">Shared Flashcard Decks</h3>
                <p className="text-xs text-secondary">Spaced-repetition decks built for team mastery.</p>
              </div>
              {canCreate && (
                <button
                  onClick={() => router.push(`/deck/new?workspace=${org.id}`)}
                  className="flex items-center gap-1.5 bg-primary text-on-primary font-bold text-xs px-4 py-2 rounded-full hover:bg-primary-container active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  New Team Deck
                </button>
              )}
            </div>

            {decks.length === 0 ? (
              <div className="border border-dashed border-outline-variant rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-3 bg-surface-container-lowest/50">
                <span className="material-symbols-outlined text-[36px] text-outline">style</span>
                <p className="text-sm font-bold text-on-surface">No shared flashcards yet</p>
                <p className="text-xs text-secondary max-w-sm">
                  Create decks together and study with FSRS spaced repetition.
                </p>
                {canCreate && (
                  <button
                    onClick={() => router.push(`/deck/new?workspace=${org.id}`)}
                    className="bg-primary text-on-primary text-xs font-bold px-4 py-2 rounded-full hover:bg-primary-container transition-all"
                  >
                    Create First Team Deck
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {decks.map((deck) => (
                  <div
                    key={deck.id}
                    className="bg-surface-container-lowest border border-outline-variant hover:border-primary/50 rounded-3xl p-5 flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container text-secondary">
                          {deck.category}
                        </span>
                        <span className="text-[11px] font-bold text-secondary">
                          {deck.cardCount} cards
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-on-surface line-clamp-1 mb-1">{deck.title}</h4>
                      <p className="text-xs text-secondary line-clamp-2">{deck.description}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-outline-variant/60 flex items-center justify-between">
                      <span className="text-[11px] text-secondary">{deck.authorName}</span>
                      <button
                        onClick={() => router.push(`/deck/${deck.id}/play`)}
                        className="bg-primary text-on-primary font-bold text-xs px-3.5 py-1.5 rounded-full hover:bg-primary-container active:scale-95 transition-all cursor-pointer"
                      >
                        Study Deck
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: Team Mastery Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-4">
                <span className="text-xs text-secondary font-medium">Team Accuracy</span>
                <p className="text-2xl font-extrabold text-primary mt-1">{analytics.avgAccuracy}%</p>
                <span className="text-[11px] text-outline">Across all members</span>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-4">
                <span className="text-xs text-secondary font-medium">Collective XP</span>
                <p className="text-2xl font-extrabold text-on-surface mt-1">{analytics.totalTeamXp.toLocaleString()}</p>
                <span className="text-[11px] text-outline">Total experience</span>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-4">
                <span className="text-xs text-secondary font-medium">Quiz Banks</span>
                <p className="text-2xl font-extrabold text-on-surface mt-1">{analytics.totalQuizzes}</p>
                <span className="text-[11px] text-outline">Collaborative quizzes</span>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-4">
                <span className="text-xs text-secondary font-medium">Study Decks</span>
                <p className="text-2xl font-extrabold text-on-surface mt-1">{analytics.totalDecks}</p>
                <span className="text-[11px] text-outline">Flashcard sets</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6">
              <h4 className="font-bold text-sm text-on-surface mb-4">Member Mastery Leaderboard</h4>
              <div className="divide-y divide-outline-variant/60">
                {members
                  .slice()
                  .sort((a, b) => b.xp - a.xp)
                  .map((m, idx) => (
                    <div key={m.userId} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-xs text-outline w-5 text-center">#{idx + 1}</span>
                        <img src={m.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-xs text-on-surface">{m.name}</p>
                          <p className="text-[10px] text-secondary">{m.streak} Day Streak 🔥</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="font-bold text-xs text-on-surface">{m.xp} XP</span>
                          <p className="text-[10px] text-secondary">{m.accuracy}% Accuracy</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: Members & Invites */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Current Members ({members.length})</h4>
                  <p className="text-xs text-secondary">Members with active workspace access.</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    disabled={isFull}
                    className="bg-primary text-on-primary font-bold text-xs px-3.5 py-1.5 rounded-full hover:bg-primary-container disabled:opacity-50 cursor-pointer"
                  >
                    + Invite
                  </button>
                )}
              </div>

              <div className="divide-y divide-outline-variant/60">
                {members.map((m) => (
                  <div key={m.userId} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={m.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs text-on-surface">{m.name}</p>
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.2 rounded-full border ${roleBadgeStyle(m.role)}`}>
                            {m.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-secondary">{m.email}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-outline">
                      Joined {new Date(m.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {isAdmin && invites.length > 0 && (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6">
                <h4 className="font-bold text-sm text-on-surface mb-1">Pending Invitations ({invites.length})</h4>
                <p className="text-xs text-secondary mb-4">Invited members who have not yet accepted.</p>

                <div className="divide-y divide-outline-variant/60">
                  {invites.map((inv) => (
                    <div key={inv.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs text-on-surface">{inv.email}</p>
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.2 rounded-full bg-surface-container text-secondary">
                            {inv.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-outline">Expires {new Date(inv.expiresAt).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => copyInviteLink(inv.token)}
                        className="flex items-center gap-1 text-xs text-primary font-bold hover:underline cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">link</span>
                        Copy Link
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: Activity Feed */}
        {activeTab === 'activity' && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6">
            <h4 className="font-bold text-sm text-on-surface mb-1">Workspace Activity Feed</h4>
            <p className="text-xs text-secondary mb-6">Real-time log of team collaborations and study milestones.</p>

            {activities.length === 0 ? (
              <p className="text-xs text-secondary text-center py-8">No recent activity recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {activities.map((act) => {
                  const { icon, color } = activityIcon(act.action);
                  return (
                    <div key={act.id} className="flex items-start gap-3 text-xs">
                      <div className={`p-1.5 rounded-full bg-surface-container-low shrink-0 ${color}`}>
                        <span className="material-symbols-outlined text-[16px]">{icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-on-surface">
                          <strong className="font-bold">{act.userName}</strong>{' '}
                          {act.action === 'created_quiz' && <>created new quiz bank <strong>&ldquo;{act.targetTitle}&rdquo;</strong></>}
                          {act.action === 'created_deck' && <>created new flashcard deck <strong>&ldquo;{act.targetTitle}&rdquo;</strong></>}
                          {act.action === 'completed_quiz' && <>completed quiz <strong>&ldquo;{act.targetTitle}&rdquo;</strong></>}
                          {act.action === 'reviewed_cards' && <>studied cards in <strong>&ldquo;{act.targetTitle}&rdquo;</strong></>}
                          {act.action === 'joined_workspace' && <>joined the workspace</>}
                          {act.action === 'invited_member' && <>invited <strong>{act.targetTitle}</strong></>}
                        </p>
                        <span className="text-[10px] text-outline">
                          {new Date(act.createdAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <InviteMemberModal
        isOpen={showInviteModal}
        organizationId={org.id}
        organizationName={org.name}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => {
          fetchWorkspace();
        }}
      />
    </NankiShell>
  );
}
