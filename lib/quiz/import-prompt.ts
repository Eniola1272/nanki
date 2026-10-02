export const BULK_IMPORT_EXAMPLE = `Question 1: Which planet is known as the Red Planet?
A. Venus
B. Mars
C. Jupiter
D. Saturn
Answer: B

Question 2: What is the chemical formula for water?
A. CO2
B. O2
C. H2O
D. NaCl
Answer: C`;

export const BULK_IMPORT_PROMPT = `Convert the question bank or source material I paste or attach with this message into multiple-choice questions for Nanki's bulk quiz importer.

If I provide existing questions, preserve their meaning, options, and supplied correct answers. If I provide notes or other source material, create questions based only on that material. Follow any question count, topic, or difficulty I specify; otherwise convert all usable existing questions or create up to 20 questions from notes. Do not duplicate questions or include the example questions below unless they appear in my source.

Choose the correct question type from my source. Preserve branch-by-branch True/False questions as True/False; do not turn them into single-correct-answer questions. A quiz may mix both types.

For single-correct-answer questions, use this exact plain-text format:
- Begin each question with "Question N: " followed by the complete question on one line. Number questions consecutively starting at 1.
- Put each option on its own line, labelled "A. ", "B. ", "C. ", and so on. Use 2 to 6 options, labelled consecutively A through F; prefer 4 when creating new questions.
- Each question must have exactly one correct option. Immediately after its options, write "Answer: X" on a separate line, replacing X with the uppercase letter of that option.
- Leave one blank line between questions.
- Do not use Markdown, code fences, tables, headings, introductory text, explanations, citations, a separate answer key, or closing remarks in the final quiz output.
- Do not mark options with asterisks, checkmarks, or other answer indicators. Use only the "Answer: X" line. Write multiplication as × rather than *.
- Keep each question and each option on one line, including any necessary context from the source. Do not rely on an image or attachment that will be absent from the pasted quiz.
- Convert multiple-answer questions into single-answer questions only when the source supports a clear, unambiguous answer. Do not invent facts or guess an answer key. If essential information or correct answers are missing or contradictory, ask me to clarify before producing the final formatted quiz.

For branch-by-branch True/False questions, use this exact format instead:
Question 1: Regarding the following statements:
Type: True/False
A. Water has the formula H2O.
B. Mars is a star.
C. Earth is a planet.
D. Oxygen has the chemical symbol O.
Answers: A=T, B=F, C=T, D=T

Each True/False question must have 2–6 statements labelled consecutively A through F. Give exactly one T or F for EVERY statement on a single comma-separated Answers line. Use the source answer key; ask for clarification if a branch's correct answer is uncertain. Do not include an Answer line for this type.

Single-correct-answer formatting example:
${BULK_IMPORT_EXAMPLE}

Before replying with the final quiz, check that every question has 2–6 options, exactly one Answer line for single-answer questions or one complete Answers line for True/False questions, with keys matching the options. Output only the formatted quiz so I can paste your whole response into Nanki.

My question bank or source material follows (or is attached):`;
