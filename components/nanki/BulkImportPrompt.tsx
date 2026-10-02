'use client';

import { useRef, useState } from 'react';
import { BULK_IMPORT_PROMPT, TRUE_FALSE_IMPORT_PROMPT, TRUE_FALSE_IMPORT_EXAMPLE } from '@/lib/quiz/import-prompt';

export default function BulkImportPrompt() {
  const [mode, setMode] = useState<'mixed' | 'true-false'>('true-false');
  const prompt = mode === 'true-false' ? TRUE_FALSE_IMPORT_PROMPT : BULK_IMPORT_PROMPT;
  const [expanded, setExpanded] = useState(false);
  const [copying, setCopying] = useState(false);
  const [message, setMessage] = useState('');
  const promptField = useRef<HTMLTextAreaElement>(null);

  const copyPrompt = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(prompt);
      setMessage(`${mode === 'true-false' ? 'True/False' : 'Mixed quiz'} prompt copied. Paste it into your chatbot with your question bank and answer key.`);
    } catch {
      setExpanded(true);
      setMessage('Clipboard access is unavailable. Select the prompt below and copy it manually.');
    } finally { setCopying(false); }
  };

  return <section className="mt-3 shrink-0 rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-3" aria-label="AI formatting prompt">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-sm font-bold text-primary">Format your questions with AI</h3>
      <button type="button" onClick={() => void copyPrompt()} disabled={copying} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-on-primary disabled:opacity-50">
        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">content_copy</span>
        {copying ? 'Copying…' : mode === 'true-false' ? 'Copy True/False prompt' : 'Copy mixed quiz prompt'}
      </button>
    </div>
    <label className="flex flex-wrap items-center gap-2 text-xs font-semibold text-on-surface">Quiz format
      <select value={mode} disabled={copying} onChange={e => { setMode(e.target.value as 'mixed' | 'true-false'); setMessage(''); }} className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2">
        <option value="true-false">True/False for every statement</option>
        <option value="mixed">Multiple-choice / mixed questions</option>
      </select>
    </label>
    {mode === 'true-false' && <p className="text-xs text-secondary">Each branch gets its own T/F answer. Supports A–D, A–E, and up to six statements per question.</p>}
    <ol className="list-decimal pl-4 text-xs text-on-surface-variant space-y-1">
      <li>Copy the prompt into ChatGPT, DeepSeek, Gemini, or another chatbot.</li>
      <li>Paste or attach your question bank and answer key, or source material, alongside it.</li>
      <li>Paste the chatbot’s formatted quiz below, then choose Append or Replace All.</li>
    </ol>
    <p className="text-xs text-secondary">Check the recognized question count and review the answers in the editor before saving.</p>
    <button type="button" aria-expanded={expanded} aria-controls="ai-import-prompt" onClick={() => setExpanded(value => !value)} className="text-xs font-semibold text-primary underline">{expanded ? 'Hide prompt' : 'View prompt'}</button>
    {expanded && <div id="ai-import-prompt" className="space-y-2">
      <textarea ref={promptField} aria-label="AI quiz formatting prompt" readOnly value={prompt} rows={7} className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-3 font-mono text-xs leading-relaxed" />
      <button type="button" className="text-xs text-primary underline" onClick={() => { promptField.current?.focus(); promptField.current?.select(); }}>Select prompt</button>
    </div>}
    {mode === 'true-false' && <details className="text-xs text-secondary">
      <summary className="cursor-pointer text-primary font-semibold">Expected True/False output</summary>
      <pre className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-surface-container-lowest p-3">{TRUE_FALSE_IMPORT_EXAMPLE}</pre>
    </details>}
    <p role="status" aria-live="polite" className="text-xs text-primary">{message}</p>
  </section>;
}
