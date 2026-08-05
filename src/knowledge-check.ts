import type { LessonScreen } from './content.js';

export type KnowledgeCheckResult = { kind: 'correct' | 'try_again' | 'not_a_check'; message: string };

export function evaluateKnowledgeCheck(screen: LessonScreen, selectedChoiceId: string): KnowledgeCheckResult {
  if (screen.type !== 'singleChoice' || !screen.correctChoiceId) return { kind: 'not_a_check', message: 'This screen does not contain a knowledge check.' };
  return screen.correctChoiceId === selectedChoiceId
    ? { kind: 'correct', message: screen.feedback ?? 'Demonstration answer recorded.' }
    : { kind: 'try_again', message: 'Review the demonstration screen and try again.' };
}
