import type { Quiz } from '@/types/nanki';

export const PAEDIATRICS_TF_QUIZ: Quiz = {
  "id": "paediatrics-tf-batch-1",
  "title": "Paediatrics True/False — Batch 1",
  "description": "40 questions from Paediatrics_TF_Batch_1_Pages_1-10.docx. Answer each statement independently. Answer keys and explanations are reproduced from the supplied revision document, including its qualified and historical answers; they have not been independently verified.",
  "category": "Medicine",
  "published": false,
  "questions": [
    {
      "id": "paeds-tf-1",
      "type": "true-false",
      "text": "About febrile convulsions",
      "timer": "120s",
      "options": [
        "70% are complex.",
        "Can be simple, complex or both.",
        "Generalized seizures are simple seizures.",
        "Intracranial infection can be present.",
        "Commonest seizure of childhood."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        false,
        false,
        true,
        false,
        true
      ],
      "branchExplanations": [
        "Most febrile seizures are simple; complex febrile seizures are the minority.",
        "The standard classification is simple or complex febrile seizure.",
        "Source answer: TRUE (qualified). A simple febrile seizure is generalized, lasts under 15 minutes and does not recur within 24 hours. Generalization alone is not sufficient.",
        "A febrile seizure is defined in the absence of CNS infection. If meningitis/encephalitis is present, the seizure is not classified as a febrile seizure.",
        "Febrile seizures are the most common seizure disorder in young children."
      ],
      "explanation": "BOARD MEMORY: Simple = generalized + <15 min + once in 24 h."
    },
    {
      "id": "paeds-tf-2",
      "type": "true-false",
      "text": "Late presentation of biliary atresia",
      "timer": "120s",
      "options": [
        "Failure to thrive.",
        "Hepatosplenomegaly may give an impression of normal weight for age.",
        "Xanthomas.",
        "Ascites.",
        "Gastrointestinal bleeding."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        true,
        true,
        true,
        true,
        true
      ],
      "branchExplanations": [
        "Chronic cholestasis and poor nutrient absorption can cause growth failure.",
        "Organomegaly can contribute to measured body weight despite poor nutritional status.",
        "Long-standing cholestasis can produce marked hypercholesterolaemia and xanthomas.",
        "Progressive biliary cirrhosis and portal hypertension may cause ascites.",
        "Portal hypertension can cause varices and gastrointestinal bleeding."
      ]
    },
    {
      "id": "paeds-tf-3",
      "type": "true-false",
      "text": "Examination/radiographic findings in cardiac disease in children",
      "timer": "120s",
      "options": [
        "Cardiothoracic ratio of 50% is in keeping with TOF.",
        "Pulmonary vascular markings extending to the lateral third suggest pulmonary atresia.",
        "Boot-shaped heart shows right atrial enlargement.",
        "Right-sided gastric shadow shows dextrocardia."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        false,
        false,
        false,
        false
      ],
      "branchExplanations": [
        "TOF often has a normal or only mildly increased heart size; cardiomegaly is not a defining radiographic feature.",
        "Pulmonary atresia usually causes reduced pulmonary vascularity, not increased peripheral markings.",
        "The boot-shaped heart of TOF is mainly due to right ventricular hypertrophy with an upturned apex and concavity of the pulmonary segment.",
        "A right-sided gastric bubble suggests situs inversus/abnormal situs; dextrocardia refers to the cardiac apex pointing right."
      ]
    },
    {
      "id": "paeds-tf-4",
      "type": "true-false",
      "text": "12-hour-old AGA baby delivered by elective CS at 30 weeks GA",
      "timer": "120s",
      "options": [
        "Respiratory rate 88/min.",
        "Oxygen saturation 80%.",
        "Dry, meconium-stained skin.",
        "Good coordination of suck and swallow reflex.",
        "Sunburst appearance is indicated."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        true,
        true,
        false,
        false,
        false
      ],
      "branchExplanations": [
        "This is marked neonatal tachypnoea and is consistent with respiratory distress in a very preterm infant.",
        "An SpO2 of 80% at 12 hours is abnormally low and indicates significant hypoxaemia.",
        "Dry peeling/meconium-stained skin is more characteristic of post-term infants, not a 30-week preterm infant.",
        "Coordinated suck-swallow-breathe usually matures around 34 weeks; it is not expected to be well coordinated at 30 weeks.",
        "A 'sunburst' appearance is not a routine expected feature of uncomplicated prematurity; this wording is not a standard clinical feature of a 30-week preterm infant."
      ]
    },
    {
      "id": "paeds-tf-5",
      "type": "true-false",
      "text": "Development of sexual characteristics",
      "timer": "120s",
      "options": [
        "FSH and LH are responsible for growth of scrotum and penis in males.",
        "Testosterone is responsible for acne, hair growth and adult body odour in both sexes.",
        "In girls, the first sign is growth spurt followed by breast development.",
        "In boys, the first sign is testicular enlargement.",
        "Hair in the medial thigh correlates to Tanner stage IV."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        false,
        false,
        false,
        true,
        false
      ],
      "branchExplanations": [
        "LH stimulates Leydig-cell testosterone production; androgen action drives penile/scrotal development. FSH mainly supports Sertoli cells and spermatogenesis.",
        "Androgens contribute to these changes in both sexes, but saying testosterone alone is responsible is too absolute; adrenal and gonadal androgens are involved.",
        "Breast budding (thelarche) is usually the first visible sign of puberty; peak height velocity follows.",
        "Testicular enlargement is the earliest reliable sign of male puberty.",
        "Adult-type pubic hair spreading to the medial thighs is Tanner stage V; stage IV has adult-type hair but a smaller distribution."
      ],
      "explanation": "BOARD MEMORY: Girl: breast first. Boy: testes first. Pubic hair to thighs = Tanner V."
    },
    {
      "id": "paeds-tf-6",
      "type": "true-false",
      "text": "Immunization in Nigeria (principles tested in this older paper)",
      "timer": "120s",
      "options": [
        "Pentavalent vaccine contains diphtheria, pertussis, tetanus, Hib and hepatitis B antigens.",
        "MMR is on the routine Nigerian infant schedule.",
        "First dose of hepatitis B is given at birth.",
        "BCG vaccine is given intramuscularly.",
        "Oral polio vaccine is no longer necessary."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        true,
        false,
        true,
        false,
        false
      ],
      "branchExplanations": [
        "Pentavalent vaccine combines DPT + hepatitis B + Haemophilus influenzae type b.",
        "Source answer: FALSE (for the schedule reflected by this paper). Nigeria's routine programme historically used measles-containing vaccine rather than routine MMR. Schedules can be updated, so current national guidance should be checked for clinical practice.",
        "A hepatitis B birth dose is recommended as early as possible after birth.",
        "BCG is administered intradermally.",
        "Polio immunization remains necessary; national programmes may use OPV and IPV according to schedule."
      ]
    },
    {
      "id": "paeds-tf-7",
      "type": "true-false",
      "text": "Sustainable Development Goals (SDGs)",
      "timer": "120s",
      "options": [
        "They are programmes set only by heads of government of middle- and low-income countries.",
        "Only Goal 3 has targets and indicators specific to health.",
        "Goals 1-17 are related to health.",
        "A target is to reduce under-5 mortality to at least as low as 25 per 1,000 live births by 2030.",
        "They will be replaced by the Millennium Development Goals when they expire in 2030."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        false,
        true,
        true,
        true,
        false
      ],
      "branchExplanations": [
        "The SDGs are global goals adopted by all UN member states.",
        "Source answer: TRUE (exam framing). SDG 3 is the dedicated health goal, although health is also influenced by and reflected in several other SDGs.",
        "Source answer: TRUE (broadly). All SDGs affect determinants of health directly or indirectly.",
        "This is an SDG 3.2 target.",
        "The MDGs preceded the SDGs; they do not replace the SDGs."
      ]
    },
    {
      "id": "paeds-tf-8",
      "type": "true-false",
      "text": "8-year-old with oedema, oliguria, proteinuria +2 and BP 180/130 mmHg",
      "timer": "120s",
      "options": [
        "Gallop rhythm may be found on cardiovascular examination.",
        "Kidneys may be normal-sized on ultrasound.",
        "Serum creatinine of 3.5 mg/dL is consistent.",
        "Fluid challenge with IV normal saline is appropriate.",
        "IV furosemide is contraindicated."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        true,
        true,
        true,
        false,
        false
      ],
      "branchExplanations": [
        "Severe hypertension and fluid overload can cause heart failure, in which a gallop rhythm may occur.",
        "Acute glomerulonephritis can have normal-sized or mildly enlarged kidneys.",
        "Significant acute kidney injury may accompany severe glomerulonephritis.",
        "With oedema, severe hypertension and probable fluid overload, routine fluid bolus can worsen pulmonary oedema.",
        "Loop diuretics may be useful for fluid overload and hypertension if there is adequate renal responsiveness."
      ]
    },
    {
      "id": "paeds-tf-9",
      "type": "true-false",
      "text": "Diphtheria",
      "timer": "120s",
      "options": [
        "It is caused by a Gram-positive anaerobic diplococcus.",
        "Chest X-ray is often normal.",
        "Age below 4 years is itself a poor prognostic factor.",
        "A third-generation cephalosporin is the standard indicated antibiotic."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        false,
        true,
        false,
        false
      ],
      "branchExplanations": [
        "Corynebacterium diphtheriae is a Gram-positive, club-shaped bacillus and is not a diplococcus.",
        "Diphtheria is primarily an upper-airway/toxin-mediated disease; chest radiography may be normal unless there are pulmonary complications.",
        "Poor prognosis is more strongly linked to delayed treatment, extensive membrane, airway obstruction and toxic complications such as myocarditis.",
        "Classically recommended therapy uses diphtheria antitoxin plus erythromycin/macrolide or penicillin; cephalosporins are not standard first-line therapy."
      ]
    },
    {
      "id": "paeds-tf-10",
      "type": "true-false",
      "text": "Disorders of morphogenesis - correctly matched?",
      "timer": "120s",
      "options": [
        "Malformation - congenital heart disease.",
        "Deformation - amniotic bands.",
        "Disruption - clubfoot.",
        "Dysplasia - multicystic kidney.",
        "Dysplasia - cleft lip and palate."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        true,
        false,
        false,
        true,
        false
      ],
      "branchExplanations": [
        "A malformation is an intrinsic error of organ development; many congenital heart defects fit this category.",
        "Amniotic bands cause disruption, in which previously normal tissue is destroyed by an extrinsic process.",
        "Typical positional clubfoot may be a deformation due to mechanical forces; disruption is tissue destruction.",
        "Source answer: TRUE (conceptually). Dysplasia is abnormal cellular/tissue organization; renal dysplasia can produce multicystic dysplastic kidney.",
        "Cleft lip/palate is a malformation due to abnormal fusion/development, not a dysplasia."
      ]
    },
    {
      "id": "paeds-tf-11",
      "type": "true-false",
      "text": "3-day-old with bleeding from nose, ear and umbilical cord; apparently well; PCV 33%",
      "timer": "120s",
      "options": [
        "Exclusive breastfeeding and maternal phenobarbitone use are important positive history.",
        "Requires exchange blood transfusion.",
        "PCV is within normal neonatal limits.",
        "PT/PTTK is normal.",
        "Oral vitamin K1 is required for treatment."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        true,
        false,
        false,
        false,
        false
      ],
      "branchExplanations": [
        "Exclusive breastfeeding provides relatively little vitamin K, and maternal enzyme-inducing anticonvulsants can increase risk of vitamin-K-deficiency bleeding.",
        "Vitamin K is the key treatment; severe blood loss/coagulopathy may require blood products, but exchange transfusion is not routine.",
        "A PCV of 33% is low for a newborn and suggests anaemia/blood loss.",
        "Vitamin-K-deficiency bleeding typically prolongs PT and often aPTT.",
        "Active bleeding is treated with parenteral vitamin K (commonly IV/IM depending on setting) plus supportive blood products if needed."
      ]
    },
    {
      "id": "paeds-tf-12",
      "type": "true-false",
      "text": "2-year-old with fever, cough, weight loss for 4 weeks and seizures - tuberculosis",
      "timer": "120s",
      "options": [
        "It would be reasonable to make a presumptive diagnosis of tuberculosis.",
        "Chest X-ray would most likely show cavities.",
        "AFB microscopy is the appropriate screening test because the case is urgent.",
        "Treatment would include rifampicin, pyrazinamide and streptomycin.",
        "Treatment is for 12 months."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        true,
        false,
        false,
        false,
        false
      ],
      "branchExplanations": [
        "Chronic cough/fever/weight loss in a young child in a TB-endemic setting can justify presumptive evaluation, especially with possible CNS involvement.",
        "Cavitation is less common in young children; primary TB more often shows hilar/mediastinal lymphadenopathy or parenchymal disease.",
        "Young children are often paucibacillary; rapid molecular testing (e.g., Xpert MTB/RIF on an appropriate specimen) is preferred where available.",
        "Modern first-line regimens generally use isoniazid, rifampicin, pyrazinamide and ethambutol; streptomycin is not routine first-line therapy.",
        "Source answer: FALSE (current standard). Duration depends on disease site and guideline; uncomplicated drug-susceptible pulmonary TB is usually shorter, while TB meningitis is treated longer. A blanket 12 months is not universally correct."
      ]
    },
    {
      "id": "paeds-tf-13",
      "type": "true-false",
      "text": "1-year-old with altered sensorium, fever and recent convulsion - consciousness evaluation",
      "timer": "120s",
      "options": [
        "Adult GCS.",
        "Paediatric GCS.",
        "AVPU.",
        "Blantyre coma score.",
        "Gross Motor Function Classification System."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        false,
        true,
        true,
        true,
        false
      ],
      "branchExplanations": [
        "The standard adult verbal component is unsuitable for a preverbal child.",
        "Paediatric Glasgow Coma Scale adapts responses for age and is appropriate.",
        "AVPU is a rapid validated bedside assessment of level of consciousness.",
        "The Blantyre coma score is useful in young children, particularly in cerebral malaria settings.",
        "GMFCS classifies motor function in cerebral palsy; it is not an acute coma assessment."
      ]
    },
    {
      "id": "paeds-tf-14",
      "type": "true-false",
      "text": "3-year-old with lifelong poor urinary stream, straining, distended lower abdomen, hypertension and creatinine 1.5 mg/dL",
      "timer": "120s",
      "options": [
        "Anthropometry is within normal limits (15 kg, 100 cm).",
        "Micturating cystourethrogram is important.",
        "Most likely diagnosis is PUJ obstruction.",
        "Keyhole sign is consistent.",
        "Urgent dialysis is required."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        true,
        true,
        false,
        true,
        false
      ],
      "branchExplanations": [
        "These measurements are broadly appropriate for a 3-year-old and do not by themselves indicate growth failure.",
        "MCUG/VCUG is central to demonstrating posterior urethral valves and associated reflux.",
        "Poor stream, straining and bladder distension from infancy strongly suggest bladder outlet obstruction, especially posterior urethral valves.",
        "The keyhole sign on ultrasound is classically associated with posterior urethral valves.",
        "Dialysis is reserved for severe/refractory renal failure indications; the priority is stabilization and relief of urinary obstruction."
      ]
    },
    {
      "id": "paeds-tf-15",
      "type": "true-false",
      "text": "Infant feeding and nutrition",
      "timer": "120s",
      "options": [
        "Infant feeding is individually determined.",
        "Exclusive breastfeeding prevents bifidobacterial infection.",
        "Neonatal hypoxia may be an indication to delay full enteral feeding.",
        "Fatty acid content in human milk is less than in cow's milk.",
        "Caloric intake for infant nutrition is 110-140 kcal/kg/day."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        true,
        false,
        true,
        false,
        true
      ],
      "branchExplanations": [
        "Feeding plans depend on gestational age, weight, clinical stability and feeding ability.",
        "Breast milk promotes beneficial bifidobacterial colonization; bifidobacteria are generally protective commensals, not an infection to prevent.",
        "Significant hypoxia/asphyxia can impair gut perfusion; feeds are advanced cautiously according to clinical stability.",
        "Human milk contains substantial fat and a more favorable essential/long-chain polyunsaturated fatty-acid profile.",
        "Source answer: TRUE (approximate). Energy needs in infancy commonly fall around this range, with higher needs in some preterm/growth-restricted infants."
      ]
    },
    {
      "id": "paeds-tf-16",
      "type": "true-false",
      "text": "Preterm infants",
      "timer": "120s",
      "options": [
        "Maternal hypertension is a risk factor.",
        "Coordination of sucking and swallowing is expected at 30 weeks.",
        "Fluid requirement is directly proportional to weight and gestational age.",
        "Secretory IgA is of limited value compared with term babies.",
        "Neutrophils are of higher quality."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        true,
        false,
        false,
        false,
        false
      ],
      "branchExplanations": [
        "Hypertensive disorders can lead to medically indicated preterm delivery and fetal growth restriction.",
        "Reliable suck-swallow-breathe coordination generally develops closer to 34 weeks.",
        "Very preterm infants often require relatively more fluid per kg because of greater insensible losses; requirements are not simply directly proportional to gestational age.",
        "Secretory IgA from breast milk is especially valuable to preterm infants with immature mucosal immunity.",
        "Preterm infants have impaired neutrophil storage, chemotaxis and function, increasing infection risk."
      ]
    },
    {
      "id": "paeds-tf-17",
      "type": "true-false",
      "text": "Turner syndrome",
      "timer": "120s",
      "options": [
        "Karyotype is indicated.",
        "High hairline is typical.",
        "It is transmitted directly from parent to offspring.",
        "Most common chromosomal abnormality.",
        "Hormonal therapy is indicated."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        true,
        false,
        false,
        false,
        true
      ],
      "branchExplanations": [
        "Chromosomal analysis confirms the diagnosis and defines mosaicism.",
        "A low posterior hairline and webbed neck are classic features.",
        "Most cases result from sporadic sex-chromosome nondisjunction or mosaicism, not Mendelian inheritance.",
        "Turner syndrome is a common sex-chromosome disorder but is not the most common chromosomal abnormality overall.",
        "Growth hormone may improve height and estrogen replacement is used to induce/maintain secondary sexual characteristics."
      ]
    },
    {
      "id": "paeds-tf-18",
      "type": "true-false",
      "text": "Correctly linked",
      "timer": "120s",
      "options": [
        "Non-severe community-acquired pneumonia - high-dose amoxicillin.",
        "Severe community-acquired pneumonia - first-line ceftriaxone.",
        "Bronchial asthma - wheeze.",
        "URTI - stridor."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        true,
        false,
        true,
        false
      ],
      "branchExplanations": [
        "Oral amoxicillin is a standard first-line agent for uncomplicated community-acquired bacterial pneumonia in children.",
        "Source answer: FALSE (general principle). Severe pneumonia requires parenteral antibiotics, but exact first-line choice depends on age, immunization status and local guideline; ceftriaxone is not universally the sole first-line option.",
        "Wheeze is a characteristic feature of asthma, although it may be absent in a very severe 'silent chest'.",
        "Stridor indicates upper-airway obstruction (e.g., croup), not an ordinary uncomplicated URTI."
      ]
    },
    {
      "id": "paeds-tf-19",
      "type": "true-false",
      "text": "2-year-old with cough, coryza, fever and maculopapular rash; last immunization at 6 months",
      "timer": "120s",
      "options": [
        "All he requires is an antipyretic.",
        "He requires steroids and antibiotics.",
        "He is to be admitted and isolated while maintaining contact precautions.",
        "Clinical evaluation is required to make a diagnosis."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        false,
        false,
        false,
        true
      ],
      "branchExplanations": [
        "Suspected measles requires supportive care including vitamin A and assessment/treatment of complications; infection-control measures are also important.",
        "Routine steroids and antibiotics are not indicated unless there is a specific complication or bacterial superinfection.",
        "Source answer: FALSE (wording). Isolation is appropriate, but measles requires airborne precautions rather than contact precautions alone.",
        "Measles is often diagnosed clinically from fever, cough/coryza/conjunctivitis and characteristic rash, with laboratory confirmation where indicated."
      ]
    },
    {
      "id": "paeds-tf-20",
      "type": "true-false",
      "text": "Infant with fever, vomiting and maculopapular rash; dyspnoea and lung crepitations",
      "timer": "120s",
      "options": [
        "No tests at all may be required.",
        "Myocarditis is indicated.",
        "Sending serum for serology can be used to confirm diagnosis.",
        "Diagnosis of pneumonia is indicated.",
        "Antibiotic is indicated for crepitations."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        false,
        false,
        true,
        true,
        true
      ],
      "branchExplanations": [
        "A sick infant with respiratory findings needs clinical assessment and investigations guided by severity.",
        "Crepitations and dyspnoea do not by themselves establish myocarditis.",
        "Serology can confirm certain viral/exanthematous infections when clinically indicated.",
        "Fever, dyspnoea and lung crepitations are compatible with pneumonia.",
        "Source answer: TRUE (if bacterial pneumonia suspected). When clinical findings support bacterial pneumonia, appropriate antibiotics are indicated; crepitations alone are not sufficient without the overall clinical picture."
      ]
    },
    {
      "id": "paeds-tf-21",
      "type": "true-false",
      "text": "Developmental milestones - correctly matched",
      "timer": "120s",
      "options": [
        "Pincer grasp - 6 months.",
        "Dry at night - 2 years.",
        "Tower of 2 blocks - 12 months.",
        "Waves bye-bye - 7 months.",
        "Draws a circle - 36 months."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        false,
        false,
        false,
        false,
        true
      ],
      "branchExplanations": [
        "A mature pincer grasp develops around 9-10 months.",
        "Night-time continence is usually achieved later than daytime continence, commonly around 4-5 years.",
        "A 2-block tower is usually expected around 15 months.",
        "Waving bye-bye is usually acquired around 9 months.",
        "Copying/drawing a circle is a typical 3-year fine-motor milestone."
      ]
    },
    {
      "id": "paeds-tf-22",
      "type": "true-false",
      "text": "Iron deficiency anaemia",
      "timer": "120s",
      "options": [
        "Most common anaemia worldwide.",
        "Hookworm infestation is a common cause.",
        "High serum ferritin is a positive diagnostic finding.",
        "Treatment is giving iron for 2 weeks.",
        "Blue sclera can occur."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        true,
        true,
        false,
        false,
        true
      ],
      "branchExplanations": [
        "Iron deficiency is the most common nutritional deficiency and the most common cause of anaemia worldwide.",
        "Chronic intestinal blood loss from hookworm can cause iron deficiency.",
        "Ferritin is usually low in iron deficiency, though inflammation can falsely elevate it.",
        "Iron therapy continues for months after haemoglobin correction to replenish stores.",
        "Blue sclera is a recognized, though nonspecific, feature of iron deficiency."
      ]
    },
    {
      "id": "paeds-tf-23",
      "type": "true-false",
      "text": "10-month-old immunised according to Nigerian NPI schedule - vaccines already received",
      "timer": "120s",
      "options": [
        "IPV2.",
        "Second dose of measles-containing vaccine.",
        "Third dose of pentavalent vaccine.",
        "Meningococcal vaccine.",
        "Yellow fever vaccine."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        true,
        false,
        true,
        true,
        true
      ],
      "branchExplanations": [
        "Source answer: TRUE (schedule-dependent). By 10 months, an infant following schedules that include two IPV doses should have received them.",
        "The second measles-containing dose is given later than 10 months in the schedule reflected by this paper.",
        "Pentavalent doses are completed in early infancy.",
        "Source answer: TRUE (current Nigerian schedule-dependent). MenA has been incorporated into Nigeria's routine schedule in infancy; exact timing should follow the current national schedule.",
        "Yellow fever vaccine is given in late infancy, classically at 9 months in Nigeria."
      ]
    },
    {
      "id": "paeds-tf-24",
      "type": "true-false",
      "text": "11-year-old with 3 years of swelling, breathlessness, orthopnoea, oliguria, BP 170/120 and creatinine 8.5",
      "timer": "120s",
      "options": [
        "Apex beat at left 6th intercostal space outside midclavicular line.",
        "Diagnosis is acute glomerulonephritis.",
        "PCV 16%.",
        "Haemodialysis is contraindicated.",
        "IV normal saline 20 mL/kg over 30 minutes."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        true,
        false,
        true,
        false,
        false
      ],
      "branchExplanations": [
        "Long-standing severe hypertension/volume overload can cause cardiomegaly with displaced apex.",
        "The long duration, severe renal impairment and chronic symptoms point more toward chronic kidney disease.",
        "Severe anaemia is common in advanced CKD because of reduced erythropoietin and other factors.",
        "Advanced CKD with appropriate indications may require dialysis.",
        "A child with oedema, hypertension and probable fluid overload should not receive routine rapid saline bolus."
      ]
    },
    {
      "id": "paeds-tf-25",
      "type": "true-false",
      "text": "Adolescence according to WHO",
      "timer": "120s",
      "options": [
        "Between ages 10 and 19 years.",
        "There are 3 stages.",
        "Mid-adolescence is 13-16 years.",
        "Puberty commonly occurs during adolescence.",
        "Adolescents constitute 40% of the Nigerian population."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        true,
        true,
        true,
        true,
        false
      ],
      "branchExplanations": [
        "WHO defines adolescence as ages 10-19 years.",
        "It is commonly divided into early, middle and late adolescence.",
        "Source answer: TRUE (approximate classification). Definitions vary slightly, but 13-16 years is commonly used for middle adolescence.",
        "Most pubertal development occurs during adolescence.",
        "That proportion is too high for the 10-19-year age group alone."
      ]
    },
    {
      "id": "paeds-tf-26",
      "type": "true-false",
      "text": "2-year-old with fever, vomiting, lethargy, mild jaundice and dehydration in malaria-endemic setting",
      "timer": "120s",
      "options": [
        "Meningitis is the most likely diagnosis.",
        "Random blood glucose is mandatory.",
        "Malaria is caused by gametocytes.",
        "Malaria rapid diagnostic testing should be done promptly.",
        "IM chloroquine is indicated initially."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        false,
        true,
        false,
        true,
        false
      ],
      "branchExplanations": [
        "The presentation is compatible with severe malaria, though meningitis remains an important differential in a lethargic febrile child.",
        "Hypoglycaemia is a dangerous complication of severe malaria and must be checked promptly.",
        "Clinical malaria is produced by asexual blood-stage parasites; gametocytes are the sexual forms responsible for transmission to mosquitoes.",
        "Parasitological confirmation with RDT or microscopy should be obtained urgently when feasible without delaying emergency treatment.",
        "Chloroquine is not standard treatment for severe falciparum malaria; parenteral artesunate is preferred."
      ]
    },
    {
      "id": "paeds-tf-27",
      "type": "true-false",
      "text": "Transcranial Doppler (TCD) in HbSS",
      "timer": "120s",
      "options": [
        "Required at all ages.",
        "Velocity <165 cm/s requires hydroxyurea.",
        "Velocity >220 cm/s will need chronic transfusion.",
        "It is not a secondary prevention method for stroke.",
        "Hydroxyurea is a primary method of prevention."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        false,
        false,
        true,
        true,
        true
      ],
      "branchExplanations": [
        "Routine stroke-risk TCD screening is targeted mainly to children with sickle cell anaemia in the childhood age range, not all ages.",
        "A low/normal TCD velocity does not by itself mandate hydroxyurea.",
        "Source answer: TRUE (high-risk principle). Abnormally high TCD velocities indicate high stroke risk; chronic transfusion is established primary stroke prevention for abnormal TCD.",
        "TCD is primarily a screening/risk-stratification tool; secondary prevention after stroke relies on chronic transfusion and specialist management.",
        "Source answer: TRUE (selected settings). Hydroxyurea can be used for primary stroke prevention in selected children under specialist protocols, particularly when transfusion is not feasible or after appropriate transfusion-based management."
      ]
    },
    {
      "id": "paeds-tf-28",
      "type": "true-false",
      "text": "16-hour-old term neonate with jaundice",
      "timer": "120s",
      "options": [
        "Encourage exclusive breastfeeding and review in 48 hours only.",
        "Breast-milk jaundice is the most likely cause.",
        "A lower bilirubin threshold for exchange may apply with acidosis/sepsis.",
        "Rhesus isoimmunisation may be a cause.",
        "G6PD deficiency is very unlikely."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        false,
        false,
        true,
        true,
        false
      ],
      "branchExplanations": [
        "Jaundice in the first 24 hours is pathological until proven otherwise and needs urgent bilirubin measurement and evaluation.",
        "Breast-milk jaundice typically appears later; jaundice at 16 hours suggests haemolysis, infection or another pathological cause.",
        "Neurotoxicity risk factors such as sepsis and acidosis lower treatment thresholds.",
        "Immune haemolysis can cause very early neonatal jaundice.",
        "G6PD deficiency is an important cause of severe neonatal hyperbilirubinaemia, especially in populations where it is common."
      ]
    },
    {
      "id": "paeds-tf-29",
      "type": "true-false",
      "text": "Transition from fetal to neonatal life",
      "timer": "120s",
      "options": [
        "Reduced pulmonary vascular resistance leads to left-to-right shunting of blood.",
        "Aortic oxygen pressure is 45%.",
        "Prematurity predisposes to need for resuscitation at birth.",
        "After 1 minute of resuscitation, if not breathing, start chest compressions.",
        "Primary apnoea can be reversed by tactile stimulation after birth."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        false,
        false,
        true,
        false,
        true
      ],
      "branchExplanations": [
        "After birth pulmonary vascular resistance falls, pulmonary blood flow rises, and fetal shunts functionally close; persistent left-to-right flow through a PDA may occur transiently but is not the defining transition.",
        "Oxygen tension/saturation rises substantially after effective ventilation; '45%' is not a normal aortic oxygen saturation.",
        "Preterm infants are at increased risk because of immature lungs, poor tone and temperature instability.",
        "Effective positive-pressure ventilation is the priority. Chest compressions are started if heart rate remains <60/min despite adequate ventilation.",
        "In primary apnoea, stimulation may initiate breathing; secondary apnoea requires positive-pressure ventilation."
      ]
    },
    {
      "id": "paeds-tf-30",
      "type": "true-false",
      "text": "7-year-old with jaundice, dark urine, altered sensorium, INR 1.6 and markedly abnormal liver enzymes",
      "timer": "120s",
      "options": [
        "History of previous blood transfusion is important.",
        "Abdominal CT is mandatory.",
        "Hepatic failure is a recognized diagnosis.",
        "Chronic hepatitis B is the typical recognized cause of this acute presentation.",
        "She may benefit from liver transplantation."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        true,
        false,
        true,
        false,
        true
      ],
      "branchExplanations": [
        "It can identify exposure risk for viral hepatitis.",
        "Imaging may be useful selectively, but CT is not mandatory to diagnose acute liver failure.",
        "Coagulopathy plus encephalopathy in acute liver disease is consistent with acute liver failure.",
        "Acute liver failure is more commonly due to acute viral/toxic/metabolic causes; chronic HBV alone does not usually present this way unless there is acute decompensation.",
        "Urgent transplant assessment is indicated in severe acute liver failure with poor prognostic features."
      ]
    },
    {
      "id": "paeds-tf-31",
      "type": "true-false",
      "text": "Fluid and electrolyte management",
      "timer": "120s",
      "options": [
        "Normal saline contains Na+ 77 mEq/L.",
        "Daily maintenance fluid for 12 kg is 1100 mL.",
        "Daily maintenance potassium is about 2-3 mEq/kg/day.",
        "SIADH is a known cause of hypernatraemia.",
        "Metabolic acidosis is a known complication of diarrhoea."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        false,
        true,
        true,
        false,
        true
      ],
      "branchExplanations": [
        "0.9% saline contains about 154 mEq/L of sodium and 154 mEq/L of chloride.",
        "Using Holliday-Segar: first 10 kg = 1000 mL; next 2 kg = 100 mL; total = 1100 mL/day.",
        "Typical maintenance potassium requirement is around 2-3 mEq/kg/day when renal function and urine output are adequate.",
        "SIADH causes water retention and typically dilutional hyponatraemia.",
        "Bicarbonate loss in stool can produce a normal-anion-gap metabolic acidosis."
      ],
      "explanation": "BOARD MEMORY: Maintenance fluid: 100/50/20 mL/kg/day. Normal saline Na = 154 mEq/L."
    },
    {
      "id": "paeds-tf-32",
      "type": "true-false",
      "text": "1350-g infant born at 38 weeks gestation",
      "timer": "120s",
      "options": [
        "Meconium staining may occur.",
        "Floppiness and poor responsiveness may occur.",
        "Smooth shiny skin is expected.",
        "Random plasma glucose <20 mg/dL after 2 hours may occur.",
        "Ground-glass appearance from respiratory distress syndrome is expected."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        true,
        true,
        false,
        true,
        false
      ],
      "branchExplanations": [
        "A term growth-restricted infant can have fetal stress and meconium passage.",
        "Severe growth restriction can be associated with perinatal compromise, hypoglycaemia and poor tone.",
        "Smooth shiny/translucent skin is a feature of prematurity; this infant is term but very low birth weight/SGA.",
        "SGA infants have limited glycogen/fat stores and are at high risk of neonatal hypoglycaemia.",
        "Classic surfactant-deficiency RDS is primarily a disease of prematurity; a 38-week infant is much less likely to have it."
      ]
    },
    {
      "id": "paeds-tf-33",
      "type": "true-false",
      "text": "COVID-19 in children (historical exam statements)",
      "timer": "120s",
      "options": [
        "Asymptomatic patients pose no risk of infecting others.",
        "Children have no risk of mortality from COVID-19.",
        "All medical students are universally required to receive a booster.",
        "80% of Nigerians have received two vaccine doses.",
        "Vaccines in use are live attenuated."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        false,
        false,
        false,
        false,
        false
      ],
      "branchExplanations": [
        "Asymptomatic infection can still transmit SARS-CoV-2.",
        "Mortality is much lower than in older adults but is not zero.",
        "Booster requirements depend on current national/institutional policy and individual risk; this is not a universal biological rule.",
        "This is a time-dependent epidemiological claim and was not generally true in the period represented by the paper.",
        "Widely used COVID-19 vaccines include mRNA, viral-vector, protein-subunit and inactivated platforms; routine vaccines are not live-attenuated SARS-CoV-2 vaccines."
      ]
    },
    {
      "id": "paeds-tf-34",
      "type": "true-false",
      "text": "Acute exacerbation of bronchial asthma",
      "timer": "120s",
      "options": [
        "Recurrent difficulty breathing, cough and fast breathing are pointers.",
        "Too breathless to talk or feed is a feature of a life-threatening attack.",
        "Oral prednisolone is indicated in severe acute asthma.",
        "IV aminophylline is indicated routinely in moderate exacerbation.",
        "Spirometry is mandatory at every emergency-room visit."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        true,
        true,
        true,
        false,
        false
      ],
      "branchExplanations": [
        "Recurrent episodic respiratory symptoms support asthma, especially with wheeze/trigger pattern.",
        "Inability to speak/feed due to breathlessness indicates severe/life-threatening respiratory compromise.",
        "Systemic corticosteroids should be given early in moderate-severe exacerbations when oral administration is possible.",
        "Aminophylline is not routine for moderate attacks; inhaled beta2-agonists, oxygen as needed, ipratropium and systemic steroids are preferred.",
        "Spirometry is useful when feasible, but acute severity is often assessed clinically and with oxygen saturation/PEF depending on age and cooperation."
      ]
    },
    {
      "id": "paeds-tf-35",
      "type": "true-false",
      "text": "Cerebral palsy - correctly matched",
      "timer": "120s",
      "options": [
        "Ataxic CP - athetosis.",
        "Spastic diplegia - scissoring.",
        "Hemiplegic CP - perinatal stroke.",
        "Spastic quadriparesis - GMFCS grade II.",
        "Atonic CP - sustained ankle clonus."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        false,
        true,
        true,
        false,
        false
      ],
      "branchExplanations": [
        "Athetosis is associated with dyskinetic CP; ataxic CP causes balance and coordination problems.",
        "Hip adductor spasticity can produce a scissoring gait.",
        "Perinatal arterial ischemic stroke is an important cause of unilateral/hemiplegic CP.",
        "Spastic quadriparesis is often associated with more severe gross-motor limitation; GMFCS II is relatively mild.",
        "Sustained clonus reflects upper motor neuron spasticity, not hypotonia/atonia."
      ]
    },
    {
      "id": "paeds-tf-36",
      "type": "true-false",
      "text": "Infant feeding",
      "timer": "120s",
      "options": [
        "Reduced enteral feeding is harmful in every preterm infant.",
        "In human milk, fat is higher in hindmilk than foremilk.",
        "Human milk has increased casein protein.",
        "Cow's milk has more calcium than human milk."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        false,
        true,
        false,
        true
      ],
      "branchExplanations": [
        "Preterm feeding must be individualized; minimal/trophic feeds can be beneficial, but feeds may need reduction/withholding when clinically unstable.",
        "Fat concentration rises during a feed, making hindmilk more energy dense.",
        "Human milk is whey-predominant compared with cow's milk, which has relatively more casein.",
        "Cow's milk contains a higher concentration of calcium and several other minerals."
      ]
    },
    {
      "id": "paeds-tf-37",
      "type": "true-false",
      "text": "Complications of neonatal polycythaemia",
      "timer": "120s",
      "options": [
        "Hyperbilirubinaemia.",
        "Renal failure.",
        "Necrotizing enterocolitis.",
        "Hypoglycaemia.",
        "Respiratory distress syndrome."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        true,
        true,
        true,
        true,
        false
      ],
      "branchExplanations": [
        "Increased red-cell mass increases bilirubin load.",
        "Hyperviscosity can impair renal perfusion and contribute to renal dysfunction.",
        "Hyperviscosity and impaired mesenteric perfusion are associated with NEC.",
        "Hypoglycaemia is a recognized metabolic complication.",
        "Respiratory distress can occur, but classic surfactant-deficiency RDS is not a direct complication of polycythaemia."
      ]
    },
    {
      "id": "paeds-tf-38",
      "type": "true-false",
      "text": "Features of meningitis - EXCEPT",
      "timer": "120s",
      "options": [
        "Headache.",
        "Irritability.",
        "Diarrhoea.",
        "Convulsion.",
        "Posturing."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        true,
        true,
        false,
        true,
        true
      ],
      "branchExplanations": [
        "Source answer: TRUE feature. Common in older children.",
        "Source answer: TRUE feature. Common, especially in infants and young children.",
        "Source answer: FALSE / EXCEPT. Diarrhoea is not a characteristic defining feature of meningitis.",
        "Source answer: TRUE feature. Seizures may occur.",
        "Source answer: TRUE feature. Abnormal posturing can occur in severe CNS disease/raised intracranial pressure."
      ]
    },
    {
      "id": "paeds-tf-39",
      "type": "true-false",
      "text": "3-year-old falls into bank and starts convulsing - immediate first aid",
      "timer": "120s",
      "options": [
        "Hold the child and restrain to stop convulsion.",
        "Look for a table and place him on it.",
        "Turn the child onto the side.",
        "Do mouth-to-mouth resuscitation during active convulsion.",
        "Ask someone to fan the child."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        false,
        false,
        true,
        false,
        false
      ],
      "branchExplanations": [
        "Do not restrain forcefully; protect the child from injury.",
        "Do not move unnecessarily to an elevated surface where a fall can occur.",
        "The recovery/side position helps maintain the airway and allows secretions to drain.",
        "Do not attempt mouth-to-mouth during active tonic-clonic movements unless the child is apnoeic after the seizure and requires resuscitation.",
        "Fanning does not treat the seizure; focus on safety, airway and timing the seizure."
      ]
    },
    {
      "id": "paeds-tf-40",
      "type": "true-false",
      "text": "Febrile seizure",
      "timer": "120s",
      "options": [
        "It can be simple, complex or both.",
        "Generalized seizure is a feature of simple febrile seizure.",
        "70% of cases are complex.",
        "It is the commonest seizure disorder in young children.",
        "It occurs without intracranial infection."
      ],
      "correctOptionIndex": 0,
      "correctTruthValues": [
        false,
        true,
        false,
        true,
        true
      ],
      "branchExplanations": [
        "Classification is simple or complex.",
        "Simple febrile seizures are generalized.",
        "Most are simple.",
        "Febrile seizures are very common in children roughly 6 months to 5 years.",
        "CNS infection must be excluded; its presence means the seizure is not a febrile seizure."
      ]
    }
  ]
};
