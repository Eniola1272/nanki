'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNankiStore } from '@/lib/nanki-store';
import { generateWorkspaceSlug } from '@/lib/workspaces/roles';
import { showToast } from '@/lib/utils/toast';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (org: { id: string; name: string; slug: string }) => void;
}

export default function CreateWorkspaceModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateWorkspaceModalProps) {
  const router = useRouter();
  const { effectivePlan, openUpgradeModal } = useNankiStore();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [customSlug, setCustomSlug] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const isScholar = effectivePlan === 'SCHOLAR';

  const handleNameChange = (val: string) => {
    setName(val);
    if (!customSlug) {
      setSlug(generateWorkspaceSlug(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isScholar) {
      onClose();
      openUpgradeModal();
      showToast.info('Team workspaces require the Scholar plan. Please upgrade to create a workspace.');
      return;
    }

    if (!name.trim()) {
      showToast.error('Please enter a workspace name.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'UPGRADE_REQUIRED') {
          onClose();
          openUpgradeModal();
        }
        showToast.error(data.error || 'Failed to create workspace.');
        return;
      }

      showToast.success(`Workspace "${data.workspace.name}" created!`);
      onClose();
      if (onSuccess) {
        onSuccess(data.workspace);
      } else {
        router.push(`/workspace/${data.workspace.slug}`);
      }
    } catch {
      showToast.error('Network error creating workspace. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 sm:p-7 shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">corporate_fare</span>
            <h3 className="text-base font-extrabold text-on-surface">Create Team Workspace</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container-high transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {!isScholar && (
          <div className="mt-4 p-4 rounded-2xl bg-secondary/10 border border-secondary/30 space-y-2">
            <div className="flex items-center gap-1.5 text-secondary font-bold text-xs uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
              <span>Scholar Feature</span>
            </div>
            <p className="text-xs text-on-surface leading-relaxed">
              Workspaces allow you to invite up to 10 study partners, share private flashcards and quiz banks, and monitor group mastery.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                openUpgradeModal();
              }}
              className="mt-2 w-full py-2 rounded-full font-bold text-xs bg-secondary text-on-secondary hover:opacity-90 transition-all cursor-pointer shadow-sm"
            >
              Upgrade to Scholar
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-on-surface uppercase tracking-wider block mb-1">
              Workspace Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Med School Study Group"
              maxLength={50}
              required
              className="w-full text-sm px-4 py-3 rounded-2xl border border-outline-variant bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-on-surface uppercase tracking-wider block mb-1">
              Workspace URL Slug
            </label>
            <div className="flex items-center rounded-2xl border border-outline-variant bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant">
              <span>nanki.app/workspace/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setCustomSlug(true);
                  setSlug(e.target.value);
                }}
                placeholder="med-school"
                className="bg-transparent text-on-surface font-semibold focus:outline-none flex-1 ml-1"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-full text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-primary text-on-primary hover:bg-primary-container transition-all cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {submitting ? 'Creating…' : isScholar ? 'Create Workspace' : 'Unlock with Scholar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
