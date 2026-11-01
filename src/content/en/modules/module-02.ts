import { aiActivity, curriculumContent as c, curriculumMulti as m, curriculumSingle as q, curriculumSummary as recap } from '@/src/content/helpers';
import { ciasScreensByModule } from '@/src/content/en/cias-source';
import type { EducationModule } from '@/src/types/content';
const currentScreens = [
  c('m2-01', 'Sleep Apnea Can Affect More Than One Person', [
    'OSA happens in one person’s airway, but it can affect the person sharing their sleep.',
    'A partner may hear loud snoring, notice breathing pauses, wake during gasping or movement, or feel worried about what they are seeing. Both people may feel tired, frustrated, or less patient during the day.',
    'These effects are not anyone’s fault. The goal is to understand the problem and find support that fits the situation.',
  ]),
  c('m2-02', 'What Might a Partner Experience?', [
    'A partner may experience interrupted sleep, worry about breathing pauses, difficulty falling back asleep, tiredness the next day, frustration about snoring or disrupted routines, or concern about whether treatment is working.',
    'Not every partner has the same experience, and not every patient shares a bed.',
  ]),
  m('m2-r1', 'Optional reflection', 'Has sleep apnea affected anyone else’s sleep or sense of wellbeing?', [
    'Yes.', 'No.', 'I am not sure.', 'I do not share a bed.', 'I prefer not to answer.',
  ], undefined, { generalExplanation: 'There is no correct answer. Sleeping arrangements and relationship experiences differ from person to person.' }, true),
  c('m2-03', 'How Might PAP Affect Shared Sleep?', [
    'When PAP effectively treats obstructive breathing, it may reduce snoring, visible breathing interruptions, gasping, or repeated awakenings.',
    'Some partners may sleep more continuously or feel less worried. These benefits are possible, but they are not guaranteed, and adjusting to PAP can take time for both people.',
  ]),
  q('m2-q1', 'Knowledge check', 'Which is the most supportive response to a partner who is struggling with PAP?', [
    '“You failed again because you removed the mask.”', '“You should change the pressure yourself.”',
    '“What made it difficult last night, and is there anything you want help discussing with the PAP team?”',
    '“Stop talking about it and just use the machine.”',
  ], 'c3', { correctSummary: 'Correct.', incorrectSummary: 'Not quite.', generalExplanation: 'Support focuses on understanding the barrier and helping the patient seek appropriate assistance without blame. Blame and unapproved treatment changes are unlikely to help.' }),
  c('m2-04', 'Adjusting to PAP Together', [
    'Common practical concerns include mask appearance, machine sound, light from equipment, tubing position, air leaks, and changes to the bedtime routine.',
    'Start by naming the specific concern. Some concerns involve bedroom setup, while others may require help from the PAP equipment provider or sleep-care team.',
    'Neither partner should be expected to solve a treatment problem alone.',
  ]),
  m('m2-q2', 'Knowledge check', 'Which concerns are reasonable to discuss with the PAP or equipment team? Select all that apply.', [
    'The mask is leaking air.', 'The mask causes discomfort.', 'The tubing repeatedly gets pulled.', 'The machine seems unusually loud.',
    'The patient wants to change pressure without guidance.', 'The partner notices continued loud snoring while PAP is being used.',
  ], ['c1', 'c2', 'c3', 'c4', 'c6'], { correctSummary: 'Correct.', incorrectSummary: 'Not quite.', generalExplanation: 'Mask, tubing, machine, and continued-snoring concerns are reasonable to discuss. Pressure-setting changes should be discussed with the appropriate treatment team rather than made independently.' }),
  aiActivity('m2-ai1', 'Shared-sleep teach-back', 'teach-back', 'm2-partner-teach-back', 'Describe one way OSA could affect a partner and one way PAP might help.'),
  recap('m2-recap', 'Module recap', 'OSA can disturb a partner’s sleep and cause worry, but experiences differ. PAP may improve shared sleep when treatment is effective. Practical concerns should be addressed without blame, and equipment or treatment problems can be discussed with the PAP team.'),
];
const preservedCurrentScreenIds = new Set(['m2-02', 'm2-ai1', 'm2-recap']);
const screens = [...ciasScreensByModule.m2, ...currentScreens.filter((screen) => preservedCurrentScreenIds.has(screen.id))];
export const module02: EducationModule = { id:'m2', order:2, title:'How Does Sleep Apnea Impact My Partner?', shortTitle:'Partner Impact', description:'Understand shared-sleep effects and supportive, blame-free PAP problem solving.', screens, sourceScreenshotIds:[], curriculumVersion:5, translationStatus:'source', clinicalReviewStatus:'not_reviewed' };
