import type { Question } from '@/types/nanki';

export function parseQuestionsFromText(text: string): Question[] {
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

