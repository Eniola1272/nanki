import { Quiz, Deck } from '../types';

export interface CommunityItem {
  id: string;
  kind: 'quiz' | 'deck';
  title: string;
  category: string;
  author: string;
  university: string;
  upvotes: number;
  description: string;
  itemCount: number;
  content: Quiz | Deck;
}

export const COMMUNITY_ITEMS: CommunityItem[] = [
  {
    id: 'comm-obgyn-1',
    kind: 'quiz',
    title: 'Obstetrics & Gynaecology Clinical Revision',
    category: 'Obstetrics & Gynaecology',
    author: 'Dr. Adaeze O.',
    university: 'College of Medicine, UNILAG',
    upvotes: 142,
    description: 'High-yield past exam questions covering PPROM, cervical cancer elimination targets, eclampsia MgSO4 protocols, and gynecological oncology.',
    itemCount: 44,
    content: {
      id: 'quiz-obgyn-comm',
      title: 'Obstetrics & Gynaecology Clinical Revision',
      category: 'Obstetrics & Gynaecology',
      description: 'High-yield past exam questions covering PPROM, cervical cancer, eclampsia MgSO4 protocols, and gynecological oncology.',
      questions: [
        {
          id: 'obgyn-q1',
          text: 'The triad of watery, blood-stained vaginal discharge, abdominal/pelvic pain, and a pelvic mass (hydrops tubae profluens) is known as:',
          timer: '30s',
          options: [
            "Latzko's triad (Fallopian tube cancer)",
            "Meigs' syndrome (Ovarian fibroma, ascites, pleural effusion)",
            "Fitz-Hugh-Curtis syndrome",
            "Saint's triad",
          ],
          correctAnswer: 0,
          explanation: "Latzko's triad of intermittent profuse watery vaginal discharge, pelvic pain, and a palpable adnexal mass is pathognomonic for primary fallopian tube carcinoma.",
        },
        {
          id: 'obgyn-q2',
          text: 'Which is an absolute indication for immediate delivery in Preterm Premature Rupture of Membranes (PPROM) regardless of gestational age?',
          timer: '30s',
          options: [
            'Overt Clinical Chorioamnionitis',
            'Amniotic fluid index of 5 cm without infection',
            'Gestational age of 28 weeks with reassuring fetal status',
            'Absence of uterine contractions',
          ],
          correctAnswer: 0,
          explanation: 'Clinical chorioamnionitis is an emergency requiring prompt induction or delivery and IV broad-spectrum antibiotics to prevent fatal maternal and neonatal sepsis.',
        },
        {
          id: 'obgyn-q3',
          text: 'The first clinical sign of Magnesium Sulfate (MgSO4) toxicity in severe pre-eclampsia is:',
          timer: '30s',
          options: [
            'Loss of deep tendon reflexes (Patellar reflex)',
            'Respiratory depression (< 12 breaths/min)',
            'Cardiac arrest',
            'Oliguria (< 30 mL/hr)',
          ],
          correctAnswer: 0,
          explanation: 'Loss of patellar reflexes occurs at 8-10 mg/dL, preceding respiratory depression (12-15 mg/dL) and cardiac arrest (> 15 mg/dL). Calcium gluconate is the antidote.',
        },
        {
          id: 'obgyn-q4',
          text: 'Regarding emergency contraception, which is NOT considered an emergency oral hormonal contraceptive?',
          timer: '30s',
          options: [
            'Nonoxynol-9 spermicidal gel',
            'Ulipristal acetate (EllaOne)',
            'Levonorgestrel 1.5mg single dose',
            'Combined estrogen-progestin (Yuzpe method)',
          ],
          correctAnswer: 0,
          explanation: 'Nonoxynol-9 is a spermicide used before intercourse and does not work as an emergency post-coital contraceptive.',
        },
      ],
    },
  },
  {
    id: 'comm-peds-deck',
    kind: 'deck',
    title: 'Pediatric Milestones & Red Flags',
    category: 'Pediatrics',
    author: 'Dr. Marcus Chen',
    university: 'Imperial College London',
    upvotes: 98,
    description: 'Gross motor, fine motor, speech, and social milestones from 2 months to 5 years with clinical developmental red flags.',
    itemCount: 16,
    content: {
      id: 'deck-peds-milestones',
      title: 'Pediatric Milestones & Red Flags',
      category: 'Pediatrics',
      cards: [
        {
          id: 'peds-c1',
          deckId: 'deck-peds-milestones',
          front: 'At what age should an infant sit unsupported without hand support?',
          back: '6 to 7 Months',
          extraNote: 'Red flag if not sitting unsupported by 9 months.',
        },
        {
          id: 'peds-c2',
          deckId: 'deck-peds-milestones',
          front: 'What is the developmental age when pincer grasp is mature (neat index-thumb tip grasp)?',
          back: '10 to 12 Months',
          extraNote: 'Crude pincer grasp begins at 9 months; neat pincer grasp matures by 12 months.',
        },
        {
          id: 'peds-c3',
          deckId: 'deck-peds-milestones',
          front: 'Red flag: Failure to walk independently by what age warrants urgent neurological evaluation?',
          back: '18 Months',
          extraNote: 'Consider Duchenne muscular dystrophy (check serum CK) or cerebral palsy.',
        },
        {
          id: 'peds-c4',
          deckId: 'deck-peds-milestones',
          front: 'At what age should a child construct a 2-word phrase (e.g., "want milk")?',
          back: '24 Months (2 Years)',
          extraNote: 'Rule of thumb: number of words in sentence matches age in years up to 4.',
        },
      ],
    },
  },
  {
    id: 'comm-em-quiz',
    kind: 'quiz',
    title: 'Emergency Medicine: Resuscitation & Tox',
    category: 'Emergency Medicine',
    author: 'Dr. Sarah K.',
    university: 'Johns Hopkins Medicine',
    upvotes: 112,
    description: 'ACLS shockable rhythms, airway management, and acute toxicology overdoses.',
    itemCount: 20,
    content: {
      id: 'quiz-em-resus',
      title: 'Emergency Medicine: Resuscitation & Tox',
      category: 'Emergency Medicine',
      description: 'ACLS shockable rhythms, airway management, and acute toxicology overdoses.',
      questions: [
        {
          id: 'em-q1',
          text: 'Which cardiac arrest rhythms are indicated for immediate unsynchronized defibrillation?',
          timer: '30s',
          options: [
            'Ventricular Fibrillation (VF) and Pulseless VT',
            'Asystole and Pulseless Electrical Activity (PEA)',
            'Atrial Fibrillation with Rapid Ventricular Response',
            'Third-Degree Complete Heart Block',
          ],
          correctAnswer: 0,
          explanation: 'Only VF and pulseless VT are shockable arrest rhythms. Asystole and PEA require high-quality CPR and Epinephrine 1mg IV every 3-5 minutes.',
        },
        {
          id: 'em-q2',
          text: 'What is the specific reversal agent for ethylene glycol or methanol toxicity to inhibit alcohol dehydrogenase?',
          timer: '30s',
          options: ['Fomepizole', 'N-acetylcysteine', 'Pralidoxime', 'Flumazenil'],
          correctAnswer: 0,
          explanation: 'Fomepizole competitively inhibits alcohol dehydrogenase (ADH), preventing toxic oxalic acid and formic acid formation.',
        },
      ],
    },
  },
  {
    id: 'comm-surg-deck',
    kind: 'deck',
    title: 'General Surgery: Acute Abdomen & Hernias',
    category: 'Surgery',
    author: 'Dr. Tariq M.',
    university: 'University of Edinburgh',
    upvotes: 85,
    description: 'Signs of peritonitis, imaging choices, bowel obstruction, and groin hernia anatomy.',
    itemCount: 18,
    content: {
      id: 'deck-surg-abdomen',
      title: 'General Surgery: Acute Abdomen & Hernias',
      category: 'Surgery',
      cards: [
        {
          id: 'surg-c1',
          deckId: 'deck-surg-abdomen',
          front: 'What anatomical structure differentiates an Indirect Inguinal Hernia from a Direct Inguinal Hernia?',
          back: 'Inferior Epigastric Vessels (Lateral = Indirect, Medial = Direct in Hesselbach triangle)',
          extraNote: 'Mnemonic: MDs are Liars (Medial = Direct, Lateral = Indirect).',
        },
        {
          id: 'surg-c2',
          deckId: 'deck-surg-abdomen',
          front: 'What sign describes right lower quadrant pain when palpating the left lower quadrant?',
          back: "Rovsing's Sign (indicates Acute Appendicitis)",
          extraNote: 'Caused by peritoneal irritation and retroperitoneal gas displacement towards the cecum.',
        },
      ],
    },
  },
];
