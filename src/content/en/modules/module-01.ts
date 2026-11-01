import { aiActivity, curriculumContent as c, curriculumMulti as m, curriculumSingle as q, curriculumSummary as recap } from '@/src/content/helpers';
import { ciasScreensByModule } from '@/src/content/en/cias-source';
import type { EducationModule } from '@/src/types/content';

const currentScreens = [
  c('m1-01', 'Understanding Sleep Apnea', [
    'Obstructive sleep apnea, or OSA, is a condition that affects breathing during sleep. Knowing what happens can make treatment easier to understand and give you clearer questions for your care team.',
    'You will look at what OSA is, what an obstructive breathing event looks like, which symptoms people may notice, and how positive airway pressure, called PAP, helps support breathing during sleep.',
  ], ['OSA affects breathing during sleep, but its effects can also be noticed during the day.']),
  c('m1-03', 'What Happens During an Obstructive Event?', [
    'During an obstructive event, a narrowed or closed airway briefly interrupts breathing during sleep.',
    'This pattern may repeat many times during the night.',
  ], ['A person can have repeated sleep disruptions without remembering each one.'], 'not_reviewed', ['Muscles around the throat relax.', 'The upper airway becomes partly or completely blocked.', 'Airflow decreases or briefly stops.', 'The brain and body respond so breathing can restart.', 'Sleep may be disrupted, even if you do not remember waking up.']),
  c('m1-04', 'Apnea and Hypopnea', [
    'You may hear two terms when discussing a sleep study:',
    '• Apnea means airflow stops or nearly stops for a period of time.\n• Hypopnea means airflow becomes partly reduced.',
    'The image compares typical breathing with obstructive sleep apnea. With typical breathing, the airway stays open so air can move past the tongue and soft palate. In OSA, those tissues narrow or block the airway, so airflow is reduced or stops even though the person is still trying to breathe.',
    'Both apnea and hypopnea can disturb sleep and may affect oxygen levels. A sleep study measures breathing events and other information to help a clinician understand what is happening during sleep.',
  ]),
  q('m1-q1', 'Knowledge check', 'A person’s throat muscles relax during sleep and airflow becomes limited. Which explanation best matches OSA?', [
    'The upper airway repeatedly narrows or closes, reducing airflow during sleep.',
    'The lungs stop working and cannot restart normal breathing during sleep.',
    'Dreaming causes the brain to stop sending breathing signals for long periods.',
    'The person intentionally holds their breath because the airway feels uncomfortable.',
  ], 'c1', {
    correctSummary: 'Correct.',
    incorrectSummary: 'Not quite.',
    generalExplanation: 'In OSA, the upper airway repeatedly becomes too narrow or closes during sleep, reducing or stopping airflow. It is not a choice, dreaming, or permanent lung failure.',
    optionExplanations: { c1: 'Correct.', c2: 'The main problem is repeated upper-airway obstruction, not permanent lung failure.', c3: 'OSA is not caused by dreaming or forgetting to breathe.', c4: 'Obstructive events are not voluntary.' },
  }),
  c('m1-05', 'What are the symptoms of sleep apnea?', [
    'OSA does not feel the same for everyone.',
    'Possible nighttime signs include loud snoring, pauses in breathing noticed by another person, gasping, choking, frequent awakenings, or restless sleep.',
    'Possible morning or daytime experiences include dry mouth, headache, tiredness, difficulty concentrating, irritability, or feeling unrefreshed after sleep.',
    'Having one of these symptoms does not by itself prove that someone has OSA.',
  ]),
  m('m1-r1', 'Personal reflection', 'Which experiences have you noticed?', [
    'Snoring.', 'Waking up gasping or choking.', 'Someone has noticed pauses in my breathing.', 'Morning headache.',
    'Dry mouth when I wake.', 'Daytime tiredness.', 'Difficulty concentrating.', 'None of these.', 'I am not sure.',
  ], undefined, { generalExplanation: 'These experiences can have several causes. Your answers do not diagnose OSA. They may help you decide what to discuss with your healthcare professional.' }, true),
  c('m1-06', 'How Is OSA Evaluated?', [
    'Symptoms can raise concern for sleep apnea, but they cannot confirm it on their own.',
    'Evaluation may include questions about sleep, health history, information from a partner, and a sleep study performed at home or in a sleep center. The sleep study records breathing and other signals while you sleep.',
    'Your healthcare team can explain what type of evaluation is appropriate for you.',
  ]),
  c('m1-07', 'How Does PAP Help?', [
    'PAP stands for positive airway pressure. A PAP machine sends a gentle flow of pressurized air through a mask.',
    'The pressure helps hold the upper airway open during sleep. PAP does not force the lungs to breathe, and it is not the same as receiving supplemental oxygen.',
    'The amount of pressure and the type of equipment should be managed with the PAP or sleep-care team.',
  ], ['PAP helps keep the airway open.']),
  m('m1-q2', 'Knowledge check', 'Which statements accurately describe using PAP? Select all that apply.', [
    'PAP treats obstructive breathing by delivering supplemental oxygen instead of air.',
    'PAP uses pressurized air to help support an open airway during sleep.',
    'A mask can deliver the pressurized air from a PAP machine.',
    'A person can change PAP pressure safely without discussing it with the care team.',
    'Equipment or comfort questions can be discussed with the PAP or sleep-care team.',
  ], ['c2', 'c3', 'c5'], {
    correctSummary: 'Correct.', incorrectSummary: 'Not quite.',
    generalExplanation: 'PAP delivers pressurized air through a mask to help keep the airway open. It is not automatically the same as oxygen therapy, and treatment settings should not be changed without appropriate guidance.',
  }),
  aiActivity('m1-ai1', 'Explain it in your own words', 'teach-back', 'm1-osa-teach-back', 'In your own words, what happens during obstructive sleep apnea?'),
  recap('m1-recap', 'Module recap', 'OSA causes repeated narrowing or closure of the upper airway during sleep. These events can reduce airflow and disturb sleep. Symptoms may suggest a problem, but a clinical evaluation and sleep testing are used to understand what is happening. PAP helps support an open airway by delivering pressurized air through a mask.'),
];

const preservedCurrentScreenIds = new Set(['m1-04', 'm1-05', 'm1-06', 'm1-07', 'm1-q2', 'm1-r1', 'm1-ai1', 'm1-recap']);
const screens = [...ciasScreensByModule.m1, ...currentScreens.filter((screen) => preservedCurrentScreenIds.has(screen.id))];

export const module01: EducationModule = {
  id: 'm1', order: 1, title: 'Intro to Sleep Apnea', shortTitle: 'Sleep Apnea',
  description: 'Understand obstructive breathing, symptoms, evaluation, and how PAP supports an open airway.',
  screens, sourceScreenshotIds: [], curriculumVersion:5, translationStatus: 'source',
  clinicalReviewStatus: 'not_reviewed',
};
