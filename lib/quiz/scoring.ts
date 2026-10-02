import type { Question, Quiz } from '../../types/nanki';

export const branchKey = (questionId: string, index: number) => `${questionId}::${index}`;
export function validQuestion(q: Question) {
  return q.type !== 'true-false' || (q.options.length >= 2 && q.correctTruthValues?.length === q.options.length && q.correctTruthValues.every(value => typeof value === 'boolean'));
}
export function scoreQuiz(quiz: Quiz, answers: Record<string, number | null>, negativeMarking = false) {
  let correct = 0, wrong = 0, unanswered = 0, total = 0, penalizedWrong = 0;
  const incorrectIds: string[] = [];
  for (const q of quiz.questions) {
    if (!validQuestion(q)) throw new Error('Every True/False statement needs an answer key.');
    let missed = false;
    const tf = q.type === 'true-false';
    for (let i = 0; i < (tf ? q.options.length : 1); i++) {
      total++;
      const selected = answers[tf ? branchKey(q.id, i) : q.id];
      const expected = tf ? Number(q.correctTruthValues![i]) : q.correctOptionIndex;
      if (selected === undefined || selected === null) { unanswered++; missed = true; }
      else if (selected === expected) correct++;
      else { wrong++; missed = true; if (tf) penalizedWrong++; }
    }
    if (missed) incorrectIds.push(q.id);
  }
  const penalty = negativeMarking ? penalizedWrong * 0.5 : 0;
  return { correct, wrong, unanswered, total, penalty, netScore: correct - penalty, incorrectIds };
}
