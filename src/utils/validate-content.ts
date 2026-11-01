import type { EducationModule } from '@/src/types/content';
import { sourceManifest } from '@/src/content/source-manifest';

export function validateContent(english: EducationModule[], spanish: EducationModule[]) {
  const errors: string[] = [];
  const expectedModules: [string, string][] = [
    ['m1','Intro to Sleep Apnea'],['m2','How Does Sleep Apnea Impact My Partner?'],['m3','OSA Outcomes and Motivation'],
    ['m4','Sleep Apnea and Health of Your Pregnancy and Baby'],['m5','Healthy Sleep Hygiene, Part 1: Routine and Light'],
    ['m5b','Healthy Sleep Hygiene, Part 2: Environment and Daily Habits'],['m6','Pregnancy Comorbidities and PAP'],['m7','Intimacy'],
  ];
  if (english.length !== expectedModules.length) errors.push(`Expected ${expectedModules.length} English modules; found ${english.length}.`);
  if (spanish.length !== expectedModules.length) errors.push(`Expected ${expectedModules.length} Spanish modules; found ${spanish.length}.`);
  english.forEach((module,index) => {
    if(module.order!==index+1) errors.push(`Invalid module order for ${module.id}.`);
    if(module.id!==expectedModules[index]?.[0]) errors.push(`Unexpected module at position ${index+1}: ${module.id}.`);
    if(module.title!==expectedModules[index]?.[1]) errors.push(`Unexpected English title for ${module.id}.`);
    if(module.curriculumVersion!==5) errors.push(`${module.id} has the wrong curriculum version.`);
    if(!module.screens.length) errors.push(`${module.id} has no screens.`);
  });
  spanish.forEach((module,index) => {
    const counterpart = english[index];
    if(!counterpart||module.id!==counterpart.id||module.order!==counterpart.order) errors.push(`Spanish module ${module.id} does not match the English module order.`);
    if(counterpart&&module.screens.map(screen=>screen.id).join('|')!==counterpart.screens.map(screen=>screen.id).join('|')) errors.push(`Spanish module ${module.id} screens do not match English.`);
    if(!module.title.trim()||module.title===counterpart?.title) errors.push(`Spanish module ${module.id} title is missing or untranslated.`);
  });
  const en=english.flatMap(module=>module.screens);
  const es=spanish.flatMap(module=>module.screens);
  const ids=en.map(screen=>screen.id);
  if(new Set(ids).size!==ids.length) errors.push('English lesson IDs are not unique.');
  if(ids.join('|')!==es.map(screen=>screen.id).join('|')) errors.push('English and Spanish lesson IDs do not match.');
  if(sourceManifest.length!==77) errors.push(`Expected 77 historical source entries; found ${sourceManifest.length}.`);
  en.forEach(screen=>{
    if(!screen.title.trim()) errors.push(`${screen.id} has an empty title.`);
    if(!screen.sourceIds?.length && !screen.sourceScreenshotIds.length) errors.push(`${screen.id} has no curriculum or historical source.`);
    if(screen.type==='singleChoice'||screen.type==='multiSelect'){
      const choices=new Set(screen.choices.map(choice=>choice.id));
      if(choices.size!==screen.choices.length||screen.choices.some(choice=>!choice.label.trim())) errors.push(`${screen.id} has invalid choices.`);
      if(screen.questionKind==='objective'){
        const sourceAnswerKeyUnavailable = screen.answerBehaviorProvenance === 'CIAS_ANSWER_KEY_NOT_RECOVERED';
        if(!sourceAnswerKeyUnavailable && (!screen.questionFeedback?.correctSummary||!screen.questionFeedback?.incorrectSummary||!screen.questionFeedback?.generalExplanation)) errors.push(`${screen.id} lacks objective feedback.`);
        if(!sourceAnswerKeyUnavailable && screen.type==='singleChoice'&&(!screen.correctChoiceId||!choices.has(screen.correctChoiceId))) errors.push(`${screen.id} has an invalid answer.`);
        if(!sourceAnswerKeyUnavailable && screen.type==='multiSelect'&&(!screen.correctChoiceIds?.length||screen.correctChoiceIds.some(id=>!choices.has(id)))) errors.push(`${screen.id} has invalid answers.`);
      } else if(screen.type==='singleChoice'&&screen.correctChoiceId||screen.type==='multiSelect'&&screen.correctChoiceIds) errors.push(`${screen.id} reflection is scored.`);
    }
    if(screen.type==='aiActivity'&&!screen.activityId.trim()) errors.push(`${screen.id} lacks an AI activity ID.`);
    if(screen.type==='reflection'&&!screen.prompt.trim()) errors.push(`${screen.id} lacks a reflection prompt.`);
  });
  es.forEach(screen=>{
    if(!['machine_drafted','translated_from_approved_english'].includes(screen.translationStatus ?? '')||screen.bilingualReviewStatus!=='not_reviewed') errors.push(`${screen.id} Spanish review metadata is incomplete.`);
  });
  return errors;
}
