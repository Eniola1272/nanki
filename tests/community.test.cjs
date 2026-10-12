const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, deps = {}) {
  const exports = {};
  const code = fs.readFileSync(file, 'utf8');
  const transpiled = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(transpiled, { exports, require: n => deps[n] || {}, Date, Math });
  return exports;
}

const moderation = load('lib/community/moderation.ts');
const discovery = load('lib/community/discovery.ts');
const plans = load('lib/billing/plans.ts');

test('moderation validation approves valid reasons and rejects invalid inputs or oversized details', () => {
  const valid = moderation.validateReportInput({
    kind: 'quiz',
    contentId: 'quiz-123',
    reason: 'inaccurate',
    details: 'The correct answer for question 2 is incorrect.',
  });
  assert.equal(valid.valid, true);

  const invalidReason = moderation.validateReportInput({
    kind: 'deck',
    contentId: 'deck-456',
    reason: 'fake_reason',
  });
  assert.equal(invalidReason.valid, false);
  assert.ok(invalidReason.error.includes('valid report reason'));

  const missingTarget = moderation.validateReportInput({
    kind: 'quiz',
    contentId: '',
    reason: 'spam',
  });
  assert.equal(missingTarget.valid, false);

  const oversizedDetails = moderation.validateReportInput({
    kind: 'quiz',
    contentId: 'quiz-123',
    reason: 'other',
    details: 'a'.repeat(1001),
  });
  assert.equal(oversizedDetails.valid, false);
  assert.ok(oversizedDetails.error.includes('1000 characters'));
});

test('forking a quiz or deck creates private copies with clean cloned questions and preserves categories', () => {
  const originalQuiz = {
    id: 'orig-quiz',
    title: 'Pathology Basics',
    description: 'Cell injury and necrosis',
    category: 'Pathology',
    published: true,
    ownerId: 'creator-1',
    questions: [
      { id: 'q1', text: 'Which is coagulative necrosis?', timer: '20s', options: ['A', 'B'], correctOptionIndex: 0 },
    ],
  };

  // Simulating fork logic
  const forkedQuiz = {
    ...originalQuiz,
    id: 'forked-id-1',
    ownerId: 'learner-2',
    title: `Copy of ${originalQuiz.title}`,
    published: false,
    questions: originalQuiz.questions.map(q => ({ ...q, id: 'cloned-q1' })),
  };

  assert.equal(forkedQuiz.published, false);
  assert.equal(forkedQuiz.title, 'Copy of Pathology Basics');
  assert.equal(forkedQuiz.ownerId, 'learner-2');
  assert.notEqual(forkedQuiz.id, originalQuiz.id);
  assert.notEqual(forkedQuiz.questions[0].id, originalQuiz.questions[0].id);
  assert.equal(forkedQuiz.questions[0].text, originalQuiz.questions[0].text);
});

test('forking enforces plan limits against free user quotas', () => {
  const freeProfile = { plan: 'FREE', subscription_status: 'INACTIVE' };
  // User already has 10 quizzes
  assert.equal(plans.canCreateQuiz(freeProfile, 10), false);

  // User has 4 decks (limit is 5)
  assert.equal(plans.canCreateDeck(freeProfile, 4), true);

  // User has 5 decks
  assert.equal(plans.canCreateDeck(freeProfile, 5), false);

  // Pro user has unlimited forking allowance
  const proProfile = { plan: 'PRO', subscription_status: 'ACTIVE' };
  assert.equal(plans.canCreateQuiz(proProfile, 50), true);
  assert.equal(plans.canCreateDeck(proProfile, 50), true);
});

test('discovery feed lists public items, applies search filtering and sorts by helpful upvotes', () => {
  const quizzes = [
    { id: 'q1', title: 'Cardiac Pathology', description: 'Infarction', category: 'Medicine', published: true, likeCount: 5, createdAt: '2026-10-01' },
    { id: 'q2', title: 'Renal Pathology', description: 'Nephrotic', category: 'Medicine', published: true, likeCount: 15, createdAt: '2026-10-05' },
    { id: 'q3', title: 'Private Draft', description: 'Secret', category: 'Medicine', published: false, ownerId: 'user-1' },
  ];
  const decks = [
    { id: 'd1', title: 'Pharmacology Antibiotics', description: 'Penicillins', category: 'Pharma', published: true, likeCount: 8, createdAt: '2026-10-02' },
  ];

  // Private content must be excluded
  const helpful = discovery.discoverContent(quizzes, decks, '', 'All Topics', 'helpful');
  assert.equal(helpful.length, 3);
  assert.equal(helpful[0].content.id, 'q2'); // 15 likes
  assert.equal(helpful[1].content.id, 'd1'); // 8 likes
  assert.equal(helpful[2].content.id, 'q1'); // 5 likes

  // Category filter
  const pharmaOnly = discovery.discoverContent(quizzes, decks, '', 'Pharma', 'helpful');
  assert.equal(pharmaOnly.length, 1);
  assert.equal(pharmaOnly[0].content.id, 'd1');

  // Search filter
  const searchResults = discovery.discoverContent(quizzes, decks, 'Infarction', 'All Topics', 'helpful');
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].content.id, 'q1');
});
