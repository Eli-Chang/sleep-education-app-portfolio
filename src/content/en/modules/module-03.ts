import { aiActivity, curriculumContent as c, curriculumSingle as q, curriculumSummary as recap } from '@/src/content/helpers';
import { ciasScreensByModule } from '@/src/content/en/cias-source';
import type { EducationModule } from '@/src/types/content';
const currentScreens = [
  c('m3-01','Why Treat OSA?',[
    'OSA can affect sleep quality, daytime alertness, mood, concentration, and quality of life. It is also associated with important health concerns.',
    'Treatment is intended to reduce obstructive breathing during sleep. PAP is one established treatment for OSA, but using it regularly can be challenging.',
    'It also helps to identify what makes treatment difficult.',
  ]),
  c('m3-02','Understanding Health Risk',[
    'When research says OSA is associated with an outcome, it means the outcome occurs more often in groups with OSA. It does not mean every person with OSA will experience that outcome.',
    'It also does not mean PAP can guarantee that an outcome will be prevented.',
    'Your own risk and treatment plan depend on your individual health and should be discussed with your healthcare team.',
  ]),
  q('m3-q1','Knowledge check','What does it mean when OSA is “associated with” a health outcome?',[
    'Everyone with OSA will develop the outcome.','The outcome occurs more often in groups with OSA, but it is not guaranteed for an individual.',
    'OSA has no possible connection to the outcome.','PAP is guaranteed to prevent the outcome.',
  ],'c2',{correctSummary:'Correct.',incorrectSummary:'Not quite.',generalExplanation:'An association describes a pattern observed across groups. It does not predict exactly what will happen to one person and does not prove that treatment guarantees prevention.'}),
  c('m3-03','Struggling With PAP Is Common',[
    'PAP can be difficult for many reasons, including mask discomfort, air leaks, nasal congestion, dryness, reflux, anxiety, tubing problems, machine noise, or uncertainty about whether treatment is helping.',
    'A difficulty is not the same as a failure.',
    'Start by describing the specific problem as clearly as you can.',
  ]),
  aiActivity('m3-ai1','Describe a PAP barrier','pap-barrier','m3-pap-barrier','What makes PAP hardest for you right now?',{placeholder:'Describe what happens in your own words.'}),
  c('m3-04','A Useful Plan Starts Small',[
    'A vague goal such as “I will use PAP better” can be difficult to act on.',
    'A more useful plan identifies what you will try, when you will try it, what barrier you expect, who may be able to help, and what information you want to record or ask about.',
    'The plan should be realistic and should not require you to change medical treatment on your own.',
  ]),
  aiActivity('m3-ai2','Build a realistic next step','action-plan','m3-pap-action-plan','What is one PAP or sleep-related change you would like to make?'),
  q('m3-q2','Knowledge check','Which plan is the most specific and useful?',[
    '“I will be perfect with PAP.”','“I will try harder someday.”','“I will use PAP when I go to bed tonight and write down any problem that makes me remove it.”','“I will change my pressure if PAP feels uncomfortable.”',
  ],'c3',{correctSummary:'Correct.',incorrectSummary:'Not quite.',generalExplanation:'A useful plan identifies a specific action and a way to learn from barriers without independently changing treatment.'}),
  recap('m3-recap','Module recap','OSA treatment matters, but risk is not a guarantee and PAP can be difficult. Describing the specific barrier makes it easier to find the right kind of support. A realistic plan focuses on one clear next step rather than perfection.'),
];
const preservedCurrentScreenIds = new Set(['m3-02', 'm3-03', 'm3-ai1', 'm3-ai2', 'm3-q2']);
const screens = [...ciasScreensByModule.m3, ...currentScreens.filter((screen) => preservedCurrentScreenIds.has(screen.id))];
export const module03: EducationModule = { id:'m3',order:3,title:'OSA Outcomes and Motivation',shortTitle:'Outcomes & Motivation',description:'Understand health associations, PAP barriers, and realistic next steps without fear or blame.',screens,sourceScreenshotIds:[],curriculumVersion:5,translationStatus:'source',clinicalReviewStatus:'not_reviewed' };
