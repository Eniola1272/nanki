'use client';

import { useState } from 'react';
import type { Quiz, Question } from '@/types/nanki';

interface QuizEditorProps {
  quiz: Quiz | null;
  onSave: (quiz: Quiz) => void;
  onClose: () => void;
}

export default function QuizEditor({ quiz, onSave, onClose }: QuizEditorProps) {
  const [title, setTitle] = useState(quiz?.title || '');
  const [description, setDescription] = useState(quiz?.description || '');
  const [category, setCategory] = useState(quiz?.category || 'Biology');
  const [questions, setQuestions] = useState<Question[]>(
    quiz?.questions || [{ id: 'q-initial-1', text: 'What is the powerhouse of the cell?', timer: '20s', options: ['Nucleus', 'Mitochondria', 'Ribosome'], correctOptionIndex: 1 }]
  );

  const addQuestion = () => setQuestions(p => [...p, { id: `q-${Date.now()}`, text: '', timer: '20s', options: ['Option 1', 'Option 2'], correctOptionIndex: 0 }]);

  const deleteQuestion = (id: string) => { if (questions.length > 1) setQuestions(p => p.filter(q => q.id !== id)); };

  const duplicateQuestion = (q: Question) => {
    const dup = { ...q, id: `q-dup-${Date.now()}`, options: [...q.options] };
    const idx = questions.findIndex(item => item.id === q.id);
    const updated = [...questions];
    updated.splice(idx + 1, 0, dup);
    setQuestions(updated);
  };

  const updateField = (id: string, field: keyof Question, value: unknown) =>
    setQuestions(p => p.map(q => q.id === id ? { ...q, [field]: value } : q));

  const updateOption = (qId: string, optIdx: number, val: string) =>
    setQuestions(p => p.map(q => q.id === qId ? { ...q, options: q.options.map((o, i) => i === optIdx ? val : o) } : q));

  const addOption = (qId: string) =>
    setQuestions(p => p.map(q => q.id === qId && q.options.length < 6 ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] } : q));

  const removeOption = (qId: string, optIdx: number) =>
    setQuestions(p => p.map(q => {
      if (q.id !== qId || q.options.length <= 2) return q;
      const opts = q.options.filter((_, i) => i !== optIdx);
      let ci = q.correctOptionIndex;
      if (ci === optIdx) ci = 0;
      else if (ci > optIdx) ci -= 1;
      return { ...q, options: opts, correctOptionIndex: ci };
    }));

  const handleSave = () => {
    onSave({
      id: quiz?.id || `quiz-${Date.now()}`,
      title: title.trim() || 'Untitled Quiz',
      description: description.trim() || 'No description provided.',
      category,
      masteredPercentage: quiz?.masteredPercentage || 0,
      questions: questions.map(q => ({ ...q, text: q.text.trim() || 'Untitled Question' })),
    });
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans flex flex-col antialiased pb-20">
      <header className="fixed top-0 w-full z-40 bg-surface-container-lowest border-b border-outline-variant shadow-sm px-4 py-3">
        <div className="max-w-[800px] mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-1.5 text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-full transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
            <h1 className="font-title-md text-base md:text-lg text-on-surface font-bold">{quiz ? 'Edit Quiz' : 'New Quiz'}</h1>
          </div>
          <button onClick={handleSave} className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-md hover:bg-primary-container active:scale-95 transition-all cursor-pointer shadow-sm text-sm">Save</button>
        </div>
      </header>

      <main className="flex-grow w-full max-w-[800px] mx-auto pt-20 px-4 flex flex-col gap-6">
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col gap-3">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Quiz Title (e.g. Cellular Biology)"
              className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 p-0 py-2 font-bold text-on-surface placeholder:text-outline text-lg md:text-2xl transition-colors focus:outline-none" />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Add a short description..." rows={2}
              className="w-full bg-transparent border-0 p-0 text-sm md:text-base text-on-surface-variant placeholder:text-outline focus:outline-none focus:ring-0 resize-none transition-colors" />
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-outline-variant/40">
              <span className="text-secondary font-label-md text-xs uppercase tracking-wide">Category:</span>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="bg-surface-container-low text-on-surface font-semibold text-xs rounded-lg border-outline-variant px-3 py-1 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer border">
                {['Biology', 'History', 'Physics', 'Computer Science', 'Languages', 'Math', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-5">
          {questions.map((q, qIndex) => (
            <article key={q.id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 flex flex-col gap-4 relative group shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-center text-secondary">
                <div className="flex items-center gap-1 cursor-grab">
                  <span className="material-symbols-outlined text-[20px] select-none text-outline">drag_indicator</span>
                  <span className="font-label-md text-xs uppercase tracking-wider font-extrabold text-secondary">Question {qIndex + 1}</span>
                </div>
                <div className="flex items-center gap-1 opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => duplicateQuestion(q)} className="text-on-surface-variant hover:text-primary p-1.5 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer" title="Duplicate">
                    <span className="material-symbols-outlined text-[20px]">content_copy</span>
                  </button>
                  {questions.length > 1 && (
                    <button onClick={() => deleteQuestion(q.id)} className="text-on-surface-variant hover:text-error p-1.5 rounded-full hover:bg-error-container/30 transition-colors cursor-pointer" title="Delete">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  )}
                </div>
              </div>

              <textarea value={q.text} onChange={e => updateField(q.id, 'text', e.target.value)} placeholder="Type your question here..." rows={2}
                className="w-full bg-surface-bright border border-outline-variant rounded-xl p-3 text-sm md:text-base text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed transition-all resize-y" />

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 px-3 py-1 border border-outline-variant rounded-full text-xs text-on-surface-variant bg-surface-container-lowest shadow-sm relative">
                  <span className="material-symbols-outlined text-[18px]">timer</span>
                  <select value={q.timer} onChange={e => updateField(q.id, 'timer', e.target.value)}
                    className="bg-transparent border-0 font-semibold p-0 pr-4 text-xs text-on-surface focus:ring-0 focus:outline-none cursor-pointer">
                    {['10s', '15s', '20s', '30s', '45s', '60s'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <hr className="border-outline-variant/60" />

              <div className="flex flex-col gap-3">
                {q.options.map((option, optIdx) => {
                  const isCorrect = q.correctOptionIndex === optIdx;
                  return (
                    <div key={optIdx} className="flex items-center gap-3 group/opt">
                      <button onClick={() => updateField(q.id, 'correctOptionIndex', optIdx)}
                        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${isCorrect ? 'border-tertiary-container bg-tertiary-container text-on-tertiary animate-pulse' : 'border-outline-variant hover:border-outline bg-transparent'}`}>
                        {isCorrect && <span className="material-symbols-outlined text-[16px] font-bold select-none fill">check</span>}
                      </button>
                      <input type="text" value={option} onChange={e => updateOption(q.id, optIdx, e.target.value)} placeholder={`Option ${optIdx + 1}`}
                        className={`flex-1 rounded-xl px-3 py-1.5 text-sm transition-all focus:outline-none border ${isCorrect ? 'bg-surface-container-lowest border-tertiary-container focus:border-tertiary-container focus:ring-1 focus:ring-tertiary-fixed' : 'bg-surface-bright border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary-fixed'}`} />
                      {q.options.length > 2 && (
                        <button onClick={() => removeOption(q.id, optIdx)} className="text-outline hover:text-on-surface p-1 rounded-full opacity-60 hover:opacity-100 cursor-pointer">
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pl-9">
                <button onClick={() => addOption(q.id)} disabled={q.options.length >= 6}
                  className={`font-label-md text-xs flex items-center gap-1 transition-colors py-1 cursor-pointer ${q.options.length >= 6 ? 'text-outline opacity-50 cursor-not-allowed' : 'text-primary hover:text-primary-container'}`}>
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Add Option</span>
                </button>
              </div>
            </article>
          ))}
        </div>

        <button onClick={addQuestion}
          className="w-full py-4 border-2 border-dashed border-outline-variant rounded-2xl text-on-surface-variant text-sm md:text-base flex justify-center items-center gap-2 hover:bg-surface-container-low hover:border-outline hover:text-on-surface transition-all cursor-pointer group active:scale-98 shadow-sm">
          <span className="material-symbols-outlined text-[24px] group-hover:text-primary transition-colors">add_circle</span>
          <span>Add Question</span>
        </button>
      </main>
    </div>
  );
}
