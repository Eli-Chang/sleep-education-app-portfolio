import { z } from 'zod';
import { CONVERSATION_HISTORY_MAX_MESSAGES, MAX_MESSAGE_CHARS } from '../../shared/conversation-policy';

const locale = z.enum(['en', 'es']);
const sessionId = z.string().regex(/^session_[A-Za-z0-9_-]{12,80}$/);
const conversationToken = z.string().regex(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/).max(2048);
const safeText = z.string().trim().min(3).max(MAX_MESSAGE_CHARS);
const optionalModelText = (max: number) => z.string().max(max).nullish().transform(value => value ?? undefined);
const conversationMessages = z.array(z.object({ role: z.enum(['user', 'assistant']), content: safeText }).strict())
  .min(1)
  .max(CONVERSATION_HISTORY_MAX_MESSAGES)
  .refine(messages => messages.at(-1)?.role === 'user', 'The latest conversation message must be from the learner.');
const safetyMetadata = {
  source_ids: z.array(z.string().regex(/^[A-Za-z0-9_-]+$/)).max(12),
  evidence_sufficient: z.boolean(),
  needs_clinician: z.boolean(),
  safety_category: z.enum(['education', 'unsupported', 'clinician_escalation', 'urgent']),
};

export const requestSchemas = {
  'lesson-chat': z.object({ activityId: z.string().max(100).optional(), lessonId: z.string().max(100), kind: z.enum(['teach-back','reflection','lesson-question','pap-barrier','action-plan','question-organizer','timeline']), locale, sessionId, conversationToken, messages: conversationMessages }).strict(),
  'teach-back': z.object({ activityId: z.string().max(100), response: safeText, locale, sessionId }).strict(),
  'lesson-question': z.object({ lessonId: z.string().max(100), question: safeText, locale, sessionId }).strict(),
  'pap-barrier': z.object({ activityId: z.string().max(100).optional(), response: safeText, locale, sessionId }).strict(),
  'action-plan': z.object({ activityId: z.string().max(100).optional(), goal: safeText, locale, sessionId }).strict(),
} as const;

export const conversationStartRequestSchema = z.object({
  activityId: z.string().max(100).optional(),
  lessonId: z.string().max(100),
  locale,
  sessionId,
}).strict();

const baseResult = { outsideScope: z.boolean(), ...safetyMetadata };
export const responseSchemas = {
  'lesson-chat': z.object({ message: z.string().max(1000), followUpQuestion: optionalModelText(300), conversationToken, ...safetyMetadata }).strict(),
  'teach-back': z.object({ feedback: z.string().max(1000), followUpQuestion: optionalModelText(300), status: z.enum(['understood', 'partially_understood', 'needs_support']), ...safetyMetadata }).strict(),
  'lesson-question': z.object({ answer: z.string().max(1200), approvedContentIds: z.array(z.string()).max(8), suggestedClinicianQuestions: z.array(z.string()).max(4), ...baseResult }).strict(),
  'pap-barrier': z.object({ identifiedCategories: z.array(z.string()).max(8), clarificationQuestion: optionalModelText(300), approvedContentIds: z.array(z.string()).max(8), educationalResponse: z.string().max(1200), suggestedDiscussionTopics: z.array(z.string()).max(8), urgentLanguageDetected: z.boolean(), ...baseResult }).strict(),
  'action-plan': z.object({ revisedPlan: z.string().max(1000), isSpecific: z.boolean(), isRealistic: z.boolean(), identifiedBarrier: optionalModelText(300), nextStep: optionalModelText(300), supportPersonOrTeam: optionalModelText(300), prohibitedMedicalAdviceDetected: z.boolean(), ...safetyMetadata }).strict(),
} as const;

export type TaskName = keyof typeof requestSchemas;
