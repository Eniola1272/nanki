import type { Card, Quiz } from '../../types/nanki';
import { branchKey, validQuestion } from '../quiz/scoring';
export function mistakeCards(quiz: Quiz, answers: Record<string,number|null>, attemptId: string, includeUnanswered=false): Card[] {
  const cards: Card[]=[];
  for(const q of quiz.questions) {
    if(!validQuestion(q)) continue;
    if(q.type==='true-false') q.options.forEach((statement,i)=>{
      const answer=answers[branchKey(q.id,i)];
      if(answer===Number(q.correctTruthValues![i]) || (answer==null&&!includeUnanswered)) return;
      cards.push({id:JSON.stringify([quiz.id,q.id,i]),front:`${q.text}\n\n${statement}`,back:q.correctTruthValues![i]?'True':'False',extraNote:q.branchExplanations?.[i]||q.explanation,source:{quizId:quiz.id,questionId:q.id,branch:i,attemptId}});
    }); else {
      if (!Number.isInteger(q.correctOptionIndex) || q.correctOptionIndex < 0 || q.correctOptionIndex >= q.options.length) continue;
      const answer=answers[q.id];
      if(answer===q.correctOptionIndex || (answer==null&&!includeUnanswered)) continue;
      cards.push({id:JSON.stringify([quiz.id,q.id]),front:`${q.text}\n\n${q.options.map((x,i)=>`${String.fromCharCode(65+i)}. ${x}`).join('\n')}`,back:q.options[q.correctOptionIndex],extraNote:q.explanation,source:{quizId:quiz.id,questionId:q.id,attemptId}});
    }
  }
  return cards;
}
export const sourceKey=(c:Card)=>c.source ? JSON.stringify([c.source.quizId,c.source.questionId,c.source.branch??null]):null;
export function uniqueMistakes(incoming:Card[], existing:Card[]) {
 const keys=new Set(existing.map(sourceKey).filter(Boolean));
 return incoming.filter(c=>{const key=sourceKey(c); if(key&&keys.has(key))return false;if(key)keys.add(key);return true;});
}
