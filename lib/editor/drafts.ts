export const editorDraftKey = (owner: string, kind: 'quiz' | 'deck', id = 'new') => `nanki_editor_v1_${owner}_${kind}_${id}`;
export function readEditorDraft<T extends object>(key: string, initial: T): T | null {
  try {
    const row = JSON.parse(localStorage.getItem(key) || 'null');
    if (row?.version !== 1 || !row.data || typeof row.data !== 'object') return null;
    for (const [field, value] of Object.entries(initial)) {
      const stored = row.data[field];
      if (Array.isArray(value) ? !Array.isArray(stored) : typeof stored !== typeof value) return null;
    }
    return row.data as T;
  } catch { return null; }
}
export function writeEditorDraft(key: string, data: object) {
  localStorage.setItem(key, JSON.stringify({ version: 1, savedAt: new Date().toISOString(), data }));
}
