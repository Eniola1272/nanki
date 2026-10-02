const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { webcrypto } = require('node:crypto');
function load(file, deps = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, { exports, require: name => deps[name], crypto: webcrypto, Date });
  return exports;
}
const api = load('lib/quiz/scoring.ts');
const { parseQuestionsFromText } = load('lib/quiz/bulk-import.ts');
const { PAEDIATRICS_TF_QUIZ: source } = load('lib/data/paediatrics-tf.ts');
const q = { id: 'q', type: 'true-false', options: ['A', 'B', 'C', 'D'], correctTruthValues: [true, false, true, false], correctOptionIndex: 0 };
test('one point per correct branch, half-point per wrong branch, no penalty for blanks', () => {
  const answers = { 'q::0': 1, 'q::1': 1, 'q::2': null };
  const score = api.scoreQuiz({ questions: [q] }, answers, true);
  assert.equal(score.correct, 1); assert.equal(score.wrong, 1); assert.equal(score.unanswered, 2);
  assert.equal(score.total, 4); assert.equal(score.netScore, 0.5);
  assert.equal(api.scoreQuiz({ questions: [q] }, answers, false).netScore, 1);
});
test('all-wrong scores can be negative and multiple choice is not penalized', () => {
  const answers = { 'q::0': 0, 'q::1': 1, 'q::2': 0, 'q::3': 1, mc: 1 };
  const score = api.scoreQuiz({ questions: [q, { id: 'mc', options: ['A', 'B'], correctOptionIndex: 0 }] }, answers, true);
  assert.equal(score.netScore, -2); assert.equal(score.total, 5);
});
test('source conversion preserves 40 questions, 195 branches and all explanations', () => {
  assert.equal(source.questions.length, 40);
  assert.equal(source.questions.reduce((n, q) => n + q.options.length, 0), 195);
  const answers = {};
  source.questions.forEach(q => { assert.ok(api.validQuestion(q)); assert.equal(q.branchExplanations.length, q.options.length); q.correctTruthValues.forEach((value, i) => { answers[api.branchKey(q.id, i)] = Number(value); }); });
  assert.equal(api.scoreQuiz(source, answers, true).netScore, 195);
  assert.equal(api.scoreQuiz(source, {}, true).netScore, 0);
});
test('mixed bulk import keeps branch answers separate from MCQ answers', () => {
  const parsed = parseQuestionsFromText('Question 1: Select one\nA. First\nB. Second\nAnswer: B\n\nQuestion 2: Judge each\nType: True/False\nA. First\nB. Second\nC. Third\nAnswers: A=T, B=F, C=T');
  assert.equal(parsed.length, 2); assert.equal(parsed[0].correctOptionIndex, 1);
  assert.equal(parsed[1].type, 'true-false'); assert.deepEqual(Array.from(parsed[1].correctTruthValues), [true, false, true]);
});
test('incomplete or duplicated T/F keys are invalid instead of defaulting to an answer', () => {
  for (const key of ['A=T', 'A=T, A=F', 'A=T, B=unknown']) {
    const [parsed] = parseQuestionsFromText(`Question 1: Judge each\nType: True/False\nA. First\nB. Second\nAnswers: ${key}`);
    assert.equal(api.validQuestion(parsed), false);
  }
});
test('saving/reloading preserves the penalty setting and half-point score', async () => {
  let payload;
  const storage = load('lib/progress/storage.ts', { './stats': { studyDay: () => '2026-10-02' }, '@/lib/db/supabase-browser': { createClient: () => ({ from: () => ({ upsert: async data => { payload = data; return { error: null }; } }) }) } });
  const quiz = { ...source, id: '10000000-0000-4000-8000-000000000001' };
  await storage.syncAttempt('user', { id: 'attempt', quizId: quiz.id, quiz, correct: 1, total: 195, answers: {}, negativeMarking: true, netScore: -0.5, wrong: 3, unanswered: 191, completedAt: '2026-10-02T12:00:00Z', studyDay: '2026-10-02' });
  const restored = storage.fromDatabase(payload, []);
  assert.equal(restored.negativeMarking, true); assert.equal(restored.netScore, -0.5); assert.equal(restored.correct, 1);
});
