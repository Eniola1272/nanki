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

export const TRUE_FALSE_IMPORT_EXAMPLE = `Question 1: Regarding the Solar System:
Type: True/False
A. Earth is a planet.
B. The Sun is a planet.
C. Mars is known as the Red Planet.
D. The Moon is a star.
Answers: A=T, B=F, C=T, D=F

Question 2: Regarding water:
Type: True/False
A. Its chemical formula is H2O.
B. It contains hydrogen.
C. It contains carbon in its chemical formula.
D. Ice is solid water.
E. Water vapour is the gaseous form of water.
Answers: A=T, B=T, C=F, D=T, E=T`;

export const BULK_IMPORT_PROMPT = `Convert the question bank or source material I paste or attach with this message into multiple-choice questions for Nanki's bulk quiz importer.

If I provide existing questions, preserve their meaning, options, and supplied correct answers. If I provide notes or other source material, create questions based only on that material.

For single-correct-answer questions, use this exact format:
Question 1: Stem text here?
A. Option 1
B. Option 2
C. Option 3
D. Option 4
Answer: B

For True/False multi-branch questions, use this exact format:
Question 1: Stem text here:
Type: True/False
A. First statement
B. Second statement
C. Third statement
D. Fourth statement
Answers: A=T, B=F, C=T, D=F

Output only the formatted quiz text so I can copy and paste directly into Nanki.`;

export const TRUE_FALSE_IMPORT_PROMPT = `Convert the question bank or source material I paste or attach into a branch-by-branch True/False quiz for Nanki. Every statement A, B, C, D (and E or F when present) requires its OWN True or False answer.

Required output format:
Question 1: Stem text here:
Type: True/False
A. First statement
B. Second statement
C. Third statement
D. Fourth statement
Answers: A=T, B=F, C=T, D=F

Output only plain text so I can copy and paste directly into Nanki.`;
