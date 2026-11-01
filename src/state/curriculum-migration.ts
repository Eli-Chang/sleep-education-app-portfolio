import type { LearningState } from './AppProvider';
import { englishModules } from '../content/en';
import { sourceManifest } from '../content/source-manifest';

/**
 * Curriculum versions:
 * - < 4: legacy curricula with old screen IDs (remapped below).
 * - 4: seven modules, with Healthy Sleep Hygiene as one module (m5).
 * - 5: eight modules. The same screens are split into m5 (Part 1) and m5b (Part 2); every screen ID is unchanged.
 */
export const CURRICULUM_VERSION = 5;
const LEGACY_ID_VERSION = 4;

const oldToNew: Record<string,string> = {
  'm1-s01':'m1-01','m1-s02':'m1-02','m1-s03':'m1-03','m1-s04':'m1-q1','m1-s05':'m1-05','m1-s06':'m1-r1',
  'm2-s01':'m2-01','m2-s02':'m2-r1','m2-s03':'m2-03','m2-s04':'m2-05','m2-s05':'m2-04','m2-s06':'m2-q2','m2-s07':'m2-q1',
  'm3-s01':'m3-01','m3-s02':'m3-q1','m3-s03':'m3-q3','m3-s04':'m3-q4','m3-s05':'m3-recap','m3-s06':'m3-04',
  'm4-s01':'m4-01','m4-s02':'m4-q1','m4-s03':'m4-03','m4-s04':'m4-04','m4-s05':'m4-q4','m4-s06':'m4-05','m4-s07':'m4-06','m4-s08':'m4-q6','m4-s09':'m4-recap',
  'm5-s01':'m5-01','m5-s02':'m5-02','m5-s03':'m5-03','m5-s04':'m5-q5','m5-s05':'m5-q6','m5-s06':'m5-04','m5-s07':'m5-13','m5-s08':'m5-05','m5-s09':'m5-q7','m5-s10':'m5-11','m5-s11':'m5-q1','m5-s12':'m5-14','m5-s13':'m5-q4','m5-s14':'m5-06','m5-s15':'m5-15','m5-s16':'m5-16','m5-s17':'m5-17','m5-s19':'m5-07','m5-s20':'m5-q2','m5-s21':'m5-08','m5-s22':'m5-q3','m5-s23':'m5-18','m5-s24':'m5-q8','m5-s25':'m5-21','m5-s27':'m5-10','m5-s28':'m5-19','m5-s29':'m5-20','m5-s30':'m5-09','m5-s31':'m5-q10','m5-s32':'m5-recap',
  'm6-s01':'m6-01','m6-s02':'m6-02','m6-s03':'m6-03','m6-s04':'m6-04','m6-s05':'m6-q1','m6-s06':'m6-07','m6-s07':'m6-05','m6-s08':'m6-q2','m6-s09':'m6-08','m6-s10':'m6-q3',
  'm7-s01':'m7-01','m7-s02':'m7-02','m7-s03':'m7-03','m7-s04':'m7-04','m7-s05':'m7-05','m7-s06':'m7-06','m7-s07':'m7-q2',
};
const blockedLegacyIds = new Set(['m1-s02', 'm5-s18', 'm5-s26']);
const runtimeScreenIds = new Set(englishModules.flatMap((module) => module.screens.map((screen) => screen.id)));
const sourceBackedScreenIds = new Set(sourceManifest.flatMap((entry) => entry.relatedLessonScreenIds));

type MigratedState = Partial<LearningState> & { curriculumVersion: number };

const migrateLegacyIds = (input: Partial<LearningState> & { curriculumVersion?: number }): MigratedState => {
  if((input.curriculumVersion??2)>=LEGACY_ID_VERSION) return {...input,curriculumVersion:input.curriculumVersion ?? LEGACY_ID_VERSION};
  const mapId=(id:string): string | undefined => {
    if (blockedLegacyIds.has(id)) return undefined;
    const mapped = oldToNew[id] ?? id;
    return runtimeScreenIds.has(mapped) ? mapped : undefined;
  };
  const mapIds=(ids: string[] | undefined) => (ids ?? []).map(mapId).filter((id): id is string => Boolean(id));
  const mapRecord=<T>(record:Record<string,T>|undefined, clearSourceBacked = false)=>Object.fromEntries(Object.entries(record??{}).flatMap(([id,value])=>{
    const mapped=mapId(id);
    if (!mapped || (clearSourceBacked && sourceBackedScreenIds.has(mapped))) return [];
    return [[mapped,value]];
  }));
  const mappedLastScreenByModule=Object.fromEntries(Object.entries(input.lastScreenByModule??{}).flatMap(([moduleId,id])=>{const mapped=mapId(id);return mapped ? [[moduleId,mapped]] : [];}));
  return {
    ...input,
    curriculumVersion:LEGACY_ID_VERSION,
    completedScreenIds:[...new Set(mapIds(input.completedScreenIds))],
    completedModuleIds:[],
    lastScreenByModule:mappedLastScreenByModule,
    answers:mapRecord(input.answers, true),
    answerAttempts:mapRecord(input.answerAttempts, true),
    reflectionDrafts:mapRecord(input.reflectionDrafts, true),
    savedReflections:mapRecord(input.savedReflections, true),
  };
};

const screenIdsOf = (moduleId: string) => englishModules.find((module) => module.id === moduleId)?.screens.map((screen) => screen.id) ?? [];
const SLEEP_HYGIENE_PART_ONE = 'm5';
const SLEEP_HYGIENE_PART_TWO = 'm5b';

/**
 * v5 step: split the old single Healthy Sleep Hygiene module (m5) into m5 and m5b.
 * Screen IDs did not change, so answers, attempts, reflections, and completed screens carry over as-is.
 * Only module-level bookkeeping moves:
 * - A previously completed m5 means every screen was finished, so both parts are complete.
 * - Otherwise a part is complete only when every one of its screens is already completed.
 * - A saved m5 position on a Part 2 screen moves to m5b; m5 then keeps no position unless Part 1 is complete.
 */
const splitSleepHygiene = (state: MigratedState): MigratedState => {
  const partOne = screenIdsOf(SLEEP_HYGIENE_PART_ONE);
  const partTwo = screenIdsOf(SLEEP_HYGIENE_PART_TWO);
  const done = new Set(state.completedScreenIds ?? []);
  const completedModules = (state.completedModuleIds ?? []).filter((id) => id !== SLEEP_HYGIENE_PART_TWO);
  const oldModuleComplete = completedModules.includes(SLEEP_HYGIENE_PART_ONE);
  const partOneComplete = oldModuleComplete || (partOne.length > 0 && partOne.every((id) => done.has(id)));
  const partTwoComplete = oldModuleComplete || (partTwo.length > 0 && partTwo.every((id) => done.has(id)));
  const completedModuleIds = completedModules.filter((id) => id !== SLEEP_HYGIENE_PART_ONE);
  const ordered = englishModules.map((module) => module.id);
  const withParts = [...completedModuleIds, ...(partOneComplete ? [SLEEP_HYGIENE_PART_ONE] : []), ...(partTwoComplete ? [SLEEP_HYGIENE_PART_TWO] : [])];
  const known = withParts.filter((id) => ordered.includes(id)).sort((a, b) => ordered.indexOf(a) - ordered.indexOf(b));
  const unknown = withParts.filter((id) => !ordered.includes(id));

  const lastScreenByModule = { ...(state.lastScreenByModule ?? {}) };
  delete lastScreenByModule[SLEEP_HYGIENE_PART_TWO];
  const savedPosition = lastScreenByModule[SLEEP_HYGIENE_PART_ONE];
  if (savedPosition && partTwo.includes(savedPosition)) {
    lastScreenByModule[SLEEP_HYGIENE_PART_TWO] = savedPosition;
    if (partOneComplete) lastScreenByModule[SLEEP_HYGIENE_PART_ONE] = partOne[partOne.length - 1];
    else delete lastScreenByModule[SLEEP_HYGIENE_PART_ONE];
  }
  const currentModuleId = state.currentModuleId === SLEEP_HYGIENE_PART_ONE && savedPosition && partTwo.includes(savedPosition)
    ? SLEEP_HYGIENE_PART_TWO : state.currentModuleId;
  return { ...state, completedModuleIds: [...known, ...unknown], lastScreenByModule, currentModuleId };
};

export const migrateLearningState = (input: Partial<LearningState> & { curriculumVersion?: number }): MigratedState => {
  const startingVersion = typeof input.curriculumVersion === 'number' ? input.curriculumVersion : 0;
  let state = migrateLegacyIds(input);
  if (startingVersion < CURRICULUM_VERSION) state = splitSleepHygiene(state);
  return { ...state, curriculumVersion: Math.max(startingVersion, CURRICULUM_VERSION) };
};

export const curriculumMigrationMap = oldToNew;
