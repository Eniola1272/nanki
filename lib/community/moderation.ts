export type ReportReason = 'inaccurate' | 'inappropriate' | 'spam' | 'copyright' | 'other';

export const REPORT_REASONS: { id: ReportReason; label: string; description: string }[] = [
  {
    id: 'inaccurate',
    label: 'Factually Inaccurate',
    description: 'Incorrect answer keys, erroneous medical/academic facts, or misleading explanations.',
  },
  {
    id: 'inappropriate',
    label: 'Inappropriate or Offensive',
    description: 'Harassment, offensive language, or prohibited material.',
  },
  {
    id: 'spam',
    label: 'Spam or Advertising',
    description: 'Promotional links, duplicate spam submissions, or non-educational content.',
  },
  {
    id: 'copyright',
    label: 'Copyright Infringement',
    description: 'Unauthorized publication of proprietary examination papers or copyrighted materials.',
  },
  {
    id: 'other',
    label: 'Other Issue',
    description: 'Any other critical issue requiring moderator review.',
  },
];

export function isValidReportReason(reason: unknown): reason is ReportReason {
  return typeof reason === 'string' && ['inaccurate', 'inappropriate', 'spam', 'copyright', 'other'].includes(reason);
}

export function validateReportInput(payload: {
  kind: 'quiz' | 'deck';
  contentId: string;
  reason: unknown;
  details?: unknown;
}): { valid: boolean; error?: string } {
  if (!payload.contentId || typeof payload.contentId !== 'string') {
    return { valid: false, error: 'Target content ID is required.' };
  }
  if (payload.kind !== 'quiz' && payload.kind !== 'deck') {
    return { valid: false, error: 'Target content kind must be quiz or deck.' };
  }
  if (!isValidReportReason(payload.reason)) {
    return { valid: false, error: 'A valid report reason must be selected.' };
  }
  if (payload.details && typeof payload.details === 'string' && payload.details.length > 1000) {
    return { valid: false, error: 'Details explanation cannot exceed 1000 characters.' };
  }
  return { valid: true };
}
