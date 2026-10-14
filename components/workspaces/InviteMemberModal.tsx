'use client';

import { useState } from 'react';
import { WORKSPACE_ROLES, type WorkspaceRole } from '@/lib/workspaces/roles';
import { showToast } from '@/lib/utils/toast';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  organizationName: string;
  onSuccess?: () => void;
}

export default function InviteMemberModal({
  isOpen,
  onClose,
  organizationId,
  organizationName,
  onSuccess,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<WorkspaceRole>('MEMBER');
  const [submitting, setSubmitting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showToast.error('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/workspaces/${organizationId}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), role }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast.error(data.error || 'Failed to send invitation.');
        return;
      }

      showToast.success(`Invitation created for ${email}!`);
      setGeneratedLink(data.inviteUrl);
      if (onSuccess) onSuccess();
    } catch {
      showToast.error('Network error creating invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    showToast.success('Invite link copied to clipboard!');
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
            <span className="material-symbols-outlined text-primary text-[22px]">person_add</span>
            <h3 className="text-base font-extrabold text-on-surface">Invite to {organizationName}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container-high transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {generatedLink ? (
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-2xl bg-tertiary/10 border border-tertiary/30 space-y-2 text-center">
              <span className="material-symbols-outlined text-tertiary text-[28px] block mx-auto">mark_email_read</span>
              <p className="text-sm font-bold text-on-surface">Invite Ready!</p>
              <p className="text-xs text-on-surface-variant">
                Share this link with <strong>{email}</strong>. They will be added with the <strong>{role}</strong> role.
              </p>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-2xl border border-outline-variant bg-surface-container-low text-xs">
              <input
                type="text"
                readOnly
                value={generatedLink}
                className="bg-transparent text-on-surface flex-1 focus:outline-none px-2 truncate font-mono text-[11px]"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="bg-primary text-on-primary font-bold px-3 py-1.5 rounded-xl hover:bg-primary-container transition-all shrink-0 cursor-pointer text-xs"
              >
                Copy
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-full font-bold text-xs bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider block mb-1">
                Member Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@university.edu"
                required
                className="w-full text-sm px-4 py-3 rounded-2xl border border-outline-variant bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider block mb-2">
                Team Role
              </label>
              <div className="space-y-2">
                {WORKSPACE_ROLES.map((r) => (
                  <label
                    key={r.role}
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                      role === r.role
                        ? 'border-primary bg-primary/5 text-on-surface'
                        : 'border-outline-variant/60 hover:border-outline-variant bg-surface-container-lowest text-on-surface-variant'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.role}
                      checked={role === r.role}
                      onChange={() => setRole(r.role)}
                      className="mt-0.5 text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="text-xs font-bold text-on-surface leading-tight">{r.title}</p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5 leading-normal">{r.description}</p>
                    </div>
                  </label>
                ))}
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
                {submitting ? 'Generating…' : 'Generate Invite Link'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
