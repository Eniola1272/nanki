'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import NankiShell from '@/components/nanki/NankiShell';
import { useNankiStore } from '@/lib/nanki-store';

function JoinWorkspaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { userId } = useNankiStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [workspaceSlug, setWorkspaceSlug] = useState('');
  const [alreadyMember, setAlreadyMember] = useState(false);

  const handleJoin = async () => {
    if (!token) {
      setError('Missing invite token.');
      return;
    }
    if (userId === 'guest') {
      router.push(`/auth?redirect=/workspace/join?token=${token}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/workspaces/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.code === 'ALREADY_MEMBER') {
          setAlreadyMember(true);
          return;
        }
        throw new Error(json.error || 'Failed to accept invitation.');
      }

      setSuccess(true);
      if (json.organization?.slug) {
        setWorkspaceSlug(json.organization.slug);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error joining workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && userId !== 'guest' && !success && !error && !alreadyMember) {
      handleJoin();
    }
  }, [token, userId]);

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-8 shadow-sm">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[36px]">group_add</span>
        </div>

        <h2 className="text-xl font-bold text-on-surface mb-2">Workspace Invitation</h2>

        {!token && (
          <div className="text-xs text-error mb-4">
            No invitation token provided. Please check the link from your email or invite message.
          </div>
        )}

        {userId === 'guest' && (
          <div className="space-y-4">
            <p className="text-xs text-secondary leading-relaxed">
              You need a Nanki account to accept this workspace invitation and collaborate with your team.
            </p>
            <button
              onClick={() => router.push(`/auth?redirect=/workspace/join?token=${token}`)}
              className="w-full bg-primary text-on-primary font-bold text-xs py-2.5 rounded-full hover:bg-primary-container transition-all cursor-pointer shadow-sm"
            >
              Sign In or Create Account
            </button>
          </div>
        )}

        {userId !== 'guest' && loading && (
          <div className="py-6 flex flex-col items-center gap-2">
            <div className="w-7 h-7 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-secondary">Joining workspace…</p>
          </div>
        )}

        {alreadyMember && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-on-surface">You are already a member of this workspace!</p>
            <Link
              href="/workspaces"
              className="inline-block bg-primary text-on-primary font-bold text-xs px-6 py-2.5 rounded-full hover:bg-primary-container transition-all"
            >
              Go to Workspaces
            </Link>
          </div>
        )}

        {success && (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              🎉 Welcome to the team! You have successfully joined the workspace.
            </div>
            <button
              onClick={() => router.push(workspaceSlug ? `/workspace/${workspaceSlug}` : '/workspaces')}
              className="w-full bg-primary text-on-primary font-bold text-xs py-2.5 rounded-full hover:bg-primary-container transition-all cursor-pointer shadow-sm"
            >
              Enter Workspace
            </button>
          </div>
        )}

        {error && (
          <div className="space-y-4">
            <div className="p-3 bg-error-container/20 border border-error/30 rounded-2xl text-error text-xs">
              {error}
            </div>
            <Link
              href="/workspaces"
              className="inline-block bg-secondary text-on-secondary font-bold text-xs px-5 py-2 rounded-full hover:opacity-90 transition-all"
            >
              Back to Workspaces
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function JoinWorkspacePage() {
  return (
    <NankiShell>
      <Suspense
        fallback={
          <div className="max-w-md mx-auto px-4 py-16 text-center">
            <div className="w-7 h-7 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-secondary">Loading invitation…</p>
          </div>
        }
      >
        <JoinWorkspaceContent />
      </Suspense>
    </NankiShell>
  );
}
