const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
function load(file, dependencies = {}) {
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const exports = {};
  vm.runInNewContext(output, { exports, require: name => dependencies[name], crypto: webcrypto, TextEncoder, Date, localStorage: dependencies.localStorage });
  return exports;
}
const stats = load('lib/progress/stats.ts');
const quiz = { id: 'obgyn', title: 'OBGYN', description: '', category: 'Medicine', questions: [] };
const attempt = (day, correct = 5, total = 10, id = day) => ({ id, quizId: quiz.id, quiz, correct, total, answers: {}, completedAt: `${day}T12:00:00Z`, studyDay: day, synced: false });

test('new learners start with no invented activity', () => {
  const result = stats.progressStats([], new Date('2026-09-29T12:00:00'));
  assert.equal(result.level, 1); assert.equal(result.xp, 0); assert.equal(result.streak, 0);
  assert.equal(result.badges.some(b => b.earned), false);
});
test('streaks deduplicate days, survive until tomorrow, and reset after a missed day', () => {
  const history = [attempt('2026-09-27'), attempt('2026-09-28'), attempt('2026-09-28', 5, 10, 'retake')];
  assert.equal(stats.progressStats(history, new Date('2026-09-29T12:00:00')).streak, 2);
  const expired = stats.progressStats(history, new Date('2026-09-30T12:00:00'));
  assert.equal(expired.streak, 0); assert.equal(expired.personalBestStreak, 2);
});
test('streaks cross month/year boundaries and gaps preserve the best run', () => {
  const history = ['2025-12-30', '2025-12-31', '2026-01-01', '2026-01-04'].map(d => attempt(d));
  const result = stats.progressStats(history, new Date('2026-01-04T12:00:00'));
  assert.equal(result.streak, 1); assert.equal(result.personalBestStreak, 3);
});
test('XP ranks up at 500 and accuracy is weighted by questions', () => {
  const history = Array.from({ length: 25 }, (_, i) => attempt('2026-09-29', 5, 10, String(i)));
  const result = stats.progressStats(history);
  assert.equal(result.xp, 500); assert.equal(result.level, 2); assert.equal(result.xpProgress, 0);
  assert.equal(stats.progressStats([attempt('2026-09-28', 1, 1), attempt('2026-09-29', 0, 9)]).masteryPercentage, 10);
});
test('built-in IDs become stable account-specific UUIDs; real IDs remain unchanged', async () => {
  const storage = load('lib/progress/storage.ts');
  const first = await storage.databaseQuizId('user-a', 'obgyn');
  assert.match(first, /^[a-f0-9]{8}-[a-f0-9]{4}-5[a-f0-9]{3}-a[a-f0-9]{3}-[a-f0-9]{12}$/);
  assert.equal(first, await storage.databaseQuizId('user-a', 'obgyn'));
  assert.notEqual(first, await storage.databaseQuizId('user-b', 'obgyn'));
  assert.equal(first, await storage.databaseQuizId('user-a', first));
});
test('sync creates built-in quiz before attempt and retries preserve attempt ID and snapshot', async () => {
  const calls = [];
  const storage = load('lib/progress/storage.ts', { '@/lib/db/supabase-browser': { createClient: () => ({ from: table => ({ upsert: async (payload, options) => { calls.push({ table, payload, options }); return { error: null }; } }) }) } });
  const a = attempt('2026-09-29');
  await storage.syncAttempt('user-a', a); await storage.syncAttempt('user-a', a);
  assert.equal(calls[0].table, 'quizzes'); assert.equal(calls[1].table, 'quiz_attempts');
  assert.equal(calls[1].payload.id, calls[3].payload.id);
  assert.equal(calls[1].payload.quiz_id, calls[0].payload.id);
  assert.equal(calls[1].payload.answers.quiz.title, 'OBGYN');
  assert.equal(calls[1].options.ignoreDuplicates, true);
});
test('failed prerequisite does not attempt to save a broken foreign key', async () => {
  let count = 0;
  const storage = load('lib/progress/storage.ts', { '@/lib/db/supabase-browser': { createClient: () => ({ from: () => ({ upsert: async () => { count++; return { error: new Error('offline') }; } }) }) } });
  await assert.rejects(storage.syncAttempt('user-a', attempt('2026-09-29')), /offline/);
  assert.equal(count, 1);
});
test('history merges retries once and restores the historical quiz snapshot', () => {
  const storage = load('lib/progress/storage.ts', { './stats': stats });
  const a = attempt('2026-09-29');
  const merged = storage.mergeAttempts([a], [{ ...a, synced: true }]);
  assert.equal(merged.length, 1); assert.equal(merged[0].synced, true);
  const row = { id: a.id, quiz_id: 'database-id', score: 5, max_score: 10, completed_at: a.completedAt, answers: { version: 1, quiz, selections: { q1: 2 }, studyDay: a.studyDay } };
  const restored = storage.fromDatabase(row, [{ ...quiz, title: 'Edited title' }]);
  assert.equal(restored.quiz.title, 'OBGYN'); assert.equal(restored.answers.q1, 2);
});
test('local records are isolated by account and corrupt storage does not crash loading', () => {
  const values = new Map();
  const storage = load('lib/progress/storage.ts', { localStorage: { getItem: k => values.get(k), setItem: (k, v) => values.set(k, v) } });
  storage.writeAttempts('a', [attempt('2026-09-29')]);
  assert.equal(storage.readAttempts('a').length, 1); assert.equal(storage.readAttempts('b').length, 0);
  values.set(storage.progressKey('a'), '{bad'); assert.equal(storage.readAttempts('a').length, 0);
});
