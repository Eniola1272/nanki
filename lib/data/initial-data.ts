import type { Quiz, Deck, UserProfile } from '@/types/nanki';
import { OBGYN_QUIZ } from './obgyn-quiz';

export const INITIAL_QUIZZES: Quiz[] = [
  OBGYN_QUIZ,
  {
    id: 'bio-respiration',
    title: 'Cellular Respiration',
    description: 'Comprehensive deep-dive into glycolysis, Krebs cycle, and the electron transport chain. Perfect for AP Bio prep.',
    category: 'Biology',
    masteredPercentage: 85,
    questions: [
      { id: 'q1', text: 'What is the powerhouse of the cell?', timer: '20s', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Lysosome'], correctOptionIndex: 1 },
      { id: 'q2', text: 'Which organelle is primarily responsible for generating cellular energy?', timer: '20s', options: ['The Nucleus', 'Ribosomes', 'Mitochondria', 'Golgi Apparatus'], correctOptionIndex: 2 },
      { id: 'q3', text: 'During glycolysis, glucose is broken down into two molecules of what?', timer: '20s', options: ['Pyruvate', 'Acetyl-CoA', 'Lactate', 'Ethanol'], correctOptionIndex: 0 },
      { id: 'q4', text: 'Where does the Krebs cycle take place in eukaryotic cells?', timer: '30s', options: ['Cytoplasm', 'Ribosome', 'Mitochondrial Matrix', 'Inner Mitochondrial Membrane'], correctOptionIndex: 2 },
      { id: 'q5', text: 'What is the net yield of ATP molecules per glucose molecule in glycolysis?', timer: '15s', options: ['2 ATP', '4 ATP', '32 ATP', '36 ATP'], correctOptionIndex: 0 },
    ],
  },
  {
    id: 'history-cold-war',
    title: 'Cold War Era',
    description: 'A study of the geopolitical tensions between the Soviet Union and the United States after World War II.',
    category: 'History',
    masteredPercentage: 40,
    questions: [
      { id: 'q-cw1', text: 'In what year was the Berlin Wall constructed?', timer: '20s', options: ['1945', '1953', '1961', '1989'], correctOptionIndex: 2 },
      { id: 'q-cw2', text: 'Who was the leader of the Soviet Union during the Cuban Missile Crisis?', timer: '20s', options: ['Joseph Stalin', 'Nikita Khrushchev', 'Leonid Brezhnev', 'Mikhail Gorbachev'], correctOptionIndex: 1 },
    ],
  },
  {
    id: 'physics-kinematics',
    title: 'Kinematics',
    description: 'Test your understanding of displacement, velocity, acceleration, and projectile motion equations.',
    category: 'Physics',
    masteredPercentage: 10,
    questions: [
      { id: 'q-k1', text: 'What is the formula representing acceleration?', timer: '20s', options: ['a = v/t', 'a = d/t', 'a = Δv/Δt', 'a = F * m'], correctOptionIndex: 2 },
    ],
  },
];

export const INITIAL_DECKS: Deck[] = [
  {
    id: 'deck-bio-101',
    title: 'Biology 101 - Cell Structures',
    description: 'Main structures and organelles in plant and animal cells.',
    category: 'Biology',
    author: '@dr_biology',
    cards: [
      { id: 'card-b1', front: 'Mitochondria', back: "The powerhouse of the cell, generating most of the cell's supply of adenosine triphosphate (ATP).", extraNote: 'Also involved in signaling, cellular differentiation, and cell death.' },
      { id: 'card-b2', front: 'Nucleus', back: 'The control center of the cell that contains most of the genetic material (DNA).', extraNote: 'Framed by a nuclear envelope with pores for RNA trafficking.' },
      { id: 'card-b3', front: 'Ribosome', back: 'The cellular machinery responsible for protein synthesis.', extraNote: 'Composed of RNA and proteins, located in cytoplasm or rough ER.' },
      { id: 'card-b4', front: 'Lysosome', back: 'Organelles containing digestive enzymes that break down waste materials.', extraNote: 'Active at acidic pH inside the membrane.' },
    ],
  },
  {
    id: 'deck-spanish',
    title: 'Spanish Vocab',
    description: 'Essential vocabulary and phrases for intermediate Spanish learners.',
    category: 'Languages',
    author: '@esp_master',
    cards: [
      { id: 'esp-1', front: 'El coche', back: 'The car' },
      { id: 'esp-2', front: 'La mesa', back: 'The table' },
      { id: 'esp-3', front: 'Agradecido', back: 'Thankful' },
      { id: 'esp-4', front: 'Desarrollar', back: 'To develop' },
    ],
  },
  {
    id: 'deck-calc',
    title: 'Calc Formulas',
    description: 'Common calculus derivatives, integrals, and limits theorems.',
    category: 'Math',
    author: '@calc_formulas',
    cards: [
      { id: 'calc-1', front: 'Derivative of ln(x)', back: '1/x' },
      { id: 'calc-2', front: 'Integral of sin(x) dx', back: '-cos(x) + C' },
      { id: 'calc-3', front: "Product Rule [f(x)g(x)]'", back: "f'(x)g(x) + f(x)g'(x)" },
    ],
  },
  {
    id: 'deck-art',
    title: 'Art History',
    description: 'Identify famous paintings, art movements, and historical eras.',
    category: 'Art',
    author: '@art_museum',
    cards: [
      { id: 'art-1', front: 'The Scream (1893)', back: 'Edvard Munch (Expressionism movement)' },
      { id: 'art-2', front: 'Guernica (1937)', back: 'Pablo Picasso (Cubism/Surrealism)' },
    ],
  },
];

export const INITIAL_PROFILE: UserProfile = {
  name: 'Learner',
  bio: 'Your learning journey, one quiz at a time.',
  avatar: '/avatar.svg',
  level: 1,
  xpProgress: 0,
  streak: 0,
  totalQuizzesTaken: 0,
  masteryPercentage: 0,
  personalBestStreak: 0,
  badges: [],
};
