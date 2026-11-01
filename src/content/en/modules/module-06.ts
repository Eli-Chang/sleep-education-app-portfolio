import { aiActivity, curriculumContent as c, curriculumMulti as m, curriculumSingle as q, curriculumSummary as recap } from '@/src/content/helpers';
import { ciasScreensByModule } from '@/src/content/en/cias-source';
import type { EducationModule } from '@/src/types/content';
const currentScreens = [
  c('m6-01','A PAP Barrier Is a Problem to Solve',[
    'Pregnancy symptoms and other health concerns can make PAP harder to tolerate.',
    'Nasal congestion, reflux, anxiety, mask discomfort, dryness, or equipment problems may feel similar at first, but they may require different types of support.',
    'Removing the mask does not mean someone has failed. It provides information about what needs attention.',
  ]),
  c('m6-02','Nasal Congestion and PAP',[
    'Nasal congestion can make breathing through the nose feel more difficult and may affect mask comfort.',
    'Pregnancy-related congestion, allergies, infection, dryness, and other causes can feel similar. The app cannot determine the cause.',
    'The learner can record when congestion happens, whether it is present before PAP, and whether dryness or mask leak is also present.',
  ]),
  m('m6-q1','Knowledge check','Which information would be useful to record about nasal congestion?',[
    'Whether the congestion starts before or after PAP is applied.','Whether dryness or mask leak is also present.',
    'Which pressure setting the patient independently decides to use.','When symptoms occur and what seems to make them better or worse.',
  ],['c1','c2','c4'],{correctSummary:'Correct.',incorrectSummary:'Not quite.',generalExplanation:'Timing, dryness, leak, and patterns can help describe the concern. The learner should not independently select pressure settings.'}),
  c('m6-03','What Kind of Help Might Be Needed?',[
    'Depending on the problem, useful discussion topics may include mask fit, mask type, humidification, equipment function, saline use, allergies, infection, or pregnancy-safe treatment options.',
    'The PAP equipment team may help with equipment concerns. The prenatal or medical team should guide medication and pregnancy-safety decisions.',
    'The app should never tell a patient to change pressure settings or begin medication independently.',
  ]),
  c('m6-04','Reflux and Sleep',[
    'Reflux happens when stomach contents move upward into the esophagus. It can cause burning, an acidic taste, coughing, or discomfort that may be worse after eating or lying down.',
    'Pregnancy can make reflux more common. Persistent, severe, or unclear symptoms should be discussed with a healthcare professional.',
    'The app may help identify patterns but should not diagnose GERD or select medication.',
  ]),
  q('m6-q2','Knowledge check','Which statement about reflux is most appropriate?',[
    'The app can diagnose GERD from one symptom.','Tracking when symptoms occur may help the learner discuss the problem with a healthcare professional.',
    'Every episode of chest discomfort is harmless reflux.','The learner should independently start any medication suggested online.',
  ],'c2',{correctSummary:'Correct.',incorrectSummary:'Not quite.',generalExplanation:'Tracking patterns may support a healthcare discussion. The app cannot diagnose GERD, dismiss chest discomfort, or select medication.'}),
  c('m6-05','Anxiety, Claustrophobia, and PAP',[
    'Some people feel anxious, confined, or overly aware of their breathing when wearing a PAP mask. The sensation can make it difficult to relax or fall asleep.',
    'Anxiety does not mean the discomfort is imaginary. Mask fit, airflow sensations, congestion, and previous experiences may all contribute.',
    'The learner should be helped to describe the experience without the app assuming its cause.',
  ]),
  c('m6-06','Becoming Familiar With the Equipment',[
    'Some treatment teams recommend becoming familiar with PAP equipment while awake before trying to sleep with it.',
    'A clinician-approved plan might involve briefly handling the mask, wearing it without pressure, or using the equipment while awake in a calm setting.',
    'This app does not present a fixed exposure schedule until the clinical team approves the exact steps.',
  ],undefined,'needs_revision'),
  aiActivity('m6-ai1','Describe a PAP barrier','pap-barrier','m6-pap-barrier','Describe what happens when PAP becomes difficult to use.'),
  aiActivity('m6-ai2','Build a discussion summary','question-organizer','m6-discussion-summary','What would you like your PAP or healthcare team to understand about this problem?'),
  q('m6-q3','Knowledge check','Who is the most appropriate person to guide pregnancy-safe medication decisions?',[
    'The AI chatbot.','Another app user.','The appropriate healthcare professional.','The patient should decide without guidance.',
  ],'c3',{correctSummary:'Correct.',incorrectSummary:'Not quite.',generalExplanation:'Pregnancy-safe medication decisions belong with the appropriate healthcare professional.'}),
  recap('m6-recap','Module recap','Congestion, reflux, anxiety, and equipment concerns may all interfere with PAP. Describing when the problem occurs and what it feels like can help identify the right discussion. Equipment questions may belong with the PAP team, while medication and pregnancy-safety decisions belong with an appropriate healthcare professional.'),
];
const preservedCurrentScreenIds = new Set(['m6-06', 'm6-ai1', 'm6-ai2', 'm6-recap']);
const screens = [...ciasScreensByModule.m6, ...currentScreens.filter((screen) => preservedCurrentScreenIds.has(screen.id))];
export const module06: EducationModule = {id:'m6',order:7,title:'Pregnancy Comorbidities and PAP',shortTitle:'PAP Barriers',description:'Describe congestion, reflux, anxiety, and equipment barriers and connect them to appropriate support.',screens,sourceScreenshotIds:[],curriculumVersion:5,translationStatus:'source',clinicalReviewStatus:'needs_revision'};
