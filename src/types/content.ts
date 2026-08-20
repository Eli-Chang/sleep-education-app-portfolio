export type SupportedLocale = 'en' | 'es';
export type LessonScreenType = 'content' | 'singleChoice' | 'multiSelect' | 'scenario' | 'reflection' | 'summary' | 'aiActivity';
export type TranslationStatus = 'source' | 'machine_drafted' | 'translated_from_approved_english' | 'temporary_english_fallback';
export type TranslationProvenance = 'approved-english-curriculum' | 'existing-app-spanish-draft';
export type AnswerBehaviorProvenance =
  | 'CURRENT_APP_EXISTING_BEHAVIOR'
  | 'CIAS_ANSWER_KEY_NOT_RECOVERED'
  | 'HELD_SOURCE_LIMITED_NO_CIAS_BEHAVIOR_PROMOTED'
  | 'NOT_APPLICABLE';

export interface Choice {
  id: string;
  label: string;
}

export interface LessonVideo {
  url: string;
  thumbnailUrl: string;
  title: { en: string; es: string };
  altText: { en: string; es: string };
}

export interface QuestionFeedback {
  correctSummary?: string;
  incorrectSummary?: string;
  generalExplanation?: string;
  optionExplanations?: Record<string, string>;
}

export type QuestionKind = 'objective' | 'reflection';

export interface LessonBase {
  id: string;
  type: LessonScreenType;
  title: string;
  sourceScreenshotIds: string[];
  narrationText?: string;
  needsContentReview?: boolean;
  reviewReason?: string;
  clinicalReviewStatus?: 'not_reviewed' | 'needs_revision';
  translationStatus?: TranslationStatus;
  translationProvenance?: TranslationProvenance;
  bilingualReviewStatus?: 'not_reviewed';
  sourceIds?: string[];
  sourceConfidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  sourceUncertainties?: string[];
  sourceFidelityPolicy?: string;
  answerBehaviorProvenance?: AnswerBehaviorProvenance;
}

export interface ContentLesson extends LessonBase {
  type: 'content';
  paragraphs: string[];
  orderedList?: string[];
  keyPoints?: string[];
  sourceVisibleLabels?: string[];
  video?: LessonVideo;
}

export interface SingleChoiceLesson extends LessonBase {
  type: 'singleChoice';
  prompt: string;
  instructions?: string;
  contextParagraphs?: string[];
  choices: Choice[];
  correctChoiceId?: string;
  feedback?: string;
  questionKind?: QuestionKind;
  questionFeedback?: QuestionFeedback;
}

export interface MultiSelectLesson extends LessonBase {
  type: 'multiSelect';
  prompt: string;
  instructions?: string;
  contextParagraphs?: string[];
  choices: Choice[];
  correctChoiceIds?: string[];
  feedback?: string;
  questionKind?: QuestionKind;
  questionFeedback?: QuestionFeedback;
}

export interface ScenarioLesson extends LessonBase {
  type: 'scenario';
  scenario: string;
  prompt: string;
  choices: Choice[];
  outcomes?: Record<string, string>;
  questionKind?: 'reflection';
  feedback?: string;
  questionFeedback?: QuestionFeedback;
}

export interface ReflectionLesson extends LessonBase {
  type: 'reflection';
  prompt: string;
  instructions?: string;
  placeholder?: string;
  optional?: boolean;
  contextParagraphs?: string[];
}

export interface SummaryLesson extends LessonBase {
  type: 'summary';
  keyPoints: string[];
  sourceVisibleLabels?: string[];
}

export type AiActivityKind =
  | 'teach-back'
  | 'reflection'
  | 'lesson-question'
  | 'pap-barrier'
  | 'action-plan'
  | 'question-organizer'
  | 'timeline';

export interface AiActivityLesson extends LessonBase {
  type: 'aiActivity';
  activityKind: AiActivityKind;
  activityId: string;
  prompt: string;
  placeholder?: string;
  optional?: boolean;
  sensitive?: boolean;
}

export type LessonScreen =
  | ContentLesson
  | SingleChoiceLesson
  | MultiSelectLesson
  | ScenarioLesson
  | ReflectionLesson
  | SummaryLesson
  | AiActivityLesson;

export interface EducationModule {
  id: string;
  order: number;
  title: string;
  shortTitle: string;
  description: string;
  screens: LessonScreen[];
  sourceScreenshotIds: string[];
  curriculumVersion: 4;
  translationStatus?: TranslationStatus;
  translationProvenance?: TranslationProvenance;
  bilingualReviewStatus?: 'not_reviewed';
  clinicalReviewStatus: 'not_reviewed' | 'needs_revision';
}

export interface SourceManifestEntry {
  id: string;
  filePath: string;
  assignedModuleId: string;
  relatedLessonScreenIds: string[];
  interactionGroupId?: string;
  auditStatus: 'assigned-to-module';
  reviewStatus: 'reviewed' | 'needs-review';
}
