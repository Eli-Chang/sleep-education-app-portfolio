export type Lesson = {
  id: string;
  section: string;
  title: string;
  summary: string;
  bullets: string[];
  check: {
    prompt: string;
    answer: string;
    choices: string[];
  };
};

export const LESSONS: Lesson[] = [
  {
    id: 'osa-definition',
    section: 'OSA Basics',
    title: 'What is obstructive sleep apnea (OSA)?',
    summary:
      'OSA is a sleep disorder where breathing is repeatedly interrupted during sleep because the airway narrows or becomes blocked.',
    bullets: [
      'Apnea means a pause in breathing. Sleep apnea means those pauses happen while sleeping.',
      'In OSA, the throat relaxes enough to narrow the airway, like pinching a straw while trying to breathe through it.',
      'The brain senses low oxygen and briefly wakes the body enough to breathe again, often without the person remembering.',
      'Those repeated interruptions can leave sleep unrefreshing and strain the body over time.',
    ],
    check: {
      prompt: 'What makes OSA obstructive?',
      answer: 'A narrowed or blocked airway interrupts breathing during sleep.',
      choices: [
        'A narrowed or blocked airway interrupts breathing during sleep.',
        'The lungs stop working during the day.',
        'The body needs less oxygen while asleep.',
      ],
    },
  },
  {
    id: 'symptoms-risk',
    section: 'OSA Basics',
    title: 'What are symptoms and risk factors for OSA?',
    summary:
      'Snoring is common, but OSA can show up in several ways and can happen even when someone does not snore.',
    bullets: [
      'Symptoms can include snoring, waking up gasping or choking, morning headaches, fatigue, daytime sleepiness, trouble focusing, mood changes, and high blood pressure.',
      'It is possible to have OSA even if you do not snore.',
      'Risk can increase with weight gain, pregnancy-related swelling, heart problems, difficult-to-control blood pressure, diabetes, stroke history, or family history.',
      'A sleep study at home or in a sleep clinic checks breathing, oxygen level, heart rate, and other sleep signals.',
    ],
    check: {
      prompt: 'Which symptom belongs on an OSA watch list?',
      answer: 'Waking up gasping or choking.',
      choices: ['Waking up gasping or choking.', 'Always feeling refreshed.', 'Needing less sleep than usual.'],
    },
  },
  {
    id: 'why-treat',
    section: 'Why Treatment Matters',
    title: 'What happens if I do not treat my sleep apnea?',
    summary:
      'Treating OSA matters because untreated OSA can affect quality of life, long-term health, and pregnancy-related outcomes.',
    bullets: [
      'Untreated OSA can worsen daytime sleepiness, energy, focus, mood, and overall quality of life.',
      'Long-term risks include heart disease, stroke, type II diabetes, cognitive problems, and sleepiness-related driving accidents.',
      'During pregnancy, untreated OSA is associated with gestational diabetes, pregnancy-induced hypertension, preeclampsia, preterm birth, and newborn outcomes.',
      'Following clinician guidance and using CPAP treatment consistently protects long-term health.',
    ],
    check: {
      prompt: 'Why is treatment emphasized?',
      answer: 'Untreated OSA can affect daily function and long-term health.',
      choices: [
        'Untreated OSA can affect daily function and long-term health.',
        'OSA only matters if someone snores loudly.',
        'OSA usually resolves by ignoring symptoms.',
      ],
    },
  },
  {
    id: 'treatment-options',
    section: 'Treating OSA',
    title: 'How do I treat my OSA?',
    summary:
      'Positive Airway Pressure (PAP/CPAP) is the core medical treatment alongside lifestyle, positional, and nasal congestion habits.',
    bullets: [
      'Positive airway pressure, including CPAP, is the most effective core treatment approach.',
      'Healthy body weight, regular movement, side sleeping, bed positioning, and treating nasal congestion support better sleep.',
      'Alcohol near bedtime, smoking, vaping, and sedating medications can worsen OSA events.',
      'Medication, dental devices, or surgery may be options for specific patients under clinician guidance.',
    ],
    check: {
      prompt: 'Which treatment is central to this app?',
      answer: 'Positive airway pressure such as CPAP.',
      choices: ['Positive airway pressure such as CPAP.', 'Skipping sleep studies.', 'Using alcohol to relax before bed.'],
    },
  },
  {
    id: 'cpap-machine',
    section: 'CPAP Basics',
    title: 'What is a CPAP machine and how does it work?',
    summary:
      'A CPAP machine sends prescribed pressurized air through tubing and a mask to gently hold the airway open during sleep.',
    bullets: [
      'CPAP stands for Continuous Positive Airway Pressure.',
      'Basic parts include the machine motor, humidifier chamber, tubing, and a mask fitted to your face.',
      'Auto-CPAP or APAP automatically adjusts pressure throughout the night as your sleep position changes.',
      'The goal is to eliminate breathing pauses so your sleep is continuous, safe, and restorative.',
    ],
    check: {
      prompt: 'What does CPAP help do?',
      answer: 'Keep the airway open with pressurized air.',
      choices: ['Keep the airway open with pressurized air.', 'Replace normal breathing.', 'Diagnose OSA without a sleep study.'],
    },
  },
  {
    id: 'getting-started',
    section: 'Getting Started',
    title: 'How do I get started using a CPAP machine?',
    summary:
      'Getting comfortable with CPAP takes practice. Build up use gradually while awake before expecting full-night comfort.',
    bullets: [
      'Start by getting familiar with putting on the mask and connecting tubing while sitting comfortably awake.',
      'Practice breathing with the air pressure turned on while watching TV or reading in a chair.',
      'Progress to short rest periods and scheduled naps, then building toward full-night sleep.',
      'Use CPAP anytime you sleep—including daytime naps—because untreated sleep periods allow OSA events.',
    ],
    check: {
      prompt: 'What is a realistic CPAP start?',
      answer: 'Practice gradually while awake, then build toward sleep use.',
      choices: [
        'Practice gradually while awake, then build toward sleep use.',
        'Expect perfect comfort on the first night.',
        'Use it only after symptoms become severe.',
      ],
    },
  },
  {
    id: 'comfort-troubleshooting',
    section: 'Troubleshooting',
    title: 'What if the mask feels uncomfortable or leaks air?',
    summary:
      'Mask fit issues are common and easy to fix. Adjusting strap tension, mask style, or humidity usually resolves discomfort.',
    bullets: [
      'If the mask presses too hard or leaks air into your eyes, adjust the headgear strap tension evenly.',
      'Air leaking toward eyes can cause dryness and soreness; re-seat the mask cushion on your face.',
      'Dry mouth or nasal passages improve by increasing humidifier chamber moisture settings.',
      'Skin redness, whistling sounds, or water pooling in tubing are reasons to contact your equipment provider for mask fitting help.',
    ],
    check: {
      prompt: 'What should a patient do with persistent mask leak?',
      answer: 'Adjust fit and contact the care team or equipment supplier.',
      choices: [
        'Adjust fit and contact the care team or equipment supplier.',
        'Stop treatment permanently.',
        'Tighten straps as much as possible every time.',
      ],
    },
  },
  {
    id: 'cleaning-travel',
    section: 'Daily Use',
    title: 'How do I clean my CPAP and travel with it?',
    summary:
      'Daily cleaning and easy travel habits make CPAP a seamless part of your normal routine.',
    bullets: [
      'Clean mask cushions daily with warm water and mild soap. Rinse tubing and humidifier chamber weekly.',
      'Use distilled water in the humidifier chamber to prevent mineral buildup.',
      'When traveling, pack machine, mask, tubing, power cords, and accessories together in a dedicated travel bag.',
      'CPAP is a approved medical device for air travel and can be carried on planes without counting toward carry-on limits.',
    ],
    check: {
      prompt: 'What makes CPAP travel easier?',
      answer: 'Packing the machine, mask, tubing, power supply, and accessories together.',
      choices: [
        'Packing the machine, mask, tubing, power supply, and accessories together.',
        'Leaving the power supply at home.',
        'Skipping CPAP for all trips.',
      ],
    },
  },
  {
    id: 'healthy-sleep',
    section: 'Healthy Sleep',
    title: 'How can I improve overall sleep quality?',
    summary:
      'CPAP works best when paired with consistent bedtime habits, a restful environment, and good sleep hygiene.',
    bullets: [
      'Maintain a consistent sleep and wake schedule, even on weekends.',
      'Keep your bedroom dark, quiet, cool, and free of screen light before bed.',
      'Pregnancy can increase natural fatigue, but severe sleepiness should always be shared with your obstetrician.',
      'Avoid alcohol and heavy meals near bedtime as they relax throat muscles and worsen airway collapse.',
    ],
    check: {
      prompt: 'Which habit supports OSA care?',
      answer: 'Avoiding alcohol close to bedtime.',
      choices: ['Avoiding alcohol close to bedtime.', 'Ignoring nasal congestion.', 'Changing medications without clinician input.'],
    },
  },
  {
    id: 'intimacy-support',
    section: 'Intimacy and Support',
    title: 'How can CPAP fit into relationships and intimacy?',
    summary:
      'Open communication with your partner helps CPAP enhance sleep, energy, and closeness in everyday home life.',
    bullets: [
      'Untreated OSA causes snoring and fatigue that disrupts partner sleep; CPAP restores quiet, restful nights for both of you.',
      'CPAP does not prevent closeness or intimacy—simply put the mask on when ready to sleep.',
      'Explain the device to new partners with simple, confident facts about better energy and health.',
      'Couples report higher intimacy, better mood, and improved relationship satisfaction when OSA is effectively treated.',
    ],
    check: {
      prompt: 'What helps CPAP fit into relationships?',
      answer: 'Clear communication and practical planning.',
      choices: ['Clear communication and practical planning.', 'Hiding treatment from everyone.', 'Assuming CPAP ends intimacy.'],
    },
  },
];

export const SECTIONS = ['All', ...Array.from(new Set(LESSONS.map((lesson) => lesson.section)))];
