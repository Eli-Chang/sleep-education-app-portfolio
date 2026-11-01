import { aiActivity, curriculumContent as c, curriculumMulti as m, curriculumSingle as q, curriculumSummary as recap } from '@/src/content/helpers';
import { ciasScreensByModule } from '@/src/content/en/cias-source';
import type { EducationModule } from '@/src/types/content';
const currentScreens = [
  c('m5-01','What Is Sleep Hygiene?',[
    'Sleep hygiene refers to habits and environmental conditions that support healthy sleep.',
    'Sleep hygiene can make sleep easier for some people, but it is not a cure for OSA. It also may not be enough for someone with ongoing insomnia, pain, reflux, anxiety, or another medical problem.',
    'The goal is to find realistic habits that support sleep, not to create a perfect routine.',
  ]),
  c('m5-02','Sleep Can Change During Pregnancy',[
    'Many people experience changes in sleep during pregnancy. Physical discomfort, nighttime urination, reflux, nasal congestion, fetal movement, anxiety, or changes in breathing can all contribute.',
    'Some disruption may be common, but ongoing sleep difficulty that causes distress or daytime impairment deserves attention.',
    'Sleep-hygiene strategies should support care, not replace evaluation of a sleep or health problem.',
  ]),
  c('m5-03','Use Wake Time as an Anchor',[
    'A reasonably consistent wake time can help the body maintain a more predictable sleep-wake rhythm.',
    'Bedtime does not need to be exact every night. Going to bed when you are sleepy may be more useful than spending a long time awake in bed.',
    'Pregnancy symptoms and daily responsibilities may require flexibility.',
  ]),
  c('m5-04','Create a Wind-Down Routine',[
    'A wind-down routine gives the brain and body repeated signals that the day is ending.',
    'A routine might include dimming lights, preparing PAP equipment, washing up, changing clothes, reading something calming, stretching gently, or listening to quiet audio.',
    'Choose a routine that is realistic. A short routine used consistently may be more useful than an elaborate routine that is difficult to maintain.',
  ]),
  aiActivity('m5-ai1','Build a bedtime timeline','timeline','m5-bedtime-timeline','What usually happens during the hour before you try to sleep?'),
  c('m5-05','Light Helps Set the Body Clock',[
    'Bright light during the day helps the brain understand when it is daytime. Dimmer light before bed can help signal that nighttime is approaching.',
    'Screens can be mentally stimulating and may expose the eyes to bright light. The goal does not have to be a complete ban. Consider whether screen use is delaying sleep, increasing stress, or keeping the room bright.',
  ]),
  q('m5-q1','Knowledge check','Which change is most likely to support a consistent sleep-wake pattern?',[
    'Changing wake time by several hours every day.','Using a reasonably consistent wake time while allowing flexibility when needed.',
    'Staying in bed for as long as possible whenever sleep is difficult.','Using bright screens until the exact moment of sleep.',
  ],'c2',{correctSummary:'Correct.',incorrectSummary:'Not quite.',generalExplanation:'A reasonably consistent wake time can support the sleep-wake rhythm while still allowing needed flexibility.'}),
  c('m5-06','Make the Bedroom Support Sleep',[
    'A sleep-friendly environment is dark, quiet, and comfortable enough for you.',
    'The ideal setup differs from person to person. Some people benefit from curtains, an eye mask, earplugs, steady background sound, cooler bedding, supportive pillows, or reducing unnecessary light.',
    'PAP equipment should remain accessible and arranged so the tubing and mask can be used safely and comfortably.',
  ]),
  m('m5-q2','Knowledge check','Which changes could support a sleep-friendly environment? Select all that apply.',[
    'Reduce unwanted light.','Address disruptive noise.','Arrange PAP tubing so it is less likely to pull.','Keep the room at a personally comfortable temperature.',
    'Use the bed as the main place for stressful work.','Keep frequently needed nighttime items within safe reach.',
  ],['c1','c2','c3','c4','c6'],{correctSummary:'Correct.',incorrectSummary:'Not quite.',generalExplanation:'Light, noise, comfort, safe PAP setup, and access to needed items can support sleep. Stressful work in bed can work against a wind-down routine.'}),
  c('m5-07','Caffeine Can Affect Sleep',[
    'Caffeine is found in coffee, tea, energy drinks, some sodas, chocolate, and some medications.',
    'Caffeine can remain active for several hours and may make it harder to fall asleep or sleep continuously. People differ in how strongly they respond.',
    'Pregnancy-specific caffeine limits should follow current guidance from the prenatal healthcare team. The app should not calculate a personalized safe amount.',
  ]),
  q('m5-q3','Knowledge check','Which statement about caffeine is most accurate?',[
    'Caffeine affects everyone for exactly the same amount of time.','Caffeine can affect sleep for several hours, and sensitivity differs between people.',
    'Energy drinks do not contain caffeine.','The app can determine a personalized safe pregnancy dose.',
  ],'c2',{correctSummary:'Correct.',incorrectSummary:'Not quite.',generalExplanation:'Caffeine can affect sleep for several hours, and sensitivity differs. Pregnancy-specific guidance belongs with the prenatal team.'}),
  c('m5-08','Meals, Comfort, and Reflux',[
    'Large meals or reflux symptoms close to bedtime can make it harder to become comfortable or remain asleep.',
    'If reflux is a concern, notice when symptoms occur and discuss persistent or severe symptoms with the prenatal healthcare team.',
    'The app can help you notice patterns, but it should not prescribe medication or a restrictive diet.',
  ]),
  c('m5-09','Daytime Activity May Support Sleep',[
    'Regular physical activity can support health and sleep for many people. Pregnancy recommendations depend on health status, previous activity, symptoms, and guidance from the prenatal care team.',
    'The app should encourage appropriate discussion rather than prescribe a new exercise program.',
    'Someone experiencing warning symptoms or a medical restriction should follow their clinician’s guidance.',
  ]),
  c('m5-10','Use Naps Intentionally',[
    'Naps can be helpful when someone is tired, especially during pregnancy. For some people, a long or late nap may make it harder to fall asleep at night.',
    'Notice how the timing and length of a nap affect nighttime sleep instead of treating every nap as good or bad.',
    'A nap does not replace evaluation of severe or persistent daytime sleepiness.',
  ]),
  c('m5-11','When Sleep Does Not Come',[
    'Trying harder to force sleep can increase frustration.',
    'If you are awake and becoming frustrated, a quiet activity in dim light may be more helpful than remaining in bed while feeling increasingly alert. Return to bed when you feel sleepier.',
    'Persistent insomnia may benefit from professional evaluation. Cognitive behavioral therapy for insomnia addresses more than basic sleep-hygiene advice.',
  ]),
  q('m5-q4','Knowledge check','Which response is most consistent with the lesson when you are awake and increasingly frustrated in bed?',[
    'Keep forcing yourself to sleep for as long as possible.','Use a quiet activity in dim light and return to bed when sleepier.','Change PAP pressure without guidance.','Assume the problem must be OSA.',
  ],'c2',{correctSummary:'Correct.',incorrectSummary:'Not quite.',generalExplanation:'A quiet activity in dim light and returning when sleepier is consistent with this lesson. Persistent problems deserve appropriate evaluation.'}),
  aiActivity('m5-ai2','Make one sleep-habit plan','action-plan','m5-sleep-action-plan','Choose one sleep habit you would like to work on.'),
  aiActivity('m5-ai3','Sleep-hygiene teach-back','teach-back','m5-sleep-hygiene-teach-back','Why is sleep hygiene helpful but not a treatment for every sleep problem?'),
  recap('m5-recap','Module recap','Sleep hygiene means creating habits and conditions that support sleep. Useful areas include timing, wind-down routines, light, the sleep environment, caffeine, meal comfort, activity, and naps. These strategies can support sleep, but they do not cure OSA and may not be enough for persistent insomnia or other health problems.'),
];
const preservedCurrentScreenIds = new Set(['m5-09', 'm5-q3', 'm5-ai1', 'm5-ai2', 'm5-ai3']);
const screens = [...ciasScreensByModule.m5, ...currentScreens.filter((screen) => preservedCurrentScreenIds.has(screen.id))];
// The single sleep-hygiene sequence is taught as two modules. Part 1 covers why sleep matters, the
// bedtime routine, sleep/wake timing, light, and trouble falling asleep. Part 2 begins at the sleep
// environment and covers caffeine, meals, exercise, naps, stress, and sleeping position. Screen IDs,
// text, and order are unchanged; only the module boundary is new.
export const SLEEP_HYGIENE_PART_TWO_FIRST_SCREEN_ID = 'm5-06';
const splitIndex = screens.findIndex((screen) => screen.id === SLEEP_HYGIENE_PART_TWO_FIRST_SCREEN_ID);
if (splitIndex <= 0) throw new Error('Module 5 split point is missing.');

export const module05: EducationModule = {id:'m5',order:5,title:'Healthy Sleep Hygiene, Part 1: Routine and Light',shortTitle:'Sleep Hygiene, Part 1',description:'Build a realistic sleep routine and use timing, light, and wind-down habits to support sleep without replacing OSA or insomnia care.',screens:screens.slice(0, splitIndex),sourceScreenshotIds:[],curriculumVersion:5,translationStatus:'source',clinicalReviewStatus:'not_reviewed'};
export const module05b: EducationModule = {id:'m5b',order:6,title:'Healthy Sleep Hygiene, Part 2: Environment and Daily Habits',shortTitle:'Sleep Hygiene, Part 2',description:'Shape the bedroom and daily habits such as caffeine, meals, activity, naps, and stress to support sleep without replacing OSA or insomnia care.',screens:screens.slice(splitIndex),sourceScreenshotIds:[],curriculumVersion:5,translationStatus:'source',clinicalReviewStatus:'not_reviewed'};
