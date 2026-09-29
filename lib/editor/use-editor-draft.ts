'use client';

/* Local storage is an external system: effects hydrate the editor after mount
   and report whether its browser draft was actually persisted. */
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useRef, useState } from 'react';
import { readEditorDraft, writeEditorDraft } from './drafts';

export function useEditorDraft<T extends object>(key: string, data: T, restore: (draft: T) => void) {
  const [initial] = useState(data);
  const restoreRef = useRef(restore);
  const cleared = useRef(false);
  const [ready, setReady] = useState(false);
  const [restored, setRestored] = useState(false);
  const [status, setStatus] = useState('');
  const serialized = JSON.stringify(data);
  const dirty = serialized !== JSON.stringify(initial);
  useEffect(() => {
    const draft = readEditorDraft(key, initial);
    if (draft) { restoreRef.current(draft); setRestored(true); }
    setReady(true);
  }, [key, initial]);
  useEffect(() => {
    if (!ready || cleared.current) return;
    if (!dirty) { try { localStorage.removeItem(key); } catch {} return; }
    try { writeEditorDraft(key, JSON.parse(serialized)); setStatus('Draft saved on this device'); }
    catch { setStatus('Draft could not be saved. Keep this editor open.'); }
  }, [key, serialized, ready, dirty]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty && !cleared.current) { event.preventDefault(); event.returnValue = ''; }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const clear = () => {
    cleared.current = true;
    try { localStorage.removeItem(key); } catch { /* The saved content is already on the server. */ }
  };
  const close = (onClose: () => void) => {
    if (!dirty || confirm(`${status || 'Your changes have not been saved to your account.'} Leave the editor?`)) onClose();
  };
  const discard = () => {
    if (!confirm('Discard this device draft and restore the saved version?')) return;
    try { localStorage.removeItem(key); } catch { setStatus('Could not remove this draft.'); return; }
    restoreRef.current(initial);
    setRestored(false);
    setStatus('');
  };
  return { ready, restored, status, clear, close, discard };
}
