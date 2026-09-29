'use client';

import { useState, useRef } from 'react';
import { useNankiStore } from '@/lib/nanki-store';
import { editorDraftKey } from '@/lib/editor/drafts';
import { useEditorDraft } from '@/lib/editor/use-editor-draft';
import VisibilityField from './VisibilityField';
import type { Quiz, Question } from '@/types/nanki';
import { OBGYN_QUIZ } from '@/lib/data/obgyn-quiz';

interface QuizEditorProps {
  quiz: Quiz | null;
  onSave: (quiz: Quiz) => Promise<boolean>;
  onClose: () => void;
}

function parseQuestionsFromText(text: string): Question[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const parsedQuestions: Question[] = [];

  let currentStem = '';
  let currentOptions: string[] = [];
  let currentCorrectIdx = 0;
  let hasSetCorrect = false;

  const flushQuestion = () => {
    if (currentStem && currentOptions.length >= 2) {
      const qId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `q-${Date.now()}-${parsedQuestions.length}`;

      parsedQuestions.push({
        id: qId,
        text: currentStem,
        timer: '30s',
        options: currentOptions.slice(0, 6),
        correctOptionIndex: currentCorrectIdx < currentOptions.length ? currentCorrectIdx : 0,
      });
    }
    currentStem = '';
    currentOptions = [];
    currentCorrectIdx = 0;
    hasSetCorrect = false;
  };

  const optionRegex = /^([A-Fa-f1-6][\.\)\:\-]\s*|\-\s+)(.+)$/;
  const answerLineRegex = /^(?:Ans(?:wer)?|Correct(?:\s+Option)?)\s*[:\-]?\s*([A-Fa-f1-6])/i;
  const questionNumberRegex = /^(?:(?:Q|Question)\s*\d+[\.\:\-]?|\d+[\.\)\:\-])\s*(.+)$/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for "Answer: X" line
    const ansMatch = line.match(answerLineRegex);
    if (ansMatch) {
      const char = ansMatch[1].toUpperCase();
      let idx = 0;
      if (/[A-F]/.test(char)) idx = char.charCodeAt(0) - 65;
      else if (/[1-6]/.test(char)) idx = parseInt(char, 10) - 1;
      if (idx >= 0 && idx < currentOptions.length) {
        currentCorrectIdx = idx;
        hasSetCorrect = true;
      }
      continue;
    }

    // Determine if line looks like an option
    const isLetterOption = /^[A-Fa-f][\.\)\:\-]\s*/.test(line);
    const isBulletOption = /^\-\s+/.test(line);
    const isNumberOption = /^[1-6][\.\)\:\-]\s*/.test(line);
    const isOptionCandidate = isLetterOption || isBulletOption || (isNumberOption && currentOptions.length > 0 && currentStem.length > 0);

    if (currentStem && isOptionCandidate) {
      const optMatch = line.match(optionRegex);
      let optText = optMatch ? optMatch[2].trim() : line.replace(/^[A-Fa-f1-6][\.\)\:\-]\s*/, '').trim();
      const isMarked = /\*|\(correct\)|\(ans\)|\[x\]/i.test(optText);
      optText = optText.replace(/\*|\(correct\)|\(ans\)|\[x\]/gi, '').trim();

      if (isMarked && !hasSetCorrect) {
        currentCorrectIdx = currentOptions.length;
        hasSetCorrect = true;
      }
      if (currentOptions.length < 6) {
        currentOptions.push(optText);
      }
      continue;
    }

    // Check for explicit Question Numbering (e.g. 1. Question stem...)
    const qNumMatch = line.match(questionNumberRegex);
    if (qNumMatch && !isLetterOption) {
      flushQuestion();
      currentStem = qNumMatch[1].trim();
      continue;
    }

    // If options are already collected and this line looks like a new question stem
    const isLikelyQuestionStem = /\?$|^(?:The following|Which|Regarding|Features|Concerning|Contraindications|Indications|What|About|There was)/i.test(line);
    if (currentOptions.length >= 2 && isLikelyQuestionStem) {
      flushQuestion();
      currentStem = line;
      continue;
    }

    // Stems & option continuation
    if (!currentStem) {
      currentStem = line;
    } else if (currentOptions.length === 0) {
      currentStem += ' ' + line;
    } else {
      currentOptions[currentOptions.length - 1] += ' ' + line;
    }
  }

  flushQuestion();
  return parsedQuestions;
}

export default function QuizEditor({ quiz, onSave, onClose }: QuizEditorProps) {
  const [published, setPublished] = useState(quiz?.published ?? false);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [title, setTitle] = useState(quiz?.title || '');
  const [description, setDescription] = useState(quiz?.description || '');
  const [category, setCategory] = useState(quiz?.category || 'Medicine');
  const [questions, setQuestions] = useState<Question[]>(
    quiz?.questions || [{ id: 'q-initial-1', text: 'What is the triad of watery, blood-stained vaginal discharge, abdominal pain, and pelvic mass?', timer: '30s', options: ["Latzko's triad", "Meigs' syndrome", "Fitz-Hugh-Curtis syndrome", "Saint's triad"], correctOptionIndex: 0 }]
  );

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const { userId } = useNankiStore();
  const draft = useEditorDraft(editorDraftKey(userId, 'quiz', quiz?.id), { published, title, description, category, questions, bulkText }, d => { setPublished(d.published); setTitle(d.title); setDescription(d.description); setCategory(d.category); setQuestions(d.questions); setBulkText(d.bulkText); });

  const generateUuid = () =>
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const addQuestion = () =>
    setQuestions(p => [...p, { id: generateUuid(), text: '', timer: '30s', options: ['Option 1', 'Option 2'], correctOptionIndex: 0 }]);

  const deleteQuestion = (id: string) => {
    if (questions.length > 1) setQuestions(p => p.filter(q => q.id !== id));
  };

  const duplicateQuestion = (q: Question) => {
    const dup = { ...q, id: generateUuid(), options: [...q.options] };
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

  const handleSave = async () => {
    if (savingRef.current) return;
    if (bulkText.trim()) { setSaveError('Apply or clear the pasted questions before saving. Your draft is preserved.'); return; }
    setSaveError('');
    savingRef.current = true;
    setSaving(true);
    try {
      const finalId = quiz?.id || generateUuid();
      const saved = await onSave({
        published,
        id: finalId,
        title: title.trim() || 'Untitled Quiz',
        description: description.trim() || 'No description provided.',
        category,
        masteredPercentage: quiz?.masteredPercentage || 0,
        questions: questions.map(q => ({ ...q, text: q.text.trim() || 'Untitled Question' })),
      });
      if (saved) draft.clear();
    } finally { savingRef.current = false; setSaving(false); }
  };

  const handleApplyBulk = (replace: boolean) => {
    const parsed = parseQuestionsFromText(bulkText);
    if (parsed.length === 0) {
      alert('Could not parse any questions. Please check the format (need question followed by at least 2 options).');
      return;
    }
    if (replace) {
      setQuestions(parsed);
    } else {
      setQuestions(prev => [...prev, ...parsed]);
    }
    setShowBulkModal(false);
    setBulkText('');
  };

  const handleLoadObgynExam = () => {
    setTitle(OBGYN_QUIZ.title);
    setDescription(OBGYN_QUIZ.description);
    setCategory(OBGYN_QUIZ.category);
    setQuestions(OBGYN_QUIZ.questions);
    setShowBulkModal(false);
  };

  const previewCount = bulkText.trim() ? parseQuestionsFromText(bulkText).length : 0;

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans flex flex-col antialiased pb-20">
      <fieldset disabled={saving || !draft.ready} className="contents">
      <header className="fixed top-0 w-full z-40 bg-surface-container-lowest border-b border-outline-variant shadow-sm px-4 py-3">
        <div className="max-w-[800px] mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={() => draft.close(onClose)} className="p-1.5 text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-full transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
            <h1 className="font-title-md text-base md:text-lg text-on-surface font-bold">{quiz ? 'Edit Quiz' : 'New Quiz'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-high hover:bg-surface-container text-on-surface rounded-full text-xs font-bold transition-all cursor-pointer border border-outline-variant hover:border-primary active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">playlist_add</span>
              <span>Bulk Import</span>
            </button>
            <button disabled={saving || !draft.ready} onClick={handleSave} className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-md hover:bg-primary-container active:scale-95 transition-all cursor-pointer shadow-sm text-sm">{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-[800px] mx-auto pt-20 px-4 flex flex-col gap-6">
        <p role="status" className="text-xs text-secondary">{draft.restored ? 'Restored your draft. ' : ''}{draft.status || 'Edits are autosaved on this device. Click Save to update your account.'}</p>
        {saveError && <p role="alert" className="text-sm text-error">{saveError}</p>}
        {(draft.restored || draft.status) && <button onClick={draft.discard} className="text-xs text-secondary underline self-start">Discard device draft</button>}
        <VisibilityField published={published} onChange={setPublished} />
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col gap-3">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Quiz Title (e.g. Obstetrics & Gynaecology MCQs)"
              className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 p-0 py-2 font-bold text-on-surface placeholder:text-outline text-lg md:text-2xl transition-colors focus:outline-none" />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Add a short description..." rows={2}
              className="w-full bg-transparent border-0 p-0 text-sm md:text-base text-on-surface-variant placeholder:text-outline focus:outline-none focus:ring-0 resize-none transition-colors" />
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-outline-variant/40">
              <span className="text-secondary font-label-md text-xs uppercase tracking-wide">Category:</span>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="bg-surface-container-low text-on-surface font-semibold text-xs rounded-lg border-outline-variant px-3 py-1 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer border">
                {['Medicine', 'Biology', 'History', 'Physics', 'Computer Science', 'Languages', 'Math', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
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
                        title={isCorrect ? 'Correct Option (click to change)' : 'Click to mark as correct answer'}
                        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all cursor-pointer ${isCorrect ? 'border-primary bg-primary text-on-primary ring-2 ring-primary/30' : 'border-outline-variant hover:border-primary bg-transparent text-transparent'}`}>
                        <span className="material-symbols-outlined text-[16px] font-bold select-none">{isCorrect ? 'check' : ''}</span>
                      </button>
                      <input type="text" value={option} onChange={e => updateOption(q.id, optIdx, e.target.value)} placeholder={`Option ${optIdx + 1}`}
                        className={`flex-1 rounded-xl px-3 py-1.5 text-sm transition-all focus:outline-none border ${isCorrect ? 'bg-primary/5 border-primary font-medium focus:border-primary focus:ring-1 focus:ring-primary' : 'bg-surface-bright border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary-fixed'}`} />
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

      {/* ── Bulk Import Modal ── */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant">
              <div>
                <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">playlist_add</span>
                  Bulk Import Questions
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Paste multiple-choice questions from past papers or notes. Questions and options are auto-detected.
                </p>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="p-1 rounded-full text-secondary hover:text-on-surface hover:bg-surface-container-low">
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Quick 1-click preset */}
            <div className="my-3 p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-primary">⚡ Ready-made High-Yield Exam:</p>
                <p className="text-[11px] text-on-surface-variant">Load all 44 Obstetrics & Gynaecology MCQs with verified correct answers.</p>
              </div>
              <button
                type="button"
                onClick={handleLoadObgynExam}
                className="px-3 py-1.5 bg-primary text-on-primary hover:bg-primary-container text-xs font-bold rounded-lg transition-transform active:scale-95 shadow-sm cursor-pointer"
              >
                Load All 44 Questions
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col py-2">
              <label className="text-xs font-semibold text-secondary mb-1 flex justify-between">
                <span>Or Paste Raw Question Text:</span>
                {previewCount > 0 && (
                  <span className="text-primary font-bold">{previewCount} questions recognized</span>
                )}
              </label>
              <textarea
                value={bulkText}
                onChange={e => setBulkText(e.target.value)}
                placeholder={`Example Format:

1. Triad of watery, blood stained vaginal discharge, abdominal pain and pelvic mass is?
A. Latzko triad *
B. Meigg triad
C. Fitz-Hugh-Curtis syndrome
D. Saint's triad

2. Which is not an emergency contraception?
A. Ella One
B. Levonorgestrel only
C. Nonoxynol-9 *`}
                className="w-full flex-1 min-h-[220px] bg-surface-bright border border-outline-variant rounded-xl p-3 text-xs md:text-sm font-mono text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <div className="pt-3 border-t border-outline-variant flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-on-surface-variant">
                Tip: Mark the correct answer with an asterisk (e.g. <code className="bg-surface-container px-1 py-0.5 rounded">*</code>) or write <code className="bg-surface-container px-1 py-0.5 rounded">Answer: B</code>.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-secondary hover:text-on-surface rounded-xl hover:bg-surface-container-low transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyBulk(false)}
                  disabled={previewCount === 0}
                  className="px-4 py-2 text-xs font-bold bg-surface-container-high hover:bg-surface-container text-on-surface border border-outline-variant rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Append ({previewCount})
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyBulk(true)}
                  disabled={previewCount === 0}
                  className="px-4 py-2 text-xs font-bold bg-primary text-on-primary hover:bg-primary-container rounded-xl shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Replace All ({previewCount})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </fieldset>
    </div>
  );
}
