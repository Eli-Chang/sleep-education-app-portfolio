export const PERSISTED_LEARNING_KEYS = [
  'curriculumVersion', 'completedScreenIds', 'completedModuleIds', 'currentModuleId', 'lastScreenByModule',
  'answers', 'answerAttempts', 'reflectionDrafts', 'savedReflections', 'language', 'narrationEnabled',
  'narrationRate', 'narrationPitch', 'voiceByLocale', 'reduceMotion',
  'aiConsent', 'aiEnabled', 'velaConversationRevision', 'actionPlans',
] as const;

type PersistedKey = typeof PERSISTED_LEARNING_KEYS[number];
type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const stringArray = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : undefined;
const record = (value: unknown) => isRecord(value) ? { ...value } : undefined;
const finiteNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : undefined;

function safeValue(key: PersistedKey, value: unknown): unknown {
  if (key === 'curriculumVersion' || key === 'narrationRate' || key === 'narrationPitch' || key === 'velaConversationRevision') return finiteNumber(value);
  if (key === 'completedScreenIds' || key === 'completedModuleIds') return stringArray(value);
  if (key === 'currentModuleId') return typeof value === 'string' ? value : undefined;
  if (key === 'language') return value === 'en' || value === 'es' ? value : undefined;
  if (['narrationEnabled', 'reduceMotion', 'aiConsent', 'aiEnabled'].includes(key)) return typeof value === 'boolean' ? value : undefined;
  if (key === 'actionPlans') return Array.isArray(value) ? value.filter((plan) => isRecord(plan) && typeof plan.id === 'string' && typeof plan.text === 'string' && typeof plan.createdAt === 'string') : undefined;
  if (['lastScreenByModule', 'answers', 'answerAttempts', 'reflectionDrafts', 'savedReflections', 'voiceByLocale'].includes(key)) return record(value);
  return undefined;
}

export function sanitizeLearningState(value: unknown): UnknownRecord {
  if (!isRecord(value)) return {};
  const sanitized: UnknownRecord = {};
  for (const key of PERSISTED_LEARNING_KEYS) {
    const selected = safeValue(key, value[key]);
    if (selected !== undefined) sanitized[key] = selected;
  }
  return sanitized;
}

export function serializeLearningState(value: unknown): string {
  return JSON.stringify(sanitizeLearningState(value));
}
