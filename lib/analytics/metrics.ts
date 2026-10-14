import type { Attempt } from '@/lib/progress/stats';
import type { FlashcardSession } from '@/lib/progress/flashcards';

export interface CategoryMastery {
  category: string;
  quizzesCount: number;
  totalQuestions: number;
  correctQuestions: number;
  accuracy: number;
}

export interface QuestionMetric {
  questionId: string;
  questionText: string;
  category: string;
  quizTitle: string;
  quizId: string;
  timesEncountered: number;
  timesCorrect: number;
  timesIncorrect: number;
  accuracy: number;
  explanation?: string;
}

export interface DailyActivityPoint {
  date: string;
  dayLabel: string;
  quizzesTaken: number;
  cardsReviewed: number;
  questionsAnswered: number;
  questionsCorrect: number;
  accuracy: number;
  xpEarned: number;
}

export interface AnalyticsSummary {
  totalQuestionsAnswered: number;
  overallAccuracy: number;
  totalQuizzesTaken: number;
  totalCardsReviewed: number;
  strongestCategory: string;
  weakestCategory: string;
  weakestQuestions: QuestionMetric[];
  categoryBreakdown: CategoryMastery[];
  timeline: DailyActivityPoint[];
}

/**
 * Aggregates mastery by quiz category.
 */
export function calculateCategoryMastery(attempts: Attempt[]): CategoryMastery[] {
  const map = new Map<string, { quizzesCount: number; total: number; correct: number }>();

  for (const attempt of attempts) {
    const category = attempt.quiz?.category?.trim() || 'General';
    const entry = map.get(category) || { quizzesCount: 0, total: 0, correct: 0 };
    entry.quizzesCount += 1;
    entry.total += attempt.total;
    entry.correct += attempt.correct;
    map.set(category, entry);
  }

  return Array.from(map.entries())
    .map(([category, stats]) => ({
      category,
      quizzesCount: stats.quizzesCount,
      totalQuestions: stats.total,
      correctQuestions: stats.correct,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    }))
    .sort((a, b) => b.totalQuestions - a.totalQuestions);
}

/**
 * Computes question-level accuracy and identifies missed questions.
 */
export function calculateQuestionMetrics(attempts: Attempt[]): QuestionMetric[] {
  const metricsMap = new Map<
    string,
    {
      questionText: string;
      category: string;
      quizTitle: string;
      quizId: string;
      encountered: number;
      correct: number;
      explanation?: string;
    }
  >();

  for (const attempt of attempts) {
    const quiz = attempt.quiz;
    if (!quiz || !Array.isArray(quiz.questions)) continue;

    for (const q of quiz.questions) {
      const qId = q.id;
      const entry = metricsMap.get(qId) || {
        questionText: q.text,
        category: quiz.category || 'General',
        quizTitle: quiz.title,
        quizId: quiz.id,
        encountered: 0,
        correct: 0,
        explanation: q.explanation,
      };

      entry.encountered += 1;
      const userAns = attempt.answers?.[qId];

      if (q.type === 'true-false') {
        // In True/False questions, userAns may indicate score or branch truth
        if (userAns !== null && userAns !== undefined) {
          // If user got credit, count as correct
          const isCorrect = userAns === q.correctOptionIndex || userAns === 1;
          if (isCorrect) entry.correct += 1;
        }
      } else {
        if (userAns === q.correctOptionIndex) {
          entry.correct += 1;
        }
      }

      metricsMap.set(qId, entry);
    }
  }

  return Array.from(metricsMap.entries()).map(([qId, data]) => {
    const accuracy = data.encountered > 0 ? Math.round((data.correct / data.encountered) * 100) : 0;
    return {
      questionId: qId,
      questionText: data.questionText,
      category: data.category,
      quizTitle: data.quizTitle,
      quizId: data.quizId,
      timesEncountered: data.encountered,
      timesCorrect: data.correct,
      timesIncorrect: data.encountered - data.correct,
      accuracy,
      explanation: data.explanation,
    };
  });
}

/**
 * Returns weakest questions (accuracy < 60% and encountered at least once),
 * sorted by lowest accuracy, then by times incorrect descending.
 */
export function getWeakestQuestions(attempts: Attempt[], limit = 10): QuestionMetric[] {
  const all = calculateQuestionMetrics(attempts);
  return all
    .filter((q) => q.timesIncorrect > 0 && q.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy || b.timesIncorrect - a.timesIncorrect)
    .slice(0, limit);
}

/**
 * Builds daily activity timeline for the last N days.
 */
export function calculateActivityTimeline(
  attempts: Attempt[],
  flashcards: FlashcardSession[] = [],
  daysCount = 14,
  now = new Date()
): DailyActivityPoint[] {
  const points: DailyActivityPoint[] = [];

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' });

    const dayAttempts = attempts.filter((a) => a.studyDay === dateStr);
    const dayFlashcards = flashcards.filter((f) => f.studyDay === dateStr);

    const quizzesTaken = dayAttempts.length;
    const cardsReviewed = dayFlashcards.reduce((sum, f) => sum + f.cardsReviewed, 0);
    const questionsAnswered = dayAttempts.reduce((sum, a) => sum + a.total, 0);
    const questionsCorrect = dayAttempts.reduce((sum, a) => sum + a.correct, 0);
    const accuracy = questionsAnswered > 0 ? Math.round((questionsCorrect / questionsAnswered) * 100) : 0;

    const xpEarned =
      dayAttempts.reduce((sum, a) => sum + 10 + a.correct * 2, 0) +
      dayFlashcards.reduce((sum, f) => sum + 10 + f.cardsReviewed, 0);

    points.push({
      date: dateStr,
      dayLabel,
      quizzesTaken,
      cardsReviewed,
      questionsAnswered,
      questionsCorrect,
      accuracy,
      xpEarned,
    });
  }

  return points;
}

/**
 * Computes complete analytics summary for pro dashboard.
 */
export function computeAnalyticsSummary(
  attempts: Attempt[],
  flashcards: FlashcardSession[] = [],
  timelineDays = 14
): AnalyticsSummary {
  const categoryBreakdown = calculateCategoryMastery(attempts);
  const weakestQuestions = getWeakestQuestions(attempts, 8);
  const timeline = calculateActivityTimeline(attempts, flashcards, timelineDays);

  const totalQuestionsAnswered = attempts.reduce((sum, a) => sum + a.total, 0);
  const totalCorrect = attempts.reduce((sum, a) => sum + a.correct, 0);
  const overallAccuracy = totalQuestionsAnswered > 0 ? Math.round((totalCorrect / totalQuestionsAnswered) * 100) : 0;
  const totalCardsReviewed = flashcards.reduce((sum, f) => sum + f.cardsReviewed, 0);

  const strongestCategory = categoryBreakdown.length > 0
    ? categoryBreakdown.slice().sort((a, b) => b.accuracy - a.accuracy)[0].category
    : 'None yet';

  const weakestCategory = categoryBreakdown.length > 0
    ? categoryBreakdown.slice().sort((a, b) => a.accuracy - b.accuracy)[0].category
    : 'None yet';

  return {
    totalQuestionsAnswered,
    overallAccuracy,
    totalQuizzesTaken: attempts.length,
    totalCardsReviewed,
    strongestCategory,
    weakestCategory,
    weakestQuestions,
    categoryBreakdown,
    timeline,
  };
}
