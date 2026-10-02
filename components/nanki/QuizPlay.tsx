'use client';

import { useState, useEffect, useRef } from 'react';
import type { Quiz, Question } from '@/types/nanki';
import { branchKey, scoreQuiz, validQuestion } from '@/lib/quiz/scoring';
import { draftKey } from '@/lib/progress/storage';
import { showToast } from '@/lib/utils/toast';

interface QuizPlayProps {
  quiz: Quiz;
  userId: string;
  onClose: () => void;
  onComplete: (correct: number, wrong: number, incorrectIds: string[], userAnswers: Record<string, number | null>, attemptId: string, negativeMarking: boolean) => void;
}

export default function QuizPlay({ quiz, userId, onClose, onComplete }: QuizPlayProps) {
  const storageKey = draftKey(userId, quiz.id);
  const signature = JSON.stringify(quiz.questions);
  const [draft, setDraft] = useState(() => {
    const fresh = { started: !quiz.questions.some(q => q.type === 'true-false'), negativeMarking: false, attemptId: crypto.randomUUID(), signature, currentIdx: 0, selectedIdx: null as number | null, userAnswers: {} as Record<string, number | null>, flagged: {} as Record<string, boolean>, timeLeft: parseInt(quiz.questions[0]?.timer) || 20 };
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (saved?.signature === signature && typeof saved.attemptId === 'string' && Number.isInteger(saved.currentIdx) && saved.currentIdx >= 0 && saved.currentIdx < quiz.questions.length && Number.isFinite(saved.timeLeft) && saved.userAnswers && saved.flagged) return { ...fresh, ...saved } as typeof fresh;
    } catch {}
    return fresh;
  });
  const { currentIdx, selectedIdx, userAnswers, flagged, timeLeft } = draft;
  const finished = useRef(false);
  const storageWarning = useRef(false);
  const questions = quiz.questions;
  const currentQuestion: Question = questions[currentIdx];

  useEffect(() => {
    if (finished.current || !draft.started) return;
    try { localStorage.setItem(storageKey, JSON.stringify(draft)); }
    catch {
      if (!storageWarning.current) showToast.error('Cannot save your place in this browser', { description: 'Keep this quiz open to finish it.' });
      storageWarning.current = true;
    }
  }, [draft, storageKey]);

  const handleNext = () => {
    if (finished.current || !draft.started) return;
    const answers = currentQuestion.type === 'true-false' ? userAnswers : { ...userAnswers, [currentQuestion.id]: selectedIdx };
    if (currentIdx + 1 < questions.length) {
      setDraft(previous => ({ ...previous, userAnswers: answers, currentIdx: currentIdx + 1, selectedIdx: null, timeLeft: parseInt(questions[currentIdx + 1].timer) || 20 }));
    } else {
      finished.current = true;
      const score = scoreQuiz(quiz, answers, draft.negativeMarking);
      onComplete(score.correct, score.wrong + score.unanswered, score.incorrectIds, answers, draft.attemptId, draft.negativeMarking);
      try { localStorage.removeItem(storageKey); } catch {}
    }
  };

  useEffect(() => {
    if (finished.current || !draft.started) return;
    if (timeLeft <= 0) { handleNext(); return; }
    const id = setTimeout(() => setDraft(previous => ({ ...previous, timeLeft: previous.timeLeft - 1 })), 1000);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, currentIdx, draft.started]);

  const tf = currentQuestion.type === 'true-false';
  const canAdvance = tf || selectedIdx !== null;
  if (!questions.every(validQuestion)) return <div className="p-8"><p>This quiz has an incomplete True/False answer key. Edit it before playing.</p><button onClick={onClose}>Back</button></div>;
  if (!draft.started) return <div className="min-h-screen bg-surface flex items-center justify-center p-6">
    <main className="max-w-xl w-full rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 space-y-5">
      <h1 className="text-2xl font-bold">{quiz.title}</h1>
      <p className="text-sm text-secondary">{quiz.description}</p>
      <p>{questions.length} questions · {questions.reduce((sum, q) => sum + (q.type === 'true-false' ? q.options.length : 1), 0)} marks</p>
      <label className="flex gap-3 items-start text-sm"><input type="checkbox" checked={draft.negativeMarking} onChange={e => setDraft(p => ({ ...p, negativeMarking: e.target.checked }))} className="mt-1" /><span><strong>Use negative marking for True/False</strong><br />+1 for each correct statement, −0.5 for each wrong statement. Unanswered statements earn 0. Scores can be negative.</span></label>
      <p className="text-xs text-secondary">Without negative marking, wrong answers earn 0. Multiple-choice questions are never penalized. The setting is fixed once you start and retained when you resume.</p>
      <div className="flex gap-3"><button className="bg-primary text-on-primary rounded-full px-6 py-3 font-bold" onClick={() => setDraft(p => ({ ...p, started: true }))}>Start quiz</button><button onClick={onClose}>Back</button></div>
    </main>
  </div>;

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const progressPercent = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans flex flex-col antialiased">
      <header className="w-full flex justify-between items-center px-4 py-3 border-b border-outline-variant bg-surface-container-lowest sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container-high transition-colors flex items-center justify-center text-on-surface-variant cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
          <span className="font-title-md text-base md:text-lg font-bold text-on-surface truncate max-w-[180px] md:max-w-[400px]">{quiz.title}</span>
        </div>
        <div className="flex items-center gap-1.5 text-primary font-bold text-sm bg-primary-fixed px-3 py-1.5 rounded-full animate-pulse">
          <span className="material-symbols-outlined text-[18px]">timer</span>
          <span>{formatTime(timeLeft)}</span>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-6 md:py-10 w-full max-w-[800px] mx-auto relative overflow-hidden">
        <div className="absolute -top-12 -right-12 opacity-5 pointer-events-none select-none">
          <span className="material-symbols-outlined text-[180px] text-primary">psychology</span>
        </div>

        <div className="w-full mb-8 flex flex-col items-center z-10">
          <span className="font-label-md text-xs text-secondary uppercase tracking-wider mb-2">Question {currentIdx + 1} of {questions.length} · {draft.negativeMarking ? 'T/F penalty −0.5' : 'No penalty'}</span>
          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-tertiary-fixed-dim rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] z-10">
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-lg md:text-2xl text-on-surface mb-8 text-center leading-snug font-bold">{currentQuestion.text}</h2>
          <div className="flex flex-col gap-3">
            {tf && <p className="text-xs text-secondary">Answer each statement independently. {draft.negativeMarking ? 'Wrong answers: −0.5 each.' : 'No negative marking.'} Leave a statement unanswered to score 0.</p>}
            {tf ? currentQuestion.options.map((option, index) => {
              const key = branchKey(currentQuestion.id, index);
              const value = userAnswers[key];
              return <fieldset key={key} className="rounded-xl border border-outline-variant p-4 space-y-3">
                <legend className="text-sm font-semibold">{String.fromCharCode(65 + index)}. {option}</legend>
                <div className="flex flex-wrap gap-2">{[{ label: 'True', value: 1 }, { label: 'False', value: 0 }, { label: 'Unanswered', value: null }].map(choice => <button key={choice.label} type="button" aria-pressed={(value ?? null) === choice.value} onClick={() => setDraft(p => ({ ...p, userAnswers: { ...p.userAnswers, [key]: choice.value } }))} className={`rounded-lg px-4 py-2 border text-sm ${(value ?? null) === choice.value ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant'}`}>{choice.label}</button>)}</div>
              </fieldset>;
            }) : currentQuestion.options.map((option, index) => {
              const isSelected = selectedIdx === index;
              return (
                <label
                  key={index}
                  onClick={() => setDraft(p => ({ ...p, selectedIdx: index }))}
                  className={`group cursor-pointer relative flex items-center p-4 rounded-xl border transition-all duration-200 bg-surface-container-lowest transform active:scale-[0.99] ${
                    isSelected ? 'border-primary bg-primary-fixed/40 shadow-sm' : 'border-outline-variant hover:border-primary hover:bg-surface-container-low'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-all mr-3 flex items-center justify-center ${isSelected ? 'border-primary' : 'border-outline-variant'}`}>
                    {isSelected && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                  </div>
                  <span className={`font-body-lg text-sm md:text-base ${isSelected ? 'text-primary font-semibold' : 'text-on-surface'}`}>{option}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="w-full mt-8 flex justify-between items-center z-10">
          <button
            onClick={() => setDraft(p => ({ ...p, flagged: { ...p.flagged, [currentQuestion.id]: !p.flagged[currentQuestion.id] } }))}
            className={`font-label-md text-xs md:text-sm hover:text-on-surface transition-colors px-4 py-2 flex items-center gap-1.5 cursor-pointer rounded-full hover:bg-surface-container-low ${flagged[currentQuestion.id] ? 'text-orange-500 font-bold' : 'text-secondary'}`}
          >
            <span className={`material-symbols-outlined text-[18px] ${flagged[currentQuestion.id] ? 'fill text-orange-500' : ''}`}>flag</span>
            <span>{flagged[currentQuestion.id] ? 'Flagged' : 'Flag for review'}</span>
          </button>
          <button
            onClick={handleNext}
            disabled={!canAdvance}
            className={`font-label-md px-6 py-2.5 rounded-full transition-all transform active:scale-[0.97] flex items-center gap-1 border shadow-sm ${
              !canAdvance
                ? 'bg-surface-container-high text-outline border-outline-variant cursor-not-allowed opacity-60'
                : 'bg-primary text-on-primary border-primary hover:bg-primary-container hover:shadow-md cursor-pointer'
            }`}
          >
            <span>{currentIdx + 1 === questions.length ? 'Finish' : 'Next'}</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </main>
    </div>
  );
}
