'use client';

import { useState } from 'react';
import { REPORT_REASONS, type ReportReason } from '@/lib/community/moderation';
import { showToast } from '@/lib/utils/toast';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  kind: 'quiz' | 'deck';
  contentId: string;
  contentTitle: string;
}

export default function ReportModal({
  isOpen,
  onClose,
  kind,
  contentId,
  contentTitle,
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason>('inaccurate');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/community/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          contentId,
          reason,
          details,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast.error(data.error || 'Failed to submit report.');
        return;
      }
      showToast.success(data.message || 'Report submitted. Thank you for your feedback.');
      onClose();
    } catch {
      showToast.error('Network error submitting report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
          <div className="flex items-center gap-2 text-error">
            <span className="material-symbols-outlined text-[20px]">flag</span>
            <h3 className="text-base font-extrabold text-on-surface">Report Public Content</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container-high transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p className="text-xs text-on-surface-variant mt-3">
          Reporting <strong className="text-on-surface">&ldquo;{contentTitle}&rdquo;</strong> ({kind === 'quiz' ? 'Quiz' : 'Flashcards Deck'}).
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
              Reason for reporting
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                    reason === r.id
                      ? 'border-primary bg-primary/5 text-on-surface'
                      : 'border-outline-variant/60 hover:border-outline-variant bg-surface-container-lowest text-on-surface-variant'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={r.id}
                    checked={reason === r.id}
                    onChange={() => setReason(r.id)}
                    className="mt-0.5 text-primary focus:ring-primary"
                  />
                  <div>
                    <p className="text-xs font-bold text-on-surface leading-tight">{r.label}</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 leading-normal">{r.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-on-surface uppercase tracking-wider block mb-1">
              Additional Details (Optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Explain what is inaccurate or inappropriate so moderators can review it quickly…"
              className="w-full text-xs p-3 rounded-2xl border border-outline-variant bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
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
              className="px-5 py-2 rounded-full text-xs font-bold bg-error text-white hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              {submitting ? 'Submitting…' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
