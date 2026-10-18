import { Quiz, Question, Flashcard } from '../types';

export function generateMistakeFlashcards(
  quiz: Quiz,
  selectedAnswers: Record<number, number>,
  tfAnswers: Record<number, Record<number, number | null>>,
  includeUnanswered = false
): Flashcard[] {
  const cards: Flashcard[] = [];

  quiz.questions.forEach((q, qIndex) => {
    if (q.type === 'true-false') {
      const qTf = tfAnswers[qIndex] || {};
      q.options.forEach((statement, branchIdx) => {
        const correctTruth = q.correctTruthValues
          ? q.correctTruthValues[branchIdx]
          : q.branchAnswers
          ? q.branchAnswers[branchIdx] === 1
          : true;

        const userAns = qTf[branchIdx];
        const isAnswered = userAns !== null && userAns !== undefined;

        if (!isAnswered && !includeUnanswered) {
          return;
        }

        const isCorrect = isAnswered && (userAns === 1) === correctTruth;

        if (!isCorrect) {
          cards.push({
            id: `card_mistake_${Date.now()}_q${qIndex}_b${branchIdx}`,
            deckId: '',
            front: `${q.text}\n\nStatement: ${statement}`,
            back: correctTruth ? 'TRUE' : 'FALSE',
            extraNote: q.explanation || 'Review clinical statement and truth value.',
          });
        }
      });
    } else {
      const userOption = selectedAnswers[qIndex];
      const isAnswered = userOption !== undefined && userOption !== null;

      if (!isAnswered && !includeUnanswered) {
        return;
      }

      const isCorrect = isAnswered && userOption === q.correctAnswer;

      if (!isCorrect) {
        const optionsList = q.options
          .map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`)
          .join('\n');

        const correctLetter = String.fromCharCode(65 + q.correctAnswer);
        const correctText = q.options[q.correctAnswer] || '';

        cards.push({
          id: `card_mistake_${Date.now()}_q${qIndex}`,
          deckId: '',
          front: `${q.text}\n\n${optionsList}`,
          back: `Correct: ${correctLetter}. ${correctText}`,
          extraNote: q.explanation || undefined,
        });
      }
    }
  });

  return cards;
}
