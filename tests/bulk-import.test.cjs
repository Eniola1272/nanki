const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { webcrypto } = require('node:crypto');
function load(file) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, { exports, crypto: webcrypto });
  return exports;
}
const { parseQuestionsFromText } = load('lib/quiz/bulk-import.ts');
const { BULK_IMPORT_EXAMPLE, BULK_IMPORT_PROMPT } = load('lib/quiz/import-prompt.ts');
test('the copyable prompt example imports both questions and their answer keys', () => {
  assert.ok(BULK_IMPORT_PROMPT.includes(BULK_IMPORT_EXAMPLE));
  const questions = parseQuestionsFromText(BULK_IMPORT_EXAMPLE);
  assert.equal(questions.length, 2);
  assert.equal(questions[0].options[questions[0].correctOptionIndex], 'Mars');
  assert.equal(questions[1].options[questions[1].correctOptionIndex], 'H2O');
});
test('the prescribed numbering supports long banks and all six answer positions', () => {
  const source = Array.from({ length: 24 }, (_, i) => `Question ${i + 1}: Select the correct item for case ${i + 1}.\nA. First\nB. Second\nC. Third\nD. Fourth\nE. Fifth\nF. Sixth\nAnswer: ${String.fromCharCode(65 + i % 6)}`).join('\r\n\r\n');
  const questions = parseQuestionsFromText(source);
  assert.equal(questions.length, 24);
  questions.forEach((q, i) => { assert.equal(q.correctOptionIndex, i % 6); assert.equal(q.options.length, 6); });
  assert.equal(new Set(questions.map(q => q.id)).size, 24);
});
