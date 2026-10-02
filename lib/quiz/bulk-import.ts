import type { Question } from '@/types/nanki';

function parseMultipleChoiceText(text: string): Question[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const parsedQuestions: Question[] = [];

  let currentStem = '';
  let currentOptions: string[] = [];
  let currentCorrectIdx = 0;
  let hasSetCorrect = false;

  const flushQuestion = () => {
    if (currentStem && currentOptions.length >= 2) {
      const qId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `q-${Date.now()}-${parsedQuestions.length}`;

      parsedQuestions.push({
        id: qId,
        text: currentStem,
        timer: '30s',
        options: currentOptions.slice(0, 6),
        correctOptionIndex: currentCorrectIdx < currentOptions.length ? currentCorrectIdx : 0,
      });
    }
    currentStem = '';
    currentOptions = [];
    currentCorrectIdx = 0;
    hasSetCorrect = false;
  };

  const optionRegex = /^([A-Fa-f1-6][\.\)\:\-]\s*|\-\s+)(.+)$/;
  const answerLineRegex = /^(?:Ans(?:wer)?|Correct(?:\s+Option)?)\s*[:\-]?\s*([A-Fa-f1-6])/i;
  const questionNumberRegex = /^(?:(?:Q|Question)\s*\d+[\.\:\-]?|\d+[\.\)\:\-])\s*(.+)$/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for "Answer: X" line
    const ansMatch = line.match(answerLineRegex);
    if (ansMatch) {
      const char = ansMatch[1].toUpperCase();
      let idx = 0;
      if (/[A-F]/.test(char)) idx = char.charCodeAt(0) - 65;
      else if (/[1-6]/.test(char)) idx = parseInt(char, 10) - 1;
      if (idx >= 0 && idx < currentOptions.length) {
        currentCorrectIdx = idx;
        hasSetCorrect = true;
      }
      continue;
    }

    // Determine if line looks like an option
    const isLetterOption = /^[A-Fa-f][\.\)\:\-]\s*/.test(line);
    const isBulletOption = /^\-\s+/.test(line);
    const isNumberOption = /^[1-6][\.\)\:\-]\s*/.test(line);
    const isOptionCandidate = isLetterOption || isBulletOption || (isNumberOption && currentOptions.length > 0 && currentStem.length > 0);

    if (currentStem && isOptionCandidate) {
      const optMatch = line.match(optionRegex);
      let optText = optMatch ? optMatch[2].trim() : line.replace(/^[A-Fa-f1-6][\.\)\:\-]\s*/, '').trim();
      const isMarked = /\*|\(correct\)|\(ans\)|\[x\]/i.test(optText);
      optText = optText.replace(/\*|\(correct\)|\(ans\)|\[x\]/gi, '').trim();

      if (isMarked && !hasSetCorrect) {
        currentCorrectIdx = currentOptions.length;
        hasSetCorrect = true;
      }
      if (currentOptions.length < 6) {
        currentOptions.push(optText);
      }
      continue;
    }

    // Check for explicit Question Numbering (e.g. 1. Question stem...)
    const qNumMatch = line.match(questionNumberRegex);
    if (qNumMatch && !isLetterOption) {
      flushQuestion();
      currentStem = qNumMatch[1].trim();
      continue;
    }

    // If options are already collected and this line looks like a new question stem
    const isLikelyQuestionStem = /\?$|^(?:The following|Which|Regarding|Features|Concerning|Contraindications|Indications|What|About|There was)/i.test(line);
    if (currentOptions.length >= 2 && isLikelyQuestionStem) {
      flushQuestion();
      currentStem = line;
      continue;
    }

    // Stems & option continuation
    if (!currentStem) {
      currentStem = line;
    } else if (currentOptions.length === 0) {
      currentStem += ' ' + line;
    } else {
      currentOptions[currentOptions.length - 1] += ' ' + line;
    }
  }

  flushQuestion();
  return parsedQuestions;
}


// Explicit T/F blocks are parsed separately so missing branch keys can never
// silently turn into single-choice questions with A selected as the answer.
export function parseQuestionsFromText(text: string): Question[] {
  if (!/^Type:\s*True\s*[/\-]\s*False|^Answers:\s*[A-F]\s*=/im.test(text)) return parseMultipleChoiceText(text);
  const blocks = text.trim().split(/(?=^(?:(?:Question|Q)\s*\d+[:.)-]|\d+[.)])\s*)/im).filter(block => block.trim());
  return blocks.flatMap(block => {
    if (!/^Type:\s*True\s*[/\-]\s*False|^Answers:\s*[A-F]\s*=/im.test(block)) return parseMultipleChoiceText(block);
    const lines = block.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const stem = lines[0].replace(/^(?:(?:Question|Q)\s*\d+[:.)-]|\d+[.)])\s*/i, '');
    const options: string[] = [];
    let valid = true;
    for (const line of lines.slice(1)) {
      const match = line.match(/^([A-F])[.)]\s+(.+)$/);
      if (match) {
        if (match[1].charCodeAt(0) - 65 !== options.length) valid = false;
        options.push(match[2]);
      }
    }
    const answerLines = lines.filter(line => /^Answers:/i.test(line));
    const keys = new Map<string, boolean>();
    if (answerLines.length !== 1) valid = false;
    for (const token of (answerLines[0] ?? '').replace(/^Answers:\s*/i, '').split(',')) {
      const match = token.trim().match(/^([A-F])\s*=\s*(T|F|TRUE|FALSE)$/i);
      if (!match || keys.has(match[1].toUpperCase())) { valid = false; continue; }
      keys.set(match[1].toUpperCase(), match[2].toUpperCase().startsWith('T'));
    }
    if (keys.size !== options.length || options.length < 2 || options.length > 6) valid = false;
    const values = options.map((_, i) => keys.get(String.fromCharCode(65 + i)));
    if (values.some(value => value === undefined)) valid = false;
    return [{ id: crypto.randomUUID(), text: stem, type: 'true-false' as const, timer: '120s', options, correctOptionIndex: 0, correctTruthValues: valid ? values as boolean[] : [] }];
  });
}
