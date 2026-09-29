const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const fs = require('node:fs');
const vm = require('node:vm');
const output = ts.transpileModule(fs.readFileSync('lib/community/discovery.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const api = {};
vm.runInNewContext(output, { exports: api });
const quiz = (id, overrides = {}) => ({ id, title: 'Biology quiz', description: 'Cellular respiration', category: 'Biology', ownerId: 'author', published: true, likeCount: 0, questions: [], ...overrides });
const deck = (id, overrides = {}) => ({ ...quiz(id, overrides), cards: [] });

test('private content is excluded even if the author can read it', () => {
  const results = api.discoverContent([quiz('public'), quiz('private', { published: false }), quiz('orphan', { ownerId: null, published: false })], [deck('hidden-deck', { published: false })], '', 'All Topics', 'helpful');
  assert.deepEqual(Array.from(results, r => r.content.id), ['public']);
});
test('helpful ranking combines quizzes and decks instead of favoring a content type', () => {
  const results = api.discoverContent([quiz('q', { likeCount: 3 })], [deck('d', { likeCount: 10 })], '', 'All Topics', 'helpful');
  assert.deepEqual(Array.from(results, r => r.content.id), ['d', 'q']);
});
test('search filters all terms and category before sorting helpful content', () => {
  const results = api.discoverContent([quiz('match'), quiz('wrong-topic', { title: 'Physics', description: '', category: 'Physics', likeCount: 100 })], [deck('deck', { likeCount: 2 })], '  BIOLOGY   RESPIRATION ', 'Biology', 'helpful');
  assert.deepEqual(Array.from(results, r => r.content.id), ['deck', 'match']);
});
test('newest sort is independent of votes and ties remain deterministic', () => {
  const rows = [quiz('old', { createdAt: '2026-01-01', likeCount: 100 }), quiz('new', { createdAt: '2026-02-01' })];
  assert.equal(api.discoverContent(rows, [], '', 'All Topics', 'newest')[0].content.id, 'new');
  assert.equal(api.discoverContent(rows, [], '', 'All Topics', 'helpful')[0].content.id, 'old');
});
test('built-in study material stays available without inventing public votes', () => {
  const results = api.discoverContent([quiz('starter', { ownerId: undefined, published: undefined, likeCount: undefined })], [], '', 'All Topics', 'helpful');
  assert.equal(results.length, 1); assert.equal(results[0].content.likeCount, undefined);
});
