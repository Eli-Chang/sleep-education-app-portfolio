import type { LessonScreen } from '@/src/types/content';
import { equalSets } from './progress';

export type QuestionScreen = Extract<LessonScreen, { type: 'singleChoice' | 'multiSelect' | 'scenario' }>;

export const evaluateQuestion = (screen: QuestionScreen, selected: string[]) => {
  if (screen.type === 'singleChoice' && screen.correctChoiceId) return selected[0] === screen.correctChoiceId;
  if (screen.type === 'multiSelect' && screen.correctChoiceIds) return equalSets(selected, screen.correctChoiceIds);
  return undefined;
};

export const questionChoiceState = (screen: QuestionScreen, selected: string[], id: string) => {
  const active = selected.includes(id);
  const correct = screen.type === 'singleChoice' ? screen.correctChoiceId === id
    : screen.type === 'multiSelect' ? Boolean(screen.correctChoiceIds?.includes(id)) : false;
  return {
    active,
    correctSelected: active && correct,
    incorrectSelected: active && !correct,
    missed: !active && correct,
  };
};
