export type ContentSlide = {
  type: 'content';
  title: string;
  body: string;
};

export type QuizSlide = {
  type: 'quiz';
  prompt: string;
  answer: string;
  choices: string[];
};

export type Slide = ContentSlide | QuizSlide;

export type Module = {
  id: string;
  number: number;
  title: string;
  summary: string;
  slides: Slide[];
};

export const MODULES: Module[] = [
  {
    id: 'osa-basics',
    number: 1,
    title: 'Understanding OSA',
    summary: 'What obstructive sleep apnea is and how to recognize it.',
    slides: [
      {
        type: 'content',
        title: 'What is OSA?',
        body: 'OSA is a sleep disorder where breathing is repeatedly interrupted during sleep because the airway narrows or becomes blocked.\n\nApnea means a pause in breathing. Sleep apnea means those pauses happen while sleeping.',
      },
      {
        type: 'content',
        title: 'How It Happens',
        body: 'In OSA, the throat relaxes enough to narrow the airway, like pinching a straw while trying to breathe through it.\n\nThe brain senses low oxygen and briefly wakes the body enough to breathe again, often without the person remembering.',
      },
      {
        type: 'quiz',
        prompt: 'What makes OSA "obstructive"?',
        answer: 'A narrowed or blocked airway interrupts breathing during sleep.',
        choices: [
          'A narrowed or blocked airway interrupts breathing during sleep.',
          'The lungs stop working during the day.',
          'The body needs less oxygen while asleep.',
        ],
      },
      {
        type: 'content',
        title: 'Symptoms to Watch For',
        body: 'Symptoms can include snoring, waking up gasping or choking, morning headaches, fatigue, daytime sleepiness, trouble focusing, mood changes, and high blood pressure.\n\nIt is possible to have OSA even if you do not snore.',
      },
      {
        type: 'content',
        title: 'Risk Factors & Diagnosis',
        body: 'Risk can increase with weight gain, pregnancy-related swelling, heart problems, difficult-to-control blood pressure, diabetes, stroke history, or family history.\n\nA sleep study at home or in a sleep clinic checks breathing, oxygen level, heart rate, and other sleep signals.',
      },
      {
        type: 'quiz',
        prompt: 'Which symptom belongs on an OSA watch list?',
        answer: 'Waking up gasping or choking.',
        choices: [
          'Waking up gasping or choking.',
          'Always feeling refreshed.',
          'Needing less sleep than usual.',
        ],
      },
    ],
  },
  {
    id: 'why-treat',
    number: 2,
    title: 'Why Treatment Matters',
    summary: 'The impact of untreated OSA on health and quality of life.',
    slides: [
      {
        type: 'content',
        title: 'Daily Impact',
        body: 'Untreated OSA can worsen daytime sleepiness, energy, focus, mood, and overall quality of life.\n\nThose repeated breathing interruptions leave sleep unrefreshing and strain the body over time.',
      },
      {
        type: 'content',
        title: 'Long-Term Health Risks',
        body: 'Long-term risks include heart disease, stroke, type II diabetes, cognitive problems, and sleepiness-related driving accidents.\n\nFollowing clinician guidance and using CPAP treatment consistently protects long-term health.',
      },
      {
        type: 'content',
        title: 'OSA & Pregnancy',
        body: 'During pregnancy, untreated OSA is associated with gestational diabetes, pregnancy-induced hypertension, preeclampsia, preterm birth, and newborn outcomes.\n\nPregnancy-related swelling can also increase the severity of existing OSA.',
      },
      {
        type: 'quiz',
        prompt: 'Why is treatment emphasized?',
        answer: 'Untreated OSA can affect daily function and long-term health.',
        choices: [
          'Untreated OSA can affect daily function and long-term health.',
          'OSA only matters if someone snores loudly.',
          'OSA usually resolves by ignoring symptoms.',
        ],
      },
    ],
  },
  {
    id: 'treatment-options',
    number: 3,
    title: 'Treating OSA',
    summary: 'Treatment approaches including CPAP and lifestyle changes.',
    slides: [
      {
        type: 'content',
        title: 'Core Treatment',
        body: 'Positive airway pressure, including CPAP, is the most effective core treatment approach.\n\nYour clinician will prescribe the right pressure setting based on your sleep study results.',
      },
      {
        type: 'content',
        title: 'Lifestyle Support',
        body: 'Healthy body weight, regular movement, side sleeping, bed positioning, and treating nasal congestion all support better sleep.\n\nAlcohol near bedtime, smoking, vaping, and sedating medications can worsen OSA events.',
      },
      {
        type: 'content',
        title: 'Other Options',
        body: 'Medication, dental devices, or surgery may be options for specific patients under clinician guidance.\n\nAlways discuss changes in treatment with your care team before making adjustments.',
      },
      {
        type: 'quiz',
        prompt: 'Which treatment is central to this program?',
        answer: 'Positive airway pressure such as CPAP.',
        choices: [
          'Positive airway pressure such as CPAP.',
          'Skipping sleep studies.',
          'Using alcohol to relax before bed.',
        ],
      },
    ],
  },
  {
    id: 'cpap-basics',
    number: 4,
    title: 'CPAP Machine Basics',
    summary: 'What a CPAP machine is and how it keeps your airway open.',
    slides: [
      {
        type: 'content',
        title: 'What is CPAP?',
        body: 'CPAP stands for Continuous Positive Airway Pressure.\n\nIt sends prescribed pressurized air through tubing and a mask to gently hold the airway open during sleep.',
      },
      {
        type: 'content',
        title: 'Machine Parts',
        body: 'Basic parts include the machine motor, humidifier chamber, tubing, and a mask fitted to your face.\n\nAuto-CPAP or APAP automatically adjusts pressure throughout the night as your sleep position changes.',
      },
      {
        type: 'content',
        title: 'The Goal',
        body: 'The goal is to eliminate breathing pauses so your sleep is continuous, safe, and restorative.\n\nWith consistent use, most patients notice improved energy, mood, and focus within weeks.',
      },
      {
        type: 'quiz',
        prompt: 'What does CPAP help do?',
        answer: 'Keep the airway open with pressurized air.',
        choices: [
          'Keep the airway open with pressurized air.',
          'Replace normal breathing.',
          'Diagnose OSA without a sleep study.',
        ],
      },
    ],
  },
  {
    id: 'getting-started',
    number: 5,
    title: 'Getting Started with CPAP',
    summary: 'Practical steps for building comfort from first use to full-night sleep.',
    slides: [
      {
        type: 'content',
        title: 'Start Slowly',
        body: 'Start by getting familiar with putting on the mask and connecting tubing while sitting comfortably awake.\n\nPractice breathing with the air pressure turned on while watching TV or reading in a chair.',
      },
      {
        type: 'content',
        title: 'Build Gradually',
        body: 'Progress to short rest periods and scheduled naps, then build toward full-night sleep.\n\nUse CPAP anytime you sleep—including daytime naps—because untreated sleep periods allow OSA events.',
      },
      {
        type: 'quiz',
        prompt: 'What is a realistic CPAP start?',
        answer: 'Practice gradually while awake, then build toward sleep use.',
        choices: [
          'Practice gradually while awake, then build toward sleep use.',
          'Expect perfect comfort on the first night.',
          'Use it only after symptoms become severe.',
        ],
      },
    ],
  },
  {
    id: 'troubleshooting',
    number: 6,
    title: 'Troubleshooting & Comfort',
    summary: 'Fixing common mask fit issues and knowing when to ask for help.',
    slides: [
      {
        type: 'content',
        title: 'Mask Fit & Leaks',
        body: 'If the mask presses too hard or leaks air, adjust the headgear strap tension evenly.\n\nAir leaking toward eyes can cause dryness and soreness; re-seat the mask cushion on your face.',
      },
      {
        type: 'content',
        title: 'Dryness & Other Issues',
        body: 'Dry mouth or nasal passages improve by increasing humidifier chamber moisture settings.\n\nSkin redness, whistling sounds, or water pooling in tubing are reasons to contact your equipment provider for mask fitting help.',
      },
      {
        type: 'quiz',
        prompt: 'What should a patient do with persistent mask leak?',
        answer: 'Adjust fit and contact the care team or equipment supplier.',
        choices: [
          'Adjust fit and contact the care team or equipment supplier.',
          'Stop treatment permanently.',
          'Tighten straps as much as possible every time.',
        ],
      },
    ],
  },
  {
    id: 'daily-care-travel',
    number: 7,
    title: 'Daily Care & Travel',
    summary: 'Cleaning habits and travel tips for your CPAP routine.',
    slides: [
      {
        type: 'content',
        title: 'Daily Cleaning',
        body: 'Clean mask cushions daily with warm water and mild soap. Rinse tubing and humidifier chamber weekly.\n\nUse distilled water in the humidifier chamber to prevent mineral buildup.',
      },
      {
        type: 'content',
        title: 'Traveling with CPAP',
        body: 'When traveling, pack machine, mask, tubing, power cords, and accessories together in a dedicated travel bag.\n\nCPAP is an approved medical device for air travel and can be carried on planes without counting toward carry-on limits.',
      },
      {
        type: 'quiz',
        prompt: 'What makes CPAP travel easier?',
        answer: 'Packing the machine, mask, tubing, power supply, and accessories together.',
        choices: [
          'Packing the machine, mask, tubing, power supply, and accessories together.',
          'Leaving the power supply at home.',
          'Skipping CPAP for all trips.',
        ],
      },
    ],
  },
  {
    id: 'healthy-sleep-lifestyle',
    number: 8,
    title: 'Healthy Sleep & Lifestyle',
    summary: 'Sleep hygiene, relationships, and fitting CPAP into everyday life.',
    slides: [
      {
        type: 'content',
        title: 'Sleep Hygiene',
        body: 'Maintain a consistent sleep and wake schedule, even on weekends.\n\nKeep your bedroom dark, quiet, cool, and free of screen light before bed.',
      },
      {
        type: 'content',
        title: 'Diet & Substances',
        body: 'Avoid alcohol and heavy meals near bedtime as they relax throat muscles and worsen airway collapse.\n\nPregnancy can increase natural fatigue, but severe sleepiness should always be shared with your obstetrician.',
      },
      {
        type: 'quiz',
        prompt: 'Which habit supports OSA care?',
        answer: 'Avoiding alcohol close to bedtime.',
        choices: [
          'Avoiding alcohol close to bedtime.',
          'Ignoring nasal congestion.',
          'Changing medications without clinician input.',
        ],
      },
      {
        type: 'content',
        title: 'CPAP & Relationships',
        body: 'Untreated OSA causes snoring and fatigue that disrupts partner sleep; CPAP restores quiet, restful nights for both of you.\n\nCPAP does not prevent closeness or intimacy—simply put the mask on when ready to sleep.',
      },
      {
        type: 'content',
        title: 'Communication & Support',
        body: 'Explain the device to new partners with simple, confident facts about better energy and health.\n\nCouples report higher intimacy, better mood, and improved relationship satisfaction when OSA is effectively treated.',
      },
      {
        type: 'quiz',
        prompt: 'What helps CPAP fit into relationships?',
        answer: 'Clear communication and practical planning.',
        choices: [
          'Clear communication and practical planning.',
          'Hiding treatment from everyone.',
          'Assuming CPAP ends intimacy.',
        ],
      },
    ],
  },
];
