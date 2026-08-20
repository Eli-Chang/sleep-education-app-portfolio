import type { AiActivityKind, AiActivityLesson, AnswerBehaviorProvenance, Choice, ContentLesson, LessonVideo, MultiSelectLesson, QuestionFeedback, ReflectionLesson, SingleChoiceLesson, SummaryLesson } from '@/src/types/content';

export const sourceId = (timestamp: string) => `src-${timestamp}`;
export const source = (timestamp: string) => [sourceId(timestamp)];
const curriculumSource = ['curriculum-master-v3'];
const ciasSource = ['cias-screenshot-recovery'];

export const choices = (...labels: string[]): Choice[] =>
  labels.map((label, index) => ({ id: `c${index + 1}`, label }));

export const content = (
  id: string,
  timestamp: string,
  title: string,
  paragraphs: string[],
  keyPoints?: string[],
  reviewReason?: string,
): ContentLesson => ({
  id,
  type: 'content',
  title,
  paragraphs,
  keyPoints,
  sourceScreenshotIds: source(timestamp),
  needsContentReview: Boolean(reviewReason),
  reviewReason,
});

export const single = (
  id: string,
  timestamp: string,
  title: string,
  prompt: string,
  labels: string[],
  correctChoiceId?: string,
  reviewReason?: string,
): SingleChoiceLesson => ({
  id,
  type: 'singleChoice',
  title,
  prompt,
  choices: choices(...labels),
  correctChoiceId,
  questionKind: correctChoiceId ? 'objective' : 'reflection',
  feedback: correctChoiceId
    ? 'Review the explanation above, then continue when you are ready.'
    : 'Your response has been saved. This question is for learning.',
  questionFeedback: {
    correctSummary: 'Correct.',
    incorrectSummary: 'Not quite.',
    generalExplanation: correctChoiceId
      ? 'Review the explanation above, then change your answer or continue when ready.'
      : undefined,
  },
  sourceScreenshotIds: source(timestamp),
  needsContentReview: Boolean(reviewReason),
  reviewReason,
});

export const multi = (
  id: string,
  timestamp: string,
  title: string,
  prompt: string,
  labels: string[],
  correctChoiceIds?: string[],
  reviewReason?: string,
): MultiSelectLesson => ({
  id,
  type: 'multiSelect',
  title,
  prompt,
  choices: choices(...labels),
  correctChoiceIds,
  questionKind: correctChoiceIds ? 'objective' : 'reflection',
  feedback: correctChoiceIds
    ? 'Review the teaching points above. Progress is based on participation, not correctness.'
    : 'Your selections have been saved. The source does not establish a reliable answer key.',
  questionFeedback: {
    correctSummary: 'Correct.',
    incorrectSummary: 'Not quite. One or more choices need another look.',
    generalExplanation: correctChoiceIds
      ? 'Review the teaching points above. You can change a selection and submit again.'
      : undefined,
  },
  sourceScreenshotIds: source(timestamp),
  needsContentReview: Boolean(reviewReason),
  reviewReason,
});

export const summary = (
  id: string,
  timestamp: string,
  title: string,
  keyPoints: string[],
  reviewReason?: string,
): SummaryLesson => ({
  id,
  type: 'summary',
  title,
  keyPoints,
  sourceScreenshotIds: source(timestamp),
  needsContentReview: Boolean(reviewReason),
  reviewReason,
});

export const curriculumContent = (
  id: string,
  title: string,
  paragraphs: string[],
  keyPoints?: string[],
  clinicalReviewStatus: 'not_reviewed' | 'needs_revision' = 'not_reviewed',
  orderedList?: string[],
): ContentLesson => ({
  id, type: 'content', title, paragraphs, keyPoints, orderedList,
  narrationText: [...paragraphs, ...(keyPoints ?? [])].join(' '),
  sourceScreenshotIds: [], sourceIds: curriculumSource, clinicalReviewStatus,
});

export const curriculumSingle = (
  id: string,
  title: string,
  prompt: string,
  labels: string[],
  correctChoiceId: string | undefined,
  questionFeedback: QuestionFeedback,
  reflection = false,
): SingleChoiceLesson => ({
  id, type: 'singleChoice', title, prompt, choices: choices(...labels), correctChoiceId,
  questionKind: reflection ? 'reflection' : 'objective',
  questionFeedback: reflection ? { generalExplanation: questionFeedback.generalExplanation } : questionFeedback,
  feedback: reflection ? questionFeedback.generalExplanation : undefined,
  narrationText: [prompt, ...labels].join(' '), sourceScreenshotIds: [], sourceIds: curriculumSource,
  clinicalReviewStatus: 'not_reviewed',
});

export const curriculumMulti = (
  id: string,
  title: string,
  prompt: string,
  labels: string[],
  correctChoiceIds: string[] | undefined,
  questionFeedback: QuestionFeedback,
  reflection = false,
): MultiSelectLesson => ({
  id, type: 'multiSelect', title, prompt, choices: choices(...labels), correctChoiceIds,
  questionKind: reflection ? 'reflection' : 'objective',
  questionFeedback: reflection ? { generalExplanation: questionFeedback.generalExplanation } : questionFeedback,
  feedback: reflection ? questionFeedback.generalExplanation : undefined,
  narrationText: [prompt, ...labels].join(' '), sourceScreenshotIds: [], sourceIds: curriculumSource,
  clinicalReviewStatus: 'not_reviewed',
});

export const curriculumSummary = (id: string, title: string, text: string): SummaryLesson => ({
  id, type: 'summary', title, keyPoints: [text], narrationText: text,
  sourceScreenshotIds: [], sourceIds: curriculumSource, clinicalReviewStatus: 'not_reviewed',
});

export const curriculumReflection = (
  id: string,
  title: string,
  prompt: string,
  placeholder?: string,
  optional = true,
): ReflectionLesson => ({
  id, type: 'reflection', title, prompt, placeholder, optional,
  narrationText: [title, prompt].join(' '), sourceScreenshotIds: [], sourceIds: curriculumSource,
  clinicalReviewStatus: 'not_reviewed',
});

export const aiActivity = (
  id: string,
  title: string,
  activityKind: AiActivityKind,
  activityId: string,
  prompt: string,
  options: Pick<AiActivityLesson, 'placeholder' | 'optional' | 'sensitive'> = {},
): AiActivityLesson => ({
  id, type: 'aiActivity', title, activityKind, activityId, prompt, ...options,
  narrationText: prompt, sourceScreenshotIds: [], sourceIds: curriculumSource,
  clinicalReviewStatus: 'not_reviewed',
});

const ciasMeta = (timestamp: string, confidence: 'HIGH' | 'MEDIUM' | 'LOW', uncertainties: string[], policy: string | undefined, answerBehaviorProvenance: AnswerBehaviorProvenance | undefined) => ({
  sourceScreenshotIds: source(timestamp),
  sourceIds: ciasSource,
  sourceConfidence: confidence,
  sourceUncertainties: uncertainties,
  sourceFidelityPolicy: policy,
  answerBehaviorProvenance,
  clinicalReviewStatus: 'not_reviewed' as const,
});

export const ciasContent = (
  id: string,
  timestamp: string,
  title: string,
  paragraphs: string[],
  options: {
    confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
    sourceVisibleLabels?: string[];
    uncertainties?: string[];
    policy?: string;
    video?: LessonVideo;
  } = {},
): ContentLesson => ({
  id,
  type: 'content',
  title,
  paragraphs,
  sourceVisibleLabels: options.sourceVisibleLabels,
  video: options.video,
  ...ciasMeta(timestamp, options.confidence ?? 'HIGH', options.uncertainties ?? [], options.policy, 'NOT_APPLICABLE'),
  narrationText: [...paragraphs, ...(options.sourceVisibleLabels ?? [])].join(' '),
});

const ciasQuestionFeedback: QuestionFeedback = {};

export const ciasSingle = (
  id: string,
  timestamp: string,
  title: string,
  prompt: string,
  labels: string[],
  instructions: string | undefined,
  options: {
    confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
    uncertainties?: string[];
    policy?: string;
    contextParagraphs?: string[];
  } = {},
): SingleChoiceLesson => ({
  id,
  type: 'singleChoice',
  title,
  prompt,
  instructions,
  contextParagraphs: options.contextParagraphs,
  choices: choices(...labels),
  questionKind: 'objective',
  questionFeedback: ciasQuestionFeedback,
  ...ciasMeta(timestamp, options.confidence ?? 'HIGH', options.uncertainties ?? [], options.policy, 'CIAS_ANSWER_KEY_NOT_RECOVERED'),
  narrationText: [title, instructions, prompt, ...labels].filter(Boolean).join(' '),
});

export const ciasMulti = (
  id: string,
  timestamp: string,
  title: string,
  prompt: string,
  labels: string[],
  instructions: string | undefined,
  options: {
    confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
    uncertainties?: string[];
    policy?: string;
    contextParagraphs?: string[];
  } = {},
): MultiSelectLesson => ({
  id,
  type: 'multiSelect',
  title,
  prompt,
  instructions,
  contextParagraphs: options.contextParagraphs,
  choices: choices(...labels),
  questionKind: 'objective',
  questionFeedback: ciasQuestionFeedback,
  ...ciasMeta(timestamp, options.confidence ?? 'HIGH', options.uncertainties ?? [], options.policy, 'CIAS_ANSWER_KEY_NOT_RECOVERED'),
  narrationText: [title, instructions, prompt, ...labels].filter(Boolean).join(' '),
});

export const ciasSummary = (
  id: string,
  timestamp: string,
  title: string,
  keyPoints: string[],
  options: {
    confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
    sourceVisibleLabels?: string[];
    uncertainties?: string[];
    policy?: string;
  } = {},
): SummaryLesson => ({
  id,
  type: 'summary',
  title,
  keyPoints,
  sourceVisibleLabels: options.sourceVisibleLabels,
  ...ciasMeta(timestamp, options.confidence ?? 'HIGH', options.uncertainties ?? [], options.policy, 'NOT_APPLICABLE'),
  narrationText: [...keyPoints, ...(options.sourceVisibleLabels ?? [])].join(' '),
});

export const ciasReflectionSummary = (
  id: string,
  timestamp: string,
  title: string,
  contextParagraphs: string[],
  prompt: string,
  instructions: string | undefined,
  options: {
    confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
    uncertainties?: string[];
    policy?: string;
  } = {},
): ReflectionLesson => ({
  id,
  type: 'reflection',
  title,
  contextParagraphs,
  prompt,
  instructions,
  optional: true,
  ...ciasMeta(timestamp, options.confidence ?? 'HIGH', options.uncertainties ?? [], options.policy, 'CIAS_ANSWER_KEY_NOT_RECOVERED'),
  narrationText: [...contextParagraphs, prompt, instructions].filter(Boolean).join(' '),
});
