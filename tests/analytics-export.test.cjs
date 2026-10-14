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
  vm.runInNewContext(transpiled, { exports, require: (n) => deps[n] || {}, Date, Math, RegExp, Array, Object });
  return exports;
}

const metrics = load('lib/analytics/metrics.ts');
const anki = load('lib/export/anki.ts');
const plans = load('lib/billing/plans.ts');

test('category mastery calculates total questions, correct count, and percentage accurately', () => {
  const attempts = [
    {
      id: 'att-1',
      quizId: 'q-med-1',
      quiz: { id: 'q-med-1', title: 'Cardiology', category: 'Cardiology', questions: [] },
      correct: 8,
      total: 10,
      completedAt: '2026-10-10T12:00:00Z',
      studyDay: '2026-10-10',
      synced: true,
      answers: {},
    },
    {
      id: 'att-2',
      quizId: 'q-med-2',
      quiz: { id: 'q-med-2', title: 'Heart Valves', category: 'Cardiology', questions: [] },
      correct: 6,
      total: 10,
      completedAt: '2026-10-11T12:00:00Z',
      studyDay: '2026-10-11',
      synced: true,
      answers: {},
    },
    {
      id: 'att-3',
      quizId: 'q-path-1',
      quiz: { id: 'q-path-1', title: 'Inflammation', category: 'Pathology', questions: [] },
      correct: 10,
      total: 10,
      completedAt: '2026-10-11T14:00:00Z',
      studyDay: '2026-10-11',
      synced: true,
      answers: {},
    },
  ];

  const mastery = metrics.calculateCategoryMastery(attempts);
  assert.equal(mastery.length, 2);

  const cardio = mastery.find((m) => m.category === 'Cardiology');
  assert.ok(cardio);
  assert.equal(cardio.quizzesCount, 2);
  assert.equal(cardio.totalQuestions, 20);
  assert.equal(cardio.correctQuestions, 14);
  assert.equal(cardio.accuracy, 70);

  const path = mastery.find((m) => m.category === 'Pathology');
  assert.ok(path);
  assert.equal(path.quizzesCount, 1);
  assert.equal(path.accuracy, 100);
});

test('question-level metrics isolate missed questions and identify weakest clinical topics', () => {
  const mockQuiz = {
    id: 'quiz-obgyn',
    title: 'High-Yield OB/GYN',
    category: 'OBGYN',
    questions: [
      {
        id: 'q1',
        text: 'What is the triad of watery vaginal discharge, pain, and pelvic mass?',
        options: ["Latzko's triad", "Meigs' syndrome"],
        correctOptionIndex: 0,
        explanation: 'Latzko triad indicates fallopian tube carcinoma.',
      },
      {
        id: 'q2',
        text: 'What is the first line treatment for pre-eclampsia seizure prophylaxis?',
        options: ['Diazepam', 'MgSO4'],
        correctOptionIndex: 1,
        explanation: 'MgSO4 is first line.',
      },
    ],
  };

  const attempts = [
    {
      id: 'a1',
      quizId: 'quiz-obgyn',
      quiz: mockQuiz,
      correct: 1,
      total: 2,
      studyDay: '2026-10-12',
      completedAt: '2026-10-12T10:00:00Z',
      synced: true,
      answers: {
        q1: 1, // Wrong pick!
        q2: 1, // Correct!
      },
    },
    {
      id: 'a2',
      quizId: 'quiz-obgyn',
      quiz: mockQuiz,
      correct: 1,
      total: 2,
      studyDay: '2026-10-13',
      completedAt: '2026-10-13T10:00:00Z',
      synced: true,
      answers: {
        q1: 1, // Wrong pick again!
        q2: 1, // Correct!
      },
    },
  ];

  const qMetrics = metrics.calculateQuestionMetrics(attempts);
  assert.equal(qMetrics.length, 2);

  const q1 = qMetrics.find((q) => q.questionId === 'q1');
  assert.equal(q1.timesEncountered, 2);
  assert.equal(q1.timesCorrect, 0);
  assert.equal(q1.timesIncorrect, 2);
  assert.equal(q1.accuracy, 0);
  assert.equal(q1.explanation, 'Latzko triad indicates fallopian tube carcinoma.');

  const weakest = metrics.getWeakestQuestions(attempts);
  assert.equal(weakest.length, 1);
  assert.equal(weakest[0].questionId, 'q1');
});

test('Anki export produces valid tab-separated text with headers, escaped newlines, and tags', () => {
  const deck = {
    id: 'deck-101',
    title: 'Pharmacology Antibiotics',
    category: 'Pharmacology',
    description: 'Core mechanisms',
    cards: [
      {
        id: 'c1',
        front: 'Vancomycin Mechanism of Action',
        back: 'Inhibits cell wall peptidoglycan synthesis by binding D-Ala-D-Ala.',
        extraNote: 'Watch for red man syndrome.',
      },
      {
        id: 'c2',
        front: 'Linezolid\nSide Effects',
        back: 'Bone marrow suppression\nOptic neuropathy',
      },
    ],
  };

  const tsv = anki.exportDeckToAnki(deck);
  assert.ok(tsv.includes('#separator:tab'));
  assert.ok(tsv.includes('#html:true'));
  assert.ok(tsv.includes('#tags column:4'));
  assert.ok(tsv.includes('nanki::Pharmacology'));

  const lines = tsv.trim().split('\n');
  // 4 header lines + 1 blank line + 2 cards = 7 lines
  const card1Line = lines.find((l) => l.includes('Vancomycin'));
  assert.ok(card1Line);
  const parts1 = card1Line.split('\t');
  assert.equal(parts1.length, 4);
  assert.equal(parts1[0], 'Vancomycin Mechanism of Action');
  assert.ok(parts1[1].includes('D-Ala-D-Ala'));
  assert.equal(parts1[2], 'Watch for red man syndrome.');
  assert.equal(parts1[3], 'nanki::Pharmacology');

  const card2Line = lines.find((l) => l.includes('Linezolid'));
  assert.ok(card2Line);
  assert.ok(card2Line.includes('<br>')); // multi-line converted to <br>
});

test('Pro features gate advanced analytics and Anki/PDF exports to Pro and Scholar tiers', () => {
  const freeUser = { plan: 'FREE', subscription_status: 'ACTIVE' };
  const proUser = { plan: 'PRO', subscription_status: 'ACTIVE' };
  const scholarUser = { plan: 'SCHOLAR', subscription_status: 'ACTIVE' };

  // Analytics gating
  assert.equal(plans.hasPlanFeature(freeUser, 'advancedAnalytics'), false);
  assert.equal(plans.hasPlanFeature(proUser, 'advancedAnalytics'), true);
  assert.equal(plans.hasPlanFeature(scholarUser, 'advancedAnalytics'), true);

  // PDF & Anki export gating
  assert.equal(plans.hasPlanFeature(freeUser, 'exportPdfAnki'), false);
  assert.equal(plans.hasPlanFeature(proUser, 'exportPdfAnki'), true);
  assert.equal(plans.hasPlanFeature(scholarUser, 'exportPdfAnki'), true);
});
