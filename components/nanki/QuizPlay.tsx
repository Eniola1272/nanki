'use client';

import { useState, useEffect, useRef } from 'react';
import type { Quiz, Question } from '@/types/nanki';
import { branchKey, scoreQuiz, validQuestion } from '@/lib/quiz/scoring';
import { draftKey } from '@/lib/progress/storage';
import { showToast } from '@/lib/utils/toast';

type QuizMode = 'learning' | 'marathon';

interface QuizPlayProps {
  quiz: Quiz;
  userId: string;
  onClose: () => void;
  onComplete: (correct: number, wrong: number, incorrectIds: string[], userAnswers: Record<string, number | null>, attemptId: string, negativeMarking: boolean) => void;
}

/* ── Inline review card shown after each question in Learning Mode ── */
function LearningReview({ question, userAnswers, questionIndex, totalQuestions, onContinue }: {
  question: Question;
  userAnswers: Record<string, number | null>;
  questionIndex: number;
  totalQuestions: number;
  onContinue: () => void;
}) {
  const tf = question.type === 'true-false';

  // Score just this one question
  let questionCorrect = 0;
  let questionTotal = 0;
  let allCorrect = true;

  if (tf) {
    for (let i = 0; i < question.options.length; i++) {
      questionTotal++;
      const answer = userAnswers[branchKey(question.id, i)];
      const expected = Number(question.correctTruthValues![i]);
      if (answer === expected) questionCorrect++;
      else allCorrect = false;
    }
  } else {
    questionTotal = 1;
    const selected = userAnswers[question.id];
    if (selected === question.correctOptionIndex) questionCorrect = 1;
    else allCorrect = false;
  }

  return (
    <div className="w-full animate-fadeIn">
      {/* Result banner */}
      <div className={`rounded-2xl p-4 mb-5 flex items-center gap-3 ${allCorrect ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-rose-500/10 border border-rose-500/30'}`}>
        <span className={`material-symbols-outlined text-[28px] fill ${allCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
          {allCorrect ? 'check_circle' : 'cancel'}
        </span>
        <div>
          <p className={`font-bold text-sm ${allCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
            {allCorrect ? 'Correct!' : `${questionCorrect}/${questionTotal} correct`}
          </p>
          <p className="text-xs text-secondary">Question {questionIndex + 1} of {totalQuestions}</p>
        </div>
      </div>

      {/* Question text */}
      <h2 className="font-bold text-lg md:text-xl text-on-surface mb-5 leading-snug">{question.text}</h2>

      {/* Answer review */}
      {tf ? (
        <div className="flex flex-col gap-3 mb-6">
          {question.options.map((option, index) => {
            const answer = userAnswers[branchKey(question.id, index)];
            const expected = question.correctTruthValues?.[index];
            const correct = answer === Number(expected);
            return (
              <div key={index} className={`rounded-xl border p-3.5 text-sm space-y-2 ${correct ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-rose-500/40 bg-rose-500/5'}`}>
                <p className="font-semibold">{String.fromCharCode(65 + index)}. {option}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold ${correct ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'}`}>
                    <span className="material-symbols-outlined text-[13px] font-bold">{correct ? 'check' : 'close'}</span>
                    Your answer: {answer === 1 ? 'True' : answer === 0 ? 'False' : 'Unanswered'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold bg-surface-container-high text-on-surface-variant border border-outline-variant">
                    Correct: {expected ? 'True' : 'False'}
                  </span>
                </div>
                {question.branchExplanations?.[index] && (
                  <p className="text-xs text-secondary mt-1">{question.branchExplanations[index]}</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 mb-6">
          {question.options.map((opt, oIdx) => {
            const isCorrect = oIdx === question.correctOptionIndex;
            const userChoice = userAnswers[question.id];
            const isUserChoice = userChoice === oIdx;
            const isWrongUserChoice = isUserChoice && !isCorrect;

            let cardStyle = 'border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant opacity-75';
            let badgeCircleStyle = 'border-outline-variant bg-surface-container-low text-secondary';

            if (isCorrect) {
              cardStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-semibold ring-1 ring-emerald-500/30 opacity-100 shadow-sm';
              badgeCircleStyle = 'border-emerald-500 bg-emerald-500 text-white';
            } else if (isWrongUserChoice) {
              cardStyle = 'bg-rose-500/10 border-rose-500 text-rose-950 dark:text-rose-100 font-semibold ring-1 ring-rose-500/30 opacity-100 shadow-sm';
              badgeCircleStyle = 'border-rose-500 bg-rose-500 text-white';
            }

            return (
              <div key={oIdx} className={`p-3.5 rounded-xl border text-xs md:text-sm flex items-center justify-between gap-3 transition-all ${cardStyle}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border flex-shrink-0 ${badgeCircleStyle}`}>
                    {String.fromCharCode(65 + oIdx)}
                  </span>
                  <span className="leading-normal">{opt}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isWrongUserChoice && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-300 dark:border-rose-800">
                      <span className="material-symbols-outlined text-[15px] font-bold">close</span>
                      Your Pick
                    </span>
                  )}
                  {isCorrect && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                      <span className="material-symbols-outlined text-[15px] font-bold">check</span>
                      {isUserChoice ? 'Your Pick (Correct)' : 'Correct Answer'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Explanation */}
      {question.explanation && (
        <div className="rounded-xl bg-surface-container-low border border-outline-variant p-4 mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary">lightbulb</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Explanation</span>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">{question.explanation}</p>
        </div>
      )}

      {/* Continue button */}
      <button
        onClick={onContinue}
        className="w-full bg-primary text-on-primary font-bold px-6 py-3 rounded-full flex items-center justify-center gap-2 hover:bg-primary-container transition-all cursor-pointer active:scale-95 shadow-md touch-manipulation select-none"
      >
        <span>{questionIndex + 1 === totalQuestions ? 'See Results' : 'Next Question'}</span>
        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </button>
    </div>
  );
}

export default function QuizPlay({ quiz, userId, onClose, onComplete }: QuizPlayProps) {
  const storageKey = draftKey(userId, quiz.id);
  const signature = JSON.stringify(quiz.questions);
  const [draft, setDraft] = useState(() => {
    const fresh = { started: !quiz.questions.some(q => q.type === 'true-false'), negativeMarking: false, attemptId: crypto.randomUUID(), signature, currentIdx: 0, selectedIdx: null as number | null, userAnswers: {} as Record<string, number | null>, flagged: {} as Record<string, boolean>, timeLeft: parseInt(quiz.questions[0]?.timer) || 20, mode: null as QuizMode | null, reviewing: false };
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

  // Mode not yet chosen = show pre-game. For quizzes WITHOUT T/F questions,
  // `started` was originally `true` immediately; now we require a mode pick too.
  const needsModeSelect = draft.mode === null;

  useEffect(() => {
    if (finished.current || !draft.started || needsModeSelect) return;
    try { localStorage.setItem(storageKey, JSON.stringify(draft)); }
    catch {
      if (!storageWarning.current) showToast.error('Cannot save your place in this browser', { description: 'Keep this quiz open to finish it.' });
      storageWarning.current = true;
    }
  }, [draft, storageKey, needsModeSelect]);

  const handleNext = () => {
    if (finished.current || !draft.started || needsModeSelect) return;
    const answers = currentQuestion.type === 'true-false' ? userAnswers : { ...userAnswers, [currentQuestion.id]: selectedIdx };

    // Learning mode: show review before advancing
    if (draft.mode === 'learning' && !draft.reviewing) {
      // Commit current answer and switch to review state
      setDraft(previous => ({ ...previous, userAnswers: answers, reviewing: true }));
      return;
    }

    if (currentIdx + 1 < questions.length) {
      setDraft(previous => ({ ...previous, userAnswers: answers, currentIdx: currentIdx + 1, selectedIdx: null, timeLeft: parseInt(questions[currentIdx + 1].timer) || 20, reviewing: false }));
    } else {
      finished.current = true;
      const score = scoreQuiz(quiz, answers, draft.negativeMarking);
      onComplete(score.correct, score.wrong + score.unanswered, score.incorrectIds, answers, draft.attemptId, draft.negativeMarking);
      try { localStorage.removeItem(storageKey); } catch {}
    }
  };

  // Timer: only ticks when NOT in review state
  useEffect(() => {
    if (finished.current || !draft.started || needsModeSelect || draft.reviewing) return;
    if (timeLeft <= 0) { handleNext(); return; }
    const id = setTimeout(() => setDraft(previous => ({ ...previous, timeLeft: previous.timeLeft - 1 })), 1000);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, currentIdx, draft.started, needsModeSelect, draft.reviewing]);

  const tf = currentQuestion.type === 'true-false';
  const canAdvance = tf || selectedIdx !== null;
  if (!questions.every(validQuestion)) return <div className="p-8"><p>This quiz has an incomplete True/False answer key. Edit it before playing.</p><button onClick={onClose}>Back</button></div>;

  /* ── Pre-game screen: mode select + options ── */
  if (!draft.started || needsModeSelect) return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <main className="max-w-xl w-full rounded-3xl border border-outline-variant bg-surface-container-lowest p-6 space-y-6">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <p className="text-sm text-secondary">{quiz.description}</p>
        <p>{questions.length} questions · {questions.reduce((sum, q) => sum + (q.type === 'true-false' ? q.options.length : 1), 0)} marks</p>

        {/* Mode selector */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-secondary">Choose your mode</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setDraft(p => ({ ...p, mode: 'learning' }))}
              className={`group relative text-left p-4 rounded-2xl border-2 transition-all duration-150 cursor-pointer active:scale-[0.97] touch-manipulation select-none ${draft.mode === 'learning' ? 'border-primary bg-primary-fixed/30 shadow-md' : 'border-outline-variant hover:border-primary/50 hover:bg-surface-container-low'}`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${draft.mode === 'learning' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-secondary'}`}>
                  <span className="material-symbols-outlined text-[20px]">school</span>
                </div>
                <span className="font-bold text-on-surface">Learning</span>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                Review each answer as you go. After every question, see what&apos;s correct and learn from mistakes before moving on.
              </p>
            </button>
            <button
              onClick={() => setDraft(p => ({ ...p, mode: 'marathon' }))}
              className={`group relative text-left p-4 rounded-2xl border-2 transition-all duration-150 cursor-pointer active:scale-[0.97] touch-manipulation select-none ${draft.mode === 'marathon' ? 'border-primary bg-primary-fixed/30 shadow-md' : 'border-outline-variant hover:border-primary/50 hover:bg-surface-container-low'}`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${draft.mode === 'marathon' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-secondary'}`}>
                  <span className="material-symbols-outlined text-[20px]">sprint</span>
                </div>
                <span className="font-bold text-on-surface">Marathon</span>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                Answer all questions under timed conditions. See your full results and review at the end — like a real exam.
              </p>
            </button>
          </div>
        </div>

        {/* Negative marking toggle (always show if there are T/F questions) */}
        {quiz.questions.some(q => q.type === 'true-false') && (
          <>
            <label className="flex gap-3 items-start text-sm"><input type="checkbox" checked={draft.negativeMarking} onChange={e => setDraft(p => ({ ...p, negativeMarking: e.target.checked }))} className="mt-1" /><span><strong>Use negative marking for True/False</strong><br />+1 for each correct statement, −0.5 for each wrong statement. Unanswered statements earn 0. Scores can be negative.</span></label>
            <p className="text-xs text-secondary">Without negative marking, wrong answers earn 0. Multiple-choice questions are never penalized. The setting is fixed once you start and retained when you resume.</p>
          </>
        )}

        <div className="flex gap-3">
          <button
            className={`rounded-full px-6 py-3 font-bold transition-all duration-150 active:scale-95 touch-manipulation select-none ${draft.mode ? 'bg-primary text-on-primary cursor-pointer hover:bg-primary-container shadow-md' : 'bg-surface-container-high text-outline cursor-not-allowed opacity-60'}`}
            disabled={!draft.mode}
            onClick={() => setDraft(p => ({ ...p, started: true }))}
          >
            Start quiz
          </button>
          <button onClick={onClose}>Back</button>
        </div>
      </main>
    </div>
  );

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const progressPercent = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0;

  /* ── Learning mode: review state (answers revealed for current question) ── */
  if (draft.mode === 'learning' && draft.reviewing) {
    return (
      <div className="min-h-screen bg-surface text-on-surface font-sans flex flex-col antialiased">
        <header className="w-full flex justify-between items-center px-4 py-3 border-b border-outline-variant bg-surface-container-lowest sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container-high transition-colors flex items-center justify-center text-on-surface-variant cursor-pointer">
              <span className="material-symbols-outlined">close</span>
            </button>
            <span className="font-title-md text-base md:text-lg font-bold text-on-surface truncate max-w-[180px] md:max-w-[400px]">{quiz.title}</span>
          </div>
          <div className="flex items-center gap-1.5 text-primary font-bold text-sm bg-primary-fixed px-3 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-[18px]">school</span>
            <span>Learning</span>
          </div>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center px-4 py-6 md:py-10 w-full max-w-[800px] mx-auto relative overflow-hidden">
          <div className="w-full mb-6 flex flex-col items-center z-10">
            <span className="font-label-md text-xs text-secondary uppercase tracking-wider mb-2">
              Review — Question {currentIdx + 1} of {questions.length}
            </span>
            <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-tertiary-fixed-dim rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] z-10">
            <LearningReview
              question={currentQuestion}
              userAnswers={userAnswers}
              questionIndex={currentIdx}
              totalQuestions={questions.length}
              onContinue={handleNext}
            />
          </div>
        </main>
      </div>
    );
  }

  /* ── Normal question-answering UI (both modes) ── */
  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans flex flex-col antialiased">
      <header className="w-full flex justify-between items-center px-4 py-3 border-b border-outline-variant bg-surface-container-lowest sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container-high transition-colors flex items-center justify-center text-on-surface-variant cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
          <span className="font-title-md text-base md:text-lg font-bold text-on-surface truncate max-w-[180px] md:max-w-[400px]">{quiz.title}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Mode badge */}
          <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${draft.mode === 'learning' ? 'bg-primary-fixed text-primary' : 'bg-tertiary-fixed text-tertiary'}`}>
            <span className="material-symbols-outlined text-[14px]">{draft.mode === 'learning' ? 'school' : 'sprint'}</span>
            <span className="hidden sm:inline">{draft.mode === 'learning' ? 'Learning' : 'Marathon'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-primary font-bold text-sm bg-primary-fixed px-3 py-1.5 rounded-full animate-pulse">
            <span className="material-symbols-outlined text-[18px]">timer</span>
            <span>{formatTime(timeLeft)}</span>
          </div>
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

        <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] z-10">
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-lg md:text-2xl text-on-surface mb-8 text-center leading-snug font-bold">{currentQuestion.text}</h2>
          <div className="flex flex-col gap-3">
            {tf && <p className="text-xs text-secondary">Answer each statement independently. {draft.negativeMarking ? 'Wrong answers: −0.5 each.' : 'No negative marking.'} Leave a statement unanswered to score 0.</p>}
            {tf ? currentQuestion.options.map((option, index) => {
              const key = branchKey(currentQuestion.id, index);
              const value = userAnswers[key];
              return <fieldset key={key} className="rounded-xl border border-outline-variant p-4 space-y-3">
                <legend className="text-sm font-semibold">{String.fromCharCode(65 + index)}. {option}</legend>
                <div className="flex flex-wrap gap-2">{[{ label: 'True', value: 1 }, { label: 'False', value: 0 }, { label: 'Unanswered', value: null }].map(choice => <button key={choice.label} type="button" aria-pressed={(value ?? null) === choice.value} onClick={() => setDraft(p => ({ ...p, userAnswers: { ...p.userAnswers, [key]: choice.value } }))} className={`rounded-xl px-4 py-2.5 border text-sm font-medium transition-all duration-150 active:scale-92 cursor-pointer touch-manipulation select-none ${(value ?? null) === choice.value ? 'bg-primary text-on-primary border-primary shadow-sm' : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'}`}>{choice.label}</button>)}</div>
              </fieldset>;
            }) : currentQuestion.options.map((option, index) => {
              const isSelected = selectedIdx === index;
              return (
                <label
                  key={index}
                  onClick={() => setDraft(p => ({ ...p, selectedIdx: index }))}
                  className={`quiz-option-choice group cursor-pointer relative flex items-center p-4 rounded-xl border transition-all duration-150 bg-surface-container-lowest transform active:scale-[0.97] select-none touch-manipulation ${
                    isSelected ? 'border-primary bg-primary-fixed/40 shadow-sm' : 'border-outline-variant hover:border-primary hover:bg-surface-container-low'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-all duration-150 mr-3 flex items-center justify-center ${isSelected ? 'border-primary' : 'border-outline-variant'}`}>
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
            className={`font-label-md text-xs md:text-sm hover:text-on-surface transition-all duration-150 active:scale-90 px-4 py-2 flex items-center gap-1.5 cursor-pointer rounded-full hover:bg-surface-container-low touch-manipulation select-none ${flagged[currentQuestion.id] ? 'text-orange-500 font-bold' : 'text-secondary'}`}
          >
            <span className={`material-symbols-outlined text-[18px] transition-transform duration-150 ${flagged[currentQuestion.id] ? 'fill text-orange-500' : ''}`}>flag</span>
            <span>{flagged[currentQuestion.id] ? 'Flagged' : 'Flag for review'}</span>
          </button>
          <button
            onClick={handleNext}
            disabled={!canAdvance}
            className={`font-label-md px-6 py-2.5 rounded-full transition-all duration-150 transform active:scale-95 flex items-center gap-1 border shadow-sm touch-manipulation select-none ${
              !canAdvance
                ? 'bg-surface-container-high text-outline border-outline-variant cursor-not-allowed opacity-60'
                : 'bg-primary text-on-primary border-primary hover:bg-primary-container hover:shadow-md cursor-pointer'
            }`}
          >
            <span>{draft.mode === 'learning' ? 'Check Answer' : (currentIdx + 1 === questions.length ? 'Finish' : 'Next')}</span>
            <span className="material-symbols-outlined text-[18px] transition-transform duration-150">arrow_forward</span>
          </button>
        </div>
      </main>
    </div>
  );
}
