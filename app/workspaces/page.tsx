'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NankiShell from '@/components/nanki/NankiShell';
import CreateWorkspaceModal from '@/components/workspaces/CreateWorkspaceModal';
import UpgradeModal from '@/components/billing/UpgradeModal';
import { useNankiStore } from '@/lib/nanki-store';
import { hasPlanFeature } from '@/lib/billing/plans';
import type { WorkspaceRole } from '@/lib/workspaces/roles';

interface WorkspaceItem {
  role: WorkspaceRole;
  joinedAt: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    owner_id: string;
    created_at: string;
  };
}

export default function WorkspacesPage() {
  const router = useRouter();
  const { profile, userId } = useNankiStore();
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const canCreate = hasPlanFeature(profile, 'workspaces');

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/workspaces');
      if (res.status === 401) {
        setWorkspaces([]);
        return;
      }
      if (!res.ok) {
        throw new Error('Failed to load workspaces');
      }
      const data = await res.json();
      setWorkspaces(data.workspaces || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading workspaces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId !== 'guest') {
      fetchWorkspaces();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const handleCreateClick = () => {
    if (userId === 'guest') {
      router.push('/auth');
      return;
    }
    if (!canCreate) {
      setShowUpgradeModal(true);
      return;
    }
    setShowCreateModal(true);
  };

  return (
    <NankiShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-[28px]">groups</span>
              <h1 className="font-headline-sm text-2xl md:text-3xl font-extrabold text-on-surface">
                Team Workspaces
              </h1>
            </div>
            <p className="text-sm text-secondary">
              Collaborate with classmates and colleagues on shared quiz banks, team flashcard decks, and mastery goals.
            </p>
          </div>

          <button
            onClick={handleCreateClick}
            className="flex items-center justify-center gap-2 bg-primary text-on-primary font-bold text-sm px-5 py-2.5 rounded-full hover:bg-primary-container hover:text-on-primary-container active:scale-95 transition-all shadow-sm cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Workspace
          </button>
        </div>

        {/* Scholar Banner if not on Scholar tier */}
        {!canCreate && (
          <div className="mb-8 p-5 bg-gradient-to-r from-amber-500/10 via-primary/5 to-transparent border border-amber-500/30 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-500 shrink-0">
                <span className="material-symbols-outlined text-[24px]">school</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                  Scholar Plan Feature
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Up to 10 Members
                  </span>
                </h3>
                <p className="text-xs text-secondary mt-1">
                  Create dedicated group workspaces, invite up to 10 peers, share private quiz banks &amp; flashcards, and track collective mastery.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-primary text-on-primary font-bold text-xs px-4 py-2 rounded-full hover:opacity-90 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              Upgrade to Scholar
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-5 animate-pulse flex flex-col gap-3"
              >
                <div className="h-6 w-3/4 bg-surface-container-high rounded-lg" />
                <div className="h-4 w-1/2 bg-surface-container rounded" />
                <div className="h-8 w-full bg-surface-container-low rounded-xl mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-4 bg-error-container/20 border border-error/30 rounded-2xl text-error text-sm mb-6">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && workspaces.length === 0 && (
          <div className="border border-dashed border-outline-variant rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-4 bg-surface-container-lowest/50">
            <div className="w-16 h-16 rounded-3xl bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[36px]">diversity_3</span>
            </div>
            <div className="max-w-md">
              <h2 className="font-bold text-lg text-on-surface">No Workspaces Yet</h2>
              <p className="text-xs text-secondary mt-1 leading-relaxed">
                You haven&apos;t joined or created any team workspaces yet. Create your first workspace or ask your team admin for an invite link.
              </p>
            </div>
            <button
              onClick={handleCreateClick}
              className="bg-primary text-on-primary font-bold text-xs px-5 py-2.5 rounded-full hover:bg-primary-container active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Create Team Workspace
            </button>
          </div>
        )}

        {/* Workspaces list */}
        {!loading && workspaces.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workspaces.map((item) => {
              const org = item.organization;
              const roleColors: Record<string, string> = {
                ADMIN: 'bg-primary/10 text-primary border-primary/20',
                MEMBER: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                VIEWER: 'bg-surface-container-highest text-secondary border-outline-variant',
              };

              return (
                <div
                  key={org.id}
                  onClick={() => router.push(`/workspace/${org.slug || org.id}`)}
                  className="group bg-surface-container-lowest border border-outline-variant hover:border-primary/50 hover:shadow-md rounded-3xl p-5 flex flex-col justify-between transition-all cursor-pointer"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="w-10 h-10 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary font-bold text-base group-hover:scale-105 transition-transform">
                        {org.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                          roleColors[item.role] || roleColors.MEMBER
                        }`}
                      >
                        {item.role}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                      {org.name}
                    </h3>
                    <p className="text-xs text-outline font-mono mt-0.5">@{org.slug}</p>

                    <p className="text-xs text-secondary mt-2 line-clamp-2">
                      {org.description || 'Collaborative team workspace on Nanki.'}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-outline-variant/60 flex items-center justify-between">
                    <span className="text-[11px] text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      {new Date(org.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </span>

                    <span className="text-xs font-bold text-primary flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      Open
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(org) => {
          setShowCreateModal(false);
          router.push(`/workspace/${org.slug || org.id}`);
        }}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason="Upgrade to the Scholar plan to create team workspaces, invite up to 10 peers, and build collaborative quiz banks."
      />
    </NankiShell>
  );
}
