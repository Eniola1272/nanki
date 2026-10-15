import { Quiz, Deck } from '../types';

export const SAMPLE_QUIZZES: Quiz[] = [
  {
    id: 'quiz-pharm-1',
    title: 'Clinical Pharmacology Essentials',
    category: 'Pharmacology',
    description: 'High-yield mechanisms of action, adverse reactions, and emergency antidotes.',
    masteredPercentage: 80,
    questions: [
      {
        id: 'q1',
        text: 'Which drug is the first-line antidote for acute acetaminophen (paracetamol) toxicity?',
        options: ['N-acetylcysteine', 'Naloxone', 'Flumazenil', 'Atropine'],
        correctAnswer: 0,
        explanation: 'N-acetylcysteine replenishes glutathione stores, preventing toxic NAPQI accumulation in hepatocytes.',
      },
      {
        id: 'q2',
        text: 'A patient on Digoxin develops premature ventricular contractions and hyperkalemia. Which is indicated?',
        options: ['Digoxin Immune Fab', 'Potassium Chloride IV', 'Calcium Gluconate', 'Quinidine'],
        correctAnswer: 0,
        explanation: 'Digoxin-specific antibody fragments (DigiFab) bind free intravascular digoxin and rapidly reverse toxicity.',
      },
      {
        id: 'q3',
        text: 'Beta-1 selective adrenergic antagonists are preferred over non-selective agents in asthmatic patients.',
        type: 'true-false',
        options: [
          'Metoprolol has higher affinity for beta-1 than beta-2 receptors',
          'Propranolol does not cause bronchoconstriction',
          'Atenolol can be safely given in acute severe bronchospasm',
        ],
        correctAnswer: 0,
        branchAnswers: { 0: 1, 1: 0, 2: 0 },
        explanation: 'Metoprolol and Atenolol are cardioselective beta-1 blockers; non-selective blockers like Propranolol trigger bronchospasm via beta-2 antagonism.',
      },
      {
        id: 'q4',
        text: 'Which antimicrobial is known for the "gray baby syndrome" due to immature UDP-glucuronyltransferase?',
        options: ['Chloramphenicol', 'Gentamicin', 'Ceftriaxone', 'Vancomycin'],
        correctAnswer: 0,
        explanation: 'Neonates lack sufficient glucuronyltransferase to metabolize chloramphenicol, leading to cardiovascular collapse and ashen-gray skin.',
      },
    ],
  },
  {
    id: 'quiz-cardio-1',
    title: 'Cardiovascular Diagnostics & ECGs',
    category: 'Cardiology',
    description: 'Arrhythmias, myocardial infarctions, and hemodynamic parameters.',
    masteredPercentage: 65,
    questions: [
      {
        id: 'qc1',
        text: 'ST elevation in leads II, III, and aVF indicates infarction in which vascular territory?',
        options: ['Right Coronary Artery (Inferior)', 'Left Anterior Descending (Anterior)', 'Left Circumflex (Lateral)', 'Left Main Stem'],
        correctAnswer: 0,
        explanation: 'Leads II, III, and aVF view the inferior wall of the left ventricle, predominantly supplied by the Right Coronary Artery (RCA).',
      },
      {
        id: 'qc2',
        text: 'What is the definitive initial treatment for an unstable patient in Ventricular Tachycardia with a pulse?',
        options: ['Synchronized Cardioversion', 'Defibrillation (Unsynchronized)', 'Amiodarone 150mg IV bolus', 'Vagal maneuvers'],
        correctAnswer: 0,
        explanation: 'Unstable tachyarrhythmias with a pulse require immediate synchronized cardioversion to avoid R-on-T induced ventricular fibrillation.',
      },
    ],
  },
];

export const SAMPLE_DECKS: Deck[] = [
  {
    id: 'deck-antidotes',
    title: 'Toxicology & Antidotes',
    category: 'Emergency Medicine',
    cards: [
      {
        id: 'c1',
        deckId: 'deck-antidotes',
        front: 'Antidote for Ethylene Glycol / Methanol Poisoning?',
        back: 'Fomepizole (or Ethanol if unavailable)',
        extraNote: 'Inhibits alcohol dehydrogenase, preventing conversion to toxic glycolic / formic acid.',
      },
      {
        id: 'c2',
        deckId: 'deck-antidotes',
        front: 'Antidote for Heparin-induced anticoagulation overdose?',
        back: 'Protamine Sulfate',
        extraNote: 'Positively charged protamine binds and neutralizes negatively charged heparin molecules.',
      },
      {
        id: 'c3',
        deckId: 'deck-antidotes',
        front: 'Antidote for Organophosphate / Sarin toxicity?',
        back: 'Atropine + Pralidoxime (2-PAM)',
        extraNote: 'Atropine blocks muscarinic receptor overstimulation; Pralidoxime reactivates acetylcholinesterase.',
      },
      {
        id: 'c4',
        deckId: 'deck-antidotes',
        front: 'Antidote for Beta-blocker overdose refractory to fluids?',
        back: 'Glucagon IV',
        extraNote: 'Stimulates adenylate cyclase independently of beta-adrenergic receptors, boosting intracellular cAMP.',
      },
    ],
  },
  {
    id: 'deck-cranial-nerves',
    title: 'Cranial Nerve Functions & Lesions',
    category: 'Neurology',
    cards: [
      {
        id: 'cn1',
        deckId: 'deck-cranial-nerves',
        front: 'Which cranial nerve provides sensory innervation to the anterior 2/3 of the tongue?',
        back: 'General sensory: CN V3 (Lingual nerve). Taste: CN VII (Chorda tympani).',
      },
      {
        id: 'cn2',
        deckId: 'deck-cranial-nerves',
        front: 'Uvula deviation to the right indicates lesion of which cranial nerve and side?',
        back: 'Left Cranial Nerve X (Vagus nerve)',
        extraNote: 'The uvula deviates AWAY from the side of the lesion (towards the intact muscular side).',
      },
    ],
  },
];
