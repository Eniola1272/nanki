import { Share, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Deck, Quiz, Flashcard } from '../types';

export function sanitizeAnkiField(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/\t/g, '    ')
    .replace(/\r\n/g, '<br>')
    .replace(/[\r\n]/g, '<br>')
    .trim();
}

export function sanitizeAnkiTag(tag: string | null | undefined): string {
  if (!tag) return 'nanki';
  const clean = tag.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `nanki::${clean}`;
}

export function exportDeckToAnki(deck: Deck): string {
  const header = [
    '#separator:tab',
    '#html:true',
    '#tags column:4',
    `#deck:${deck.title.replace(/\t/g, ' ')}`,
    '',
  ].join('\n');

  const tag = sanitizeAnkiTag(deck.category);

  const rows = (deck.cards || []).map((card: Flashcard) => {
    const front = sanitizeAnkiField(card.front);
    const back = sanitizeAnkiField(card.back);
    const extra = sanitizeAnkiField(card.extraNote || '');
    return `${front}\t${back}\t${extra}\t${tag}`;
  });

  return `${header}${rows.join('\n')}\n`;
}

export async function shareDeckAsAnki(deck: Deck): Promise<void> {
  Haptics.selectionAsync();
  const ankiData = exportDeckToAnki(deck);

  try {
    const result = await Share.share({
      title: `${deck.title} — Anki Deck Export`,
      message: ankiData,
    });
    if (result.action === Share.sharedAction) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  } catch {
    await Clipboard.setStringAsync(ankiData);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}

export async function shareQuizResults(
  quiz: Quiz,
  percentage: number,
  correct: number,
  total: number
): Promise<void> {
  Haptics.selectionAsync();
  const text = `🎯 I scored ${percentage}% (${correct}/${total}) on "${quiz.title}" (${quiz.category}) on Nanki Medical!\n\nStudy medical question banks with spaced repetition: https://nanki.app`;

  try {
    await Share.share({
      title: `Nanki Quiz Score: ${quiz.title}`,
      message: text,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}
