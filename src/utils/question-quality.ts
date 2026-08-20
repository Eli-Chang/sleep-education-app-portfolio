import type { LessonScreen } from '@/src/types/content';

export interface QuestionQualityIssue { id: string; issue: string }

export function questionQualityIssues(screens: LessonScreen[]): QuestionQualityIssue[] {
  const issues: QuestionQualityIssue[] = [];
  const positions: number[] = [];
  for (const screen of screens) {
    if ((screen.type !== 'singleChoice' && screen.type !== 'multiSelect') || screen.questionKind !== 'objective') continue;
    const labels = screen.choices.map((choice) => choice.label.trim().toLowerCase());
    if (new Set(labels).size !== labels.length) issues.push({ id: screen.id, issue: 'duplicate choices' });
    const lengths = screen.choices.map((choice) => choice.label.length);
    const average = lengths.reduce((sum, length) => sum + length, 0) / Math.max(1, lengths.length);
    if (Math.max(...lengths) > average * 1.8) issues.push({ id: screen.id, issue: 'one option is substantially longer' });
    if (screen.answerBehaviorProvenance !== 'CIAS_ANSWER_KEY_NOT_RECOVERED' && !screen.questionFeedback?.generalExplanation) issues.push({ id: screen.id, issue: 'missing explanation' });
    if (screen.type === 'singleChoice' && screen.correctChoiceId) positions.push(screen.choices.findIndex((choice) => choice.id === screen.correctChoiceId));
    if (screen.type === 'multiSelect') {
      const correctIds = screen.correctChoiceIds;
      if (correctIds && correctIds.length) positions.push(screen.choices.findIndex((choice) => choice.id === correctIds[0]));
    }
  }
  if (positions.length > 1 && new Set(positions).size === 1) issues.push({ id: 'module', issue: 'correct-answer positions repeat' });
  return issues;
}
