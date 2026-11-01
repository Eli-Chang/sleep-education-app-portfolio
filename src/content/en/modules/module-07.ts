import { aiActivity, curriculumContent as c, curriculumMulti as m, curriculumSingle as q, curriculumSummary as recap } from '@/src/content/helpers';
import { ciasScreensByModule } from '@/src/content/en/cias-source';
import type { EducationModule } from '@/src/types/content';
const currentScreens = [
  c('m7-01','Intimacy and Sleep Apnea',[
    'Intimacy can include emotional closeness, trust, affection, communication, physical touch, and sexual connection.',
    'Sleep apnea and PAP may affect intimacy in different ways. Some people experience tiredness, worry, embarrassment, disrupted shared sleep, changes in mood, or concerns about appearance and equipment.',
    'You can skip any personal question here.',
  ]),
  c('m7-02','Sleep Can Affect Connection',[
    'Poor or disrupted sleep may affect energy, attention, mood, patience, and interest in closeness.',
    'Snoring, breathing pauses, or sleeping separately may also affect a relationship. These effects vary and can have many causes.',
    'The app should not assume that OSA is the cause of every relationship or sexual-health concern.',
  ]),
  c('m7-03','PAP Can Create an Adjustment',[
    'A mask, tubing, or machine can feel awkward in an intimate setting. Some people worry about appearance, sound, touch, or how a partner will respond.',
    'Other people feel that treating snoring and obstructive breathing improves shared sleep or reduces worry.',
    'Neither experience is universal.',
  ]),
  q('m7-q1','Knowledge check','Which statement is most accurate?',[
    'PAP always improves intimacy.','PAP always harms intimacy.','PAP can create practical or emotional adjustments, and experiences differ.','Relationship concerns are not appropriate to discuss with a clinician.',
  ],'c3',{correctSummary:'Correct.',incorrectSummary:'Not quite.',generalExplanation:'PAP can create practical or emotional adjustments, and experiences differ. Relationship and sexual-health concerns can be valid healthcare discussion topics.'}),
  c('m7-04','PAP and Sleep',[
    'PAP is intended to treat obstructive breathing while the person is sleeping.',
    'Questions about when PAP should be used, including naps or unusual schedules, should follow the treatment plan provided by the sleep or PAP team.',
    'The app should not create individualized usage instructions.',
  ]),
  m('m7-q2','Knowledge check','Which topics could reasonably be discussed with a healthcare professional? Select all that apply.',[
    'PAP discomfort affecting closeness.','Fatigue affecting interest in intimacy.','Concerns about sexual function.','Questions about treatment effects.',
    'A desire to change PAP settings without guidance.','Relationship stress connected to sleep problems.',
  ],['c1','c2','c3','c4','c6'],{correctSummary:'Correct.',incorrectSummary:'Not quite.',generalExplanation:'Comfort, fatigue, sexual function, treatment effects, and relationship stress can be discussed. PAP settings should not be changed without guidance.'}),
  m('m7-r1','Optional reflection','Is there a topic from this module you may want to discuss with a healthcare professional?',[
    'PAP equipment and comfort.','Fatigue or low energy.','Sexual desire or function.','Relationship or shared-sleep concerns.',
    'Body image or embarrassment.','Another concern.','No.','Prefer not to answer.',
  ],undefined,{generalExplanation:'There is no correct answer. This reflection stays on your device and is not sent to AI automatically.'},true),
  aiActivity('m7-ai1','Organize an optional question','question-organizer','m7-intimacy-question','Write a question you may want to ask a healthcare professional.',{optional:true,sensitive:true}),
  recap('m7-recap','Module recap','Intimacy includes many forms of closeness. OSA and PAP may affect energy, shared sleep, emotions, comfort, and sexual health, but experiences differ. These concerns are valid topics for healthcare discussion, and the learner is never required to disclose personal information in the app.'),
];
const preservedCurrentScreenIds = new Set(['m7-r1', 'm7-ai1', 'm7-recap']);
const screens = [...ciasScreensByModule.m7, ...currentScreens.filter((screen) => preservedCurrentScreenIds.has(screen.id))];
export const module07: EducationModule = {id:'m7',order:8,title:'Intimacy',shortTitle:'Intimacy',description:'Explore intimacy broadly and respectfully without promises or required disclosure.',screens,sourceScreenshotIds:[],curriculumVersion:5,translationStatus:'source',clinicalReviewStatus:'not_reviewed'};
