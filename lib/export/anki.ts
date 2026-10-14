import type { Deck, Quiz, Card, Question } from '@/types/nanki';

/**
 * Sanitizes field for Anki tab-delimited text.
 * Replaces actual tabs with 4 spaces and newlines with <br>.
 */
export function sanitizeAnkiField(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/\t/g, '    ')
    .replace(/\r\n/g, '<br>')
    .replace(/[\r\n]/g, '<br>')
    .trim();
}

/**
 * Normalizes category into valid Anki tag (no spaces).
 */
export function sanitizeAnkiTag(tag: string | null | undefined): string {
  if (!tag) return 'nanki';
  const clean = tag.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `nanki::${clean}`;
}

/**
 * Generates Anki-compatible TSV text from a Flashcard Deck.
 */
export function exportDeckToAnki(deck: Deck): string {
  const header = [
    '#separator:tab',
    '#html:true',
    '#tags column:4',
    `#deck:${deck.title.replace(/\t/g, ' ')}`,
    '',
  ].join('\n');

  const tag = sanitizeAnkiTag(deck.category);

  const rows = (deck.cards || []).map((card: Card) => {
    const front = sanitizeAnkiField(card.front);
    const back = sanitizeAnkiField(card.back);
    const extra = sanitizeAnkiField(card.extraNote || '');
    return `${front}\t${back}\t${extra}\t${tag}`;
  });

  return `${header}${rows.join('\n')}\n`;
}

/**
 * Generates Anki-compatible TSV text from a Quiz.
 */
export function exportQuizToAnki(quiz: Quiz): string {
  const header = [
    '#separator:tab',
    '#html:true',
    '#tags column:4',
    `#deck:${quiz.title.replace(/\t/g, ' ')}`,
    '',
  ].join('\n');

  const tag = sanitizeAnkiTag(quiz.category);

  const rows = (quiz.questions || []).map((q: Question, idx: number) => {
    let front = `<strong>Q${idx + 1}:</strong> ${q.text}<br><br>`;

    if (q.type === 'true-false') {
      front += '<em>True or False branches:</em><br>';
      q.options.forEach((opt, optIdx) => {
        const letter = String.fromCharCode(65 + optIdx);
        front += `${letter}. ${opt}<br>`;
      });

      let back = '<strong>Answers:</strong><br>';
      q.options.forEach((opt, optIdx) => {
        const letter = String.fromCharCode(65 + optIdx);
        const truth = q.correctTruthValues?.[optIdx] ?? false;
        const branchExpl = q.branchExplanations?.[optIdx] ? ` - ${q.branchExplanations[optIdx]}` : '';
        back += `${letter}. <strong>${truth ? 'TRUE' : 'FALSE'}</strong>${branchExpl}<br>`;
      });

      const extra = sanitizeAnkiField(q.explanation || '');
      return `${sanitizeAnkiField(front)}\t${sanitizeAnkiField(back)}\t${extra}\t${tag}`;
    } else {
      // Multiple-choice
      q.options.forEach((opt, optIdx) => {
        const letter = String.fromCharCode(65 + optIdx);
        front += `${letter}. ${opt}<br>`;
      });

      const correctOpt = q.options[q.correctOptionIndex] || 'Unknown';
      const correctLetter = String.fromCharCode(65 + q.correctOptionIndex);
      const back = `<strong>Correct Answer:</strong> ${correctLetter}. ${correctOpt}`;
      const extra = sanitizeAnkiField(q.explanation || '');

      return `${sanitizeAnkiField(front)}\t${sanitizeAnkiField(back)}\t${extra}\t${tag}`;
    }
  });

  return `${header}${rows.join('\n')}\n`;
}

/**
 * Triggers browser download of a text/anki file.
 */
export function downloadTextFile(filename: string, content: string, mimeType = 'text/tab-separated-values;charset=utf-8') {
  if (typeof window === 'undefined') return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
