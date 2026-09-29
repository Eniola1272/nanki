const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const vm = require('node:vm');
function load(file, deps = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, { exports, require: name => deps[name], Date, localStorage: deps.localStorage });
  return exports;
}
const stats = load('lib/progress/stats.ts');
const session = { id: 's1', deckId: 'd1', deck: { title: 'Biology', cards: [] }, cardsReviewed: 5, studyDay: '2026-09-29', completedAt: '2026-09-29T12:00:00Z', synced: false };
test('flashcards earn XP and a streak without inflating quiz accuracy or count', () => {
  const result = stats.progressStats([], new Date('2026-09-29T12:00:00'), [session]);
  assert.equal(result.xp, 15); assert.equal(result.streak, 1); assert.equal(result.totalQuizzesTaken, 0); assert.equal(result.masteryPercentage, 0); assert.equal(result.totalFlashcardSessions, 1);
});
test('mixed quiz and flashcard days form one streak with one credit per day', () => {
  const attempts = [{ correct: 1, total: 2, studyDay: '2026-09-28' }, { correct: 1, total: 2, studyDay: '2026-09-29' }];
  const result = stats.progressStats(attempts, new Date('2026-09-29T12:00:00'), [session]);
  assert.equal(result.streak, 2); assert.equal(result.xp, 39); assert.equal(result.masteryPercentage, 50);
});
test('flashcard retries merge once and preserve the synced state', () => {
  const api = load('lib/progress/flashcards.ts');
  const rows = api.mergeFlashcards([session], [{ ...session, synced: true }], [session]);
  assert.equal(rows.length, 1); assert.equal(rows[0].synced, true);
});
test('editor drafts restore content and visibility without crossing accounts or editors', () => {
  const rows = new Map();
  const api = load('lib/editor/drafts.ts', { localStorage: { getItem: key => rows.get(key), setItem: (key, data) => rows.set(key, data) } });
  const initial = { title: '', published: false, cards: [] };
  const key = api.editorDraftKey('alice', 'deck', 'd1');
  api.writeEditorDraft(key, { title: 'Saved draft', published: true, cards: [{ front: 'Question', back: 'Answer' }] });
  assert.equal(api.readEditorDraft(key, initial).title, 'Saved draft');
  assert.equal(api.readEditorDraft(key, initial).published, true);
  assert.equal(api.readEditorDraft(api.editorDraftKey('bob', 'deck', 'd1'), initial), null);
  assert.equal(api.readEditorDraft(api.editorDraftKey('alice', 'quiz', 'd1'), initial), null);
  rows.set(key, '{broken'); assert.equal(api.readEditorDraft(key, initial), null);
  rows.set(key, JSON.stringify({ version: 1, data: { ...initial, cards: null } })); assert.equal(api.readEditorDraft(key, initial), null);
});
