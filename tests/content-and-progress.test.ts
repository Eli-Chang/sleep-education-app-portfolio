import assert from 'node:assert/strict';
import test from 'node:test';
import { englishModules } from '../src/content/en';
import { spanishModules } from '../src/content/es';
import { sourceManifest } from '../src/content/source-manifest';
import { equalSets, moduleProgress, overallProgress, percent } from '../src/utils/progress';
import { validateContent } from '../src/utils/validate-content';
import { evaluateQuestion, questionChoiceState } from '../src/utils/questions';
import { CURRICULUM_VERSION, curriculumMigrationMap, migrateLearningState } from '../src/state/curriculum-migration';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const screens=englishModules.flatMap(module=>module.screens);
test('curriculum has seven modules and 102 unique screens',()=>{
  assert.equal(englishModules.length,7);assert.equal(screens.length,102);assert.equal(new Set(screens.map(s=>s.id)).size,102);
  assert.deepEqual(validateContent(englishModules,spanishModules),[]);assert.equal(sourceManifest.length,77);
});
test('English and Spanish have exact structural parity with translated CIAS metadata',()=>{
  assert.deepEqual(englishModules.map(m=>m.id),spanishModules.map(m=>m.id));
  assert.deepEqual(screens.map(s=>[s.id,s.type]),spanishModules.flatMap(m=>m.screens.map(s=>[s.id,s.type])));
  spanishModules.flatMap(m=>m.screens).forEach(s=>{assert.ok(['machine_drafted','translated_from_approved_english'].includes(s.translationStatus ?? ''));assert.equal(s.bilingualReviewStatus,'not_reviewed');});
  assert.equal(spanishModules.flatMap(m=>m.screens).filter(s=>s.translationStatus==='temporary_english_fallback').length,0);
  assert.equal(spanishModules.flatMap(m=>m.screens).filter(s=>s.translationStatus==='translated_from_approved_english').length,70);
  assert.equal(spanishModules.flatMap(m=>m.screens).filter(s=>s.translationProvenance==='approved-english-curriculum').length,70);
});
test('every objective question has valid answers and complete feedback',()=>{
  screens.forEach(s=>{
    if((s.type!=='singleChoice'&&s.type!=='multiSelect')||s.questionKind!=='objective') return;
    if(s.answerBehaviorProvenance==='CIAS_ANSWER_KEY_NOT_RECOVERED'){assert.equal(evaluateQuestion(s,['c1']),undefined);if(s.type==='singleChoice') assert.equal(s.correctChoiceId,undefined);else assert.equal(s.correctChoiceIds,undefined);return;}
    const ids=new Set(s.choices.map(c=>c.id));
    if(s.type==='singleChoice') assert.ok(s.correctChoiceId&&ids.has(s.correctChoiceId));
    else assert.ok(s.correctChoiceIds?.length&&s.correctChoiceIds.every(id=>ids.has(id)));
    assert.ok(s.questionFeedback?.correctSummary);assert.ok(s.questionFeedback?.incorrectSummary);assert.ok(s.questionFeedback?.generalExplanation);
  });
});
test('reflections are unscored and include a privacy choice when sensitive',()=>{
  screens.forEach(s=>{if((s.type==='singleChoice'||s.type==='multiSelect')&&s.questionKind==='reflection') assert.equal(evaluateQuestion(s,['c1']),undefined);});
  for(const id of ['m7-r1']){const s=screens.find(x=>x.id===id);assert.ok(s?.type==='multiSelect');assert.ok(s.choices.some(c=>/prefer/i.test(c.label)));}
});
test('bilingual pre-review repairs preserve option identities, reflection semantics, and app-only meaning',()=>{
  const spanishScreens=spanishModules.flatMap(module=>module.screens);
  const englishById=new Map(screens.map(screen=>[screen.id,screen]));
  const spanishById=new Map(spanishScreens.map(screen=>[screen.id,screen]));
  const m1q2=englishById.get('m1-q2');const m1q2Es=spanishById.get('m1-q2');
  assert.ok(m1q2?.type==='multiSelect'&&m1q2Es?.type==='multiSelect');
  assert.deepEqual(m1q2.choices.map(choice=>choice.id),m1q2Es.choices.map(choice=>choice.id));
  assert.deepEqual(m1q2.correctChoiceIds,m1q2Es.correctChoiceIds);
  assert.match(m1q2Es.choices[0].label,/oxígeno suplementario en lugar de aire/i);
  assert.match(m1q2Es.choices[1].label,/aire presurizado.*mantener abierta/i);
  assert.match(m1q2Es.choices[4].label,/comodidad.*equipo de PAP.*medicina del sueño/i);
  const m3ai1=spanishById.get('m3-ai1');assert.ok(m3ai1?.type==='aiActivity');assert.equal(m3ai1.placeholder,'Describa lo que ocurre con sus propias palabras.');
  const m1r1=spanishById.get('m1-r1');assert.ok(m1r1?.type==='multiSelect');assert.equal(m1r1.questionFeedback?.correctSummary,undefined);assert.equal(m1r1.questionFeedback?.incorrectSummary,undefined);assert.match(m1r1.questionFeedback?.generalExplanation??'',/profesional de salud/);
  const m7r1=spanishById.get('m7-r1');assert.ok(m7r1?.type==='multiSelect');assert.equal(m7r1.questionFeedback?.correctSummary,undefined);assert.equal(m7r1.questionFeedback?.incorrectSummary,undefined);
  const m5_09=spanishById.get('m5-09');assert.ok(m5_09?.type==='content');assert.match(m5_09.paragraphs.join(' '),/síntomas de advertencia|restricción médica/i);assert.match(m5_09.paragraphs.join(' '),/profesional de salud/i);
  const m1_07=spanishById.get('m1-07');assert.ok(m1_07?.type==='content');assert.deepEqual(m1_07.keyPoints,['PAP ayuda a mantener abierta la vía respiratoria.']);
  for(const id of ['m1-05','m1-06','m1-07','m2-02','m2-recap','m3-02','m3-03','m4-02','m5-09','m6-06','m7-recap']) assert.ok(spanishById.get(id),'repaired counterpart remains present: '+id);
});
test('multi-select comparison ignores order and exposes accessible result states',()=>{
  assert.equal(equalSets(['c3','c1'],['c1','c3']),true);
  const s=screens.find(x=>x.id==='m1-q2');assert.ok(s?.type==='multiSelect');
  assert.equal(evaluateQuestion(s,['c5','c2','c3']),true);assert.equal(evaluateQuestion(s,['c1','c2']),false);
  assert.deepEqual(questionChoiceState(s,['c1','c2'],'c1'),{active:true,correctSelected:false,incorrectSelected:true,missed:false});
});
test('progress counts participation and new module totals',()=>{
  assert.equal(percent(3,10),30);const first=englishModules[0];assert.equal(first.screens.length,11);
  const completed=first.screens.slice(0,2).map(s=>s.id);assert.equal(moduleProgress(first,completed).completed,2);assert.equal(overallProgress(englishModules,completed).total,102);
});
test('v2 progress migration is idempotent and does not preserve unrecovered CIAS answer behavior',()=>{
  const legacy={curriculumVersion:2,completedScreenIds:['m1-s01','m1-s04'],completedModuleIds:['m1'],lastScreenByModule:{m1:'m1-s05'},answers:{'m1-s04':['c2']},answerAttempts:{'m1-s04':[{answers:['c2'],correct:true,submittedAt:'test'}]}};
  const migrated=migrateLearningState(legacy);assert.equal(migrated.curriculumVersion,CURRICULUM_VERSION);
  assert.deepEqual(migrated.completedScreenIds,['m1-01','m1-q1']);assert.equal(migrated.lastScreenByModule?.m1,'m1-05');assert.equal(migrated.answers?.['m1-q1'],undefined);assert.equal(migrated.answerAttempts?.['m1-q1'],undefined);
  assert.deepEqual(migrateLearningState(migrated),migrated);assert.equal(migrated.completedScreenIds?.includes('m1-02'),false);
});
test('v3 progress migration drops removed IDs and clears state for changed CIAS screens',()=>{
  const current={curriculumVersion:3,completedScreenIds:['m1-04','m4-q2','m2-q1'],completedModuleIds:['m1','m4'],lastScreenByModule:{m1:'m1-04',m4:'m4-q2',m2:'m2-q1'},answers:{'m1-04':['c1'],'m2-q1':['c1']},answerAttempts:{'m1-04':[{answers:['c1'],correct:true,submittedAt:'test'}],'m2-q1':[{answers:['c1'],correct:true,submittedAt:'test'}]},reflectionDrafts:{'m2-r1':'old'},savedReflections:{'m2-r1':{text:'old',savedAt:'test'}}};
  const migrated=migrateLearningState(current);
  assert.equal(migrated.curriculumVersion,CURRICULUM_VERSION);assert.deepEqual(migrated.completedScreenIds,['m1-04','m2-q1']);assert.deepEqual(migrated.completedModuleIds,[]);
  assert.equal(migrated.lastScreenByModule?.m1,'m1-04');assert.equal(migrated.lastScreenByModule?.m4,undefined);assert.equal(migrated.lastScreenByModule?.m2,'m2-q1');
  assert.deepEqual(migrated.answers?.['m1-04'],['c1']);assert.equal(migrated.answers?.['m2-q1'],undefined);assert.equal(migrated.answerAttempts?.['m2-q1'],undefined);assert.equal(migrated.reflectionDrafts?.['m2-r1'],undefined);assert.equal(migrated.savedReflections?.['m2-r1'],undefined);
  assert.deepEqual(migrateLearningState(migrated),migrated);
});
test('every historical screenshot ID migrates to a valid current screen',()=>{
  const audit=readFileSync(resolve(process.cwd(),'docs/SCREENSHOT_AUDIT.md'),'utf8');
  const legacyIds=[...audit.matchAll(/m[1-7]-s\d{2}/g)].map(match=>match[0]);
  assert.equal(new Set(legacyIds).size,77);
  const validIds=new Set(screens.map(screen=>screen.id));
  const mapped=legacyIds.map(id=>[id, curriculumMigrationMap[id as keyof typeof curriculumMigrationMap]] as const);
  const heldIds=new Set(['m1-s02','m5-s18','m5-s26']);
  assert.equal(mapped.filter(([id,value])=>!heldIds.has(id)&&(!value||!validIds.has(value))).length,0);
  const lastScreenByModule: Record<string,string>=Object.fromEntries([...new Set(legacyIds.map(id=>id.slice(0,2)))].map(moduleId=>[moduleId,legacyIds.filter(id=>id.startsWith(`${moduleId}-`)).at(-1)!]));
  const migrated=migrateLearningState({curriculumVersion:2,completedScreenIds:legacyIds,lastScreenByModule,answers:Object.fromEntries(legacyIds.map(id=>[id,['c1']])),answerAttempts:Object.fromEntries(legacyIds.map(id=>[id,[]]))});
  assert.equal(migrated.completedScreenIds?.some(id=>id.includes('-s')),false);
  assert.equal(Object.keys(migrated.answers??{}).some(id=>id.includes('-s')),false);
  assert.equal(Object.keys(migrated.answerAttempts??{}).some(id=>id.includes('-s')),false);
  assert.equal(Object.values(migrated.lastScreenByModule??{}).some(id=>id?.includes('-s')),false);
});
test('all curriculum AI activities have stable unique IDs',()=>{
  const activities=screens.filter(s=>s.type==='aiActivity');assert.equal(activities.length,12);assert.equal(new Set(activities.map(a=>a.activityId)).size,12);
});
test('held source records have no fabricated interaction group',()=>{
  assert.equal(sourceManifest.find((entry)=>entry.id==='src-172001')?.interactionGroupId,undefined);
  assert.equal(sourceManifest.find((entry)=>entry.id==='src-172047')?.interactionGroupId,undefined);
});
