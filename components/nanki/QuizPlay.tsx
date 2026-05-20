'use client';

import { useState, useEffect } from 'react';
import type { Quiz, Question } from '@/types/nanki';

interface QuizPlayProps {
  quiz: Quiz;
  onClose: () => void;
  onComplete: (correct: number, wrong: number, incorrectIds: string[]) => void;
}

export default function QuizPlay({ quiz, onClose, onComplete }: QuizPlayProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(45);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [incorrectQuestionIds, setIncorrectQuestionIds] = useState<string[]>([]);

  const questions = quiz.questions;
  const currentQuestion: Question = questions[currentIdx] || { id: 'empty', text: 'Undefined', options: ['A', 'B'], correctOptionIndex: 0, timer: '20s' };

  useEffect(() => {
    const t = parseInt(currentQuestion.timer) || 20;
    setTimeLeft(t);
    setSelectedIdx(null);
  }, [currentIdx, currentQuestion.timer]);

  useEffect(() => {
    if (timeLeft <= 0) { handleNext(); return; }
    const id = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const handleNext = () => {
    const isCorrect = selectedIdx === currentQuestion.correctOptionIndex;
    const newCorrect = isCorrect ? correctAnswersCount + 1 : correctAnswersCount;
    const newIncorrect = isCorrect ? incorrectQuestionIds : [...incorrectQuestionIds, currentQuestion.id];

    if (currentIdx + 1 < questions.length) {
      if (isCorrect) setCorrectAnswersCount(p => p + 1);
      else setIncorrectQuestionIds(p => [...p, currentQuestion.id]);
      setCurrentIdx(p => p + 1);
    } else {
      onComplete(newCorrect, questions.length - newCorrect, newIncorrect);
    }
  };

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
          <span className="font-label-md text-xs text-secondary uppercase tracking-wider mb-2">Question {currentIdx + 1} of {questions.length}</span>
          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-tertiary-fixed-dim rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] z-10">
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-lg md:text-2xl text-on-surface mb-8 text-center leading-snug font-bold">{currentQuestion.text}</h2>
          <div className="flex flex-col gap-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedIdx === index;
              return (
                <label
                  key={index}
                  onClick={() => setSelectedIdx(index)}
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
            onClick={() => setFlagged(p => ({ ...p, [currentQuestion.id]: !p[currentQuestion.id] }))}
            className={`font-label-md text-xs md:text-sm hover:text-on-surface transition-colors px-4 py-2 flex items-center gap-1.5 cursor-pointer rounded-full hover:bg-surface-container-low ${flagged[currentQuestion.id] ? 'text-orange-500 font-bold' : 'text-secondary'}`}
          >
            <span className={`material-symbols-outlined text-[18px] ${flagged[currentQuestion.id] ? 'fill text-orange-500' : ''}`}>flag</span>
            <span>{flagged[currentQuestion.id] ? 'Flagged' : 'Flag for review'}</span>
          </button>
          <button
            onClick={handleNext}
            disabled={selectedIdx === null}
            className={`font-label-md px-6 py-2.5 rounded-full transition-all transform active:scale-[0.97] flex items-center gap-1 border shadow-sm ${
              selectedIdx === null
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
