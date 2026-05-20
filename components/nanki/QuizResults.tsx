'use client';

import { useState } from 'react';
import type { Quiz } from '@/types/nanki';

interface QuizResultsProps {
  quiz: Quiz;
  correctCount: number;
  wrongCount: number;
  incorrectQuestionIds: string[];
  onClose: () => void;
  onRetake: () => void;
}

export default function QuizResults({ quiz, correctCount, wrongCount, incorrectQuestionIds, onClose, onRetake }: QuizResultsProps) {
  const [showErrorReview, setShowErrorReview] = useState(false);
  const totalQuestions = quiz.questions.length;
  const scorePercent = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  const getFeedback = () => {
    if (scorePercent === 100) return { title: 'Perfect Score! 🏆', msg: 'Absolute excellence. You have mastered every concept here.' };
    if (scorePercent >= 80) return { title: 'Mastery Achieved! 🌟', msg: 'Incredible work. Your neural pathways are strengthening.' };
    if (scorePercent >= 50) return { title: 'Great Effort! 👍', msg: 'Good progress. A little more revision and you will ace it!' };
    return { title: 'Keep Practicing! 📚', msg: 'Review your mistakes to build stronger cognitive recall.' };
  };
  const feedback = getFeedback();

  return (
    <div className="min-h-screen bg-background text-on-background font-sans flex flex-col antialiased">
      <header className="bg-surface-container-lowest border-b border-outline-variant fixed top-0 w-full z-40">
        <div className="flex justify-between items-center px-4 py-3 max-w-[800px] mx-auto">
          <div className="flex items-center gap-2">
            <span className="font-headline-lg-mobile font-bold text-primary">Nanki</span>
            <span className="text-secondary text-sm border-l border-outline-variant pl-2 truncate max-w-[150px] md:max-w-[400px]">{quiz.title} Results</span>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-on-surface p-1 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </header>

      <main className="flex-grow pt-20 pb-24 px-4 max-w-[800px] w-full mx-auto flex flex-col justify-center">
        {!showErrorReview ? (
          <div className="w-full flex flex-col items-center animate-fadeIn">
            <div className="relative w-full flex justify-center mb-8 py-4">
              <div className="absolute inset-0 pointer-events-none blur-2xl"></div>
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-white border border-outline-variant shadow-[0_12px_32px_rgba(0,0,0,0.06)] flex items-center justify-center z-10 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-tertiary-fixed/30 mix-blend-overlay"></div>
                <span className="material-symbols-outlined text-[100px] text-tertiary-fixed-dim select-none animate-pulse fill">psychology</span>
                <div className="absolute top-8 left-10 w-2 h-2 rounded-full bg-tertiary-fixed animate-ping"></div>
                <div className="absolute bottom-10 right-12 w-2 h-2 rounded-full bg-primary-fixed-dim animate-pulse"></div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-2">{correctCount}/{totalQuestions}</h1>
              <h2 className="text-xl md:text-2xl text-on-surface font-bold">{feedback.title}</h2>
              <p className="font-body-lg text-sm md:text-base text-secondary max-w-sm mx-auto mt-2">{feedback.msg}</p>
            </div>

            <div className="w-full grid grid-cols-2 gap-4 mb-8">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex flex-col items-center text-center shadow-sm">
                <div className="w-10 h-10 rounded-full bg-tertiary-fixed/40 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-tertiary text-[20px] fill">check_circle</span>
                </div>
                <span className="text-2xl font-extrabold text-tertiary-container">{correctCount}</span>
                <span className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider mt-1">Correct</span>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col items-center text-center shadow-sm">
                <div className="w-10 h-10 rounded-full bg-error-container/50 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-error text-[20px] fill">cancel</span>
                </div>
                <span className="text-2xl font-extrabold text-error">{wrongCount}</span>
                <span className="font-label-md text-[11px] text-on-surface-variant uppercase tracking-wider mt-1">Needs Review</span>
              </div>
            </div>

            <div className="w-full flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
              <button onClick={onClose} className="flex-1 bg-primary text-on-primary font-bold px-6 py-3 rounded-full flex items-center justify-center gap-1 hover:bg-primary-container transition-all cursor-pointer active:scale-95 shadow-md">
                <span className="material-symbols-outlined text-[18px]">done_all</span>
                <span>Done</span>
              </button>
              <button onClick={onRetake} className="flex-1 bg-surface-container-lowest text-primary border border-primary font-bold px-6 py-3 rounded-full flex items-center justify-center gap-1 hover:bg-surface-container-low transition-all cursor-pointer active:scale-95">
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                <span>Retake Quiz</span>
              </button>
              {wrongCount > 0 && (
                <button onClick={() => setShowErrorReview(true)} className="flex-1 bg-surface-container-lowest text-tertiary border border-tertiary-container font-bold px-6 py-3 rounded-full flex items-center justify-center gap-1 hover:bg-surface-container-low transition-all cursor-pointer active:scale-95">
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  <span>Review {wrongCount} Error{wrongCount > 1 ? 's' : ''}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-title-md text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-error">warning</span>
                Reviewing Mistakes
              </h2>
              <button onClick={() => setShowErrorReview(false)} className="text-primary text-xs font-bold hover:underline cursor-pointer">Back to Scores</button>
            </div>
            <div className="flex flex-col gap-4 mb-8 max-h-[480px] overflow-y-auto pr-1">
              {quiz.questions.filter(q => incorrectQuestionIds.includes(q.id)).map((q, i) => (
                <div key={q.id} className="bg-surface-container-lowest border border-outline-variant p-5 rounded-2xl shadow-sm">
                  <p className="font-label-md text-xs text-secondary uppercase mb-2">Mistake {i + 1}</p>
                  <h3 className="font-body-lg text-base font-semibold text-on-surface mb-4">{q.text}</h3>
                  <div className="flex flex-col gap-2">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = oIdx === q.correctOptionIndex;
                      return (
                        <div key={oIdx} className={`p-3 rounded-xl border text-sm flex items-center justify-between ${isCorrect ? 'bg-tertiary/10 border-tertiary text-tertiary font-medium' : 'border-outline-variant text-on-surface-variant'}`}>
                          <span>{opt}</span>
                          {isCorrect && <span className="material-symbols-outlined text-tertiary font-bold text-sm">check</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowErrorReview(false)} className="w-full bg-primary text-on-primary py-3 rounded-full hover:bg-primary-container transition-all cursor-pointer text-center font-bold">
              Finish Review
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
