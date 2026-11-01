import { activityCatalog, approvedPapCategories, teachBackRubrics, unsupportedFallback, urgentFixedMessage } from './approved-content';
import { evidenceBankVersion, getEvidence, isValidEvidenceId, type EvidenceEntry } from './evidence-bank';
import { modelConfig } from './model-config';
import { parseProviderEnvelope, type ProviderReply, type ProviderResponseDiagnostic, type PromptCacheDiagnostic, withProviderEnvelopeFailure, withProviderHttpFailure, withWorkerValidation } from './provider-contract';
import { conversationStartRequestSchema, requestSchemas, responseSchemas, type TaskName } from './schemas';
import { selectKnowledge, type KnowledgeSelection } from '../knowledge/source-selection';
import { createConversationState, issueConversationToken, verifyConversationTokenForScreen, type ConversationStateClaims } from './conversation-state';
import { coordinatorCall } from './conversation-coordinator';
export { ConversationStateCoordinator } from './conversation-coordinator';
import { contextProvenance, type ContextProvenance } from './context-provenance';
import { languageFallback, languageMatchesLocale } from './language-validator';
import { classifySafetyIntent, deterministicSafetyMessages, isDirectDiagnosisRequest, isSurgeryPathwayQuestion, isTeachBackUncertaintyMessage, screenGeneratedReply, screenPregnancyReply, type SafetyIntent } from './safety-enforcement';
import { evaluationDiagnosticsAuthorized } from './secure-evaluation';
import { canonicalConversationPolicy, CONVERSATION_HISTORY_MAX_CHARS, CONVERSATION_HISTORY_MAX_MESSAGES, MAX_REQUEST_BYTES, trimConversationHistory, type ConversationMessage } from '../../shared/conversation-policy';

export interface Env {
  GROQ_API_KEY?: string;
  GROQ_MODEL?: string;
  ALLOWED_ORIGINS?: string;
  EVIDENCE_BANK_ENABLED?: string;
  EVIDENCE_BANK_VERSION?: string;
  UPSTREAM_TIMEOUT_MS?: string;
  EVALUATION_DIAGNOSTICS_ENABLED?: string;
  EVALUATION_DIAGNOSTICS_TOKEN?: string;
  CONVERSATION_STATE_SIGNING_SECRET?: string;
  CONVERSATION_STATE?: DurableObjectNamespace;
}

type ErrorCode = 'INVALID_REQUEST' | 'AI_UNAVAILABLE' | 'RATE_LIMITED' | 'UPSTREAM_RATE_LIMITED' | 'OUTSIDE_SCOPE' | 'TIMEOUT' | 'CONFIGURATION_ERROR';
type Locale = 'en' | 'es';
type SafetyCategory = 'education' | 'unsupported' | 'clinician_escalation' | 'urgent';
const taskNames = Object.keys(requestSchemas) as TaskName[];
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const MAX_BODY_BYTES = MAX_REQUEST_BYTES;
const MAX_TOTAL_MESSAGE_CHARS = CONVERSATION_HISTORY_MAX_CHARS;
const MAX_RATE_PER_MINUTE = 20;
const injectionPatterns = [/ignore (all|previous) instructions/i, /ignora (todas|las) instrucciones/i, /system prompt/i, /mensaje (del sistema|de desarrollador)/i, /developer message/i, /reveal.*prompt/i, /show.*source document/i, /muestra.*document/i, /<\|.*\|>/i];
const identifierPatterns = [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, /(?:\+?\d[\d().\s-]{7,}\d)/, /\b\d{6,}\b/];
const urgentPatterns = [/\b(can't breathe|cannot breathe|chest pain|suicid|overdose|unconscious|emergency|no puedo respirar|dolor de pecho|sobredosis|inconsciente|emergencia)\b/i];

const createRequestId = () => crypto.randomUUID();
const audit = (requestId: string, task: TaskName | 'health' | 'request', stage: string, status: number, detail?: string) => console.info(JSON.stringify({ event: 'ai_request', requestId, task, stage, status, detail }));

function originAllowed(request: Request, env: Env): boolean {
  const origin = request.headers.get('Origin');
  if (!origin) return true;
  return (env.ALLOWED_ORIGINS ?? '').split(',').map(value => value.trim()).filter(Boolean).includes(origin);
}

function corsHeaders(request: Request, env: Env, requestId: string): Headers {
  const origin = request.headers.get('Origin');
  const allowed = origin && originAllowed(request, env) ? origin : undefined;
  const headers = new Headers({
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Access-Control-Expose-Headers': 'X-Request-ID',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Request-ID': requestId,
  });
  if (origin) headers.set('Access-Control-Allow-Origin', allowed ?? 'null');
  return headers;
}

type ProviderRateLimitMetadata = { providerHttpStatus: number; headers: Record<string, string> };

function captureProviderRateLimitMetadata(response: Response): ProviderRateLimitMetadata {
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    const normalized = key.toLowerCase();
    if (normalized === 'retry-after' || normalized.startsWith('x-ratelimit-') || normalized.startsWith('ratelimit-')) headers[normalized] = value;
  });
  return { providerHttpStatus: response.status, headers };
}

const json = (request: Request, env: Env, requestId: string, body: unknown, status = 200, extraHeaders: Record<string, string> = {}) => {
  const headers = corsHeaders(request, env, requestId);
  for (const [name, value] of Object.entries(extraHeaders)) headers.set(name, value);
  return new Response(JSON.stringify(body), { status, headers });
};
const fail = (request: Request, env: Env, requestId: string, code: ErrorCode, message: string, retryable: boolean, status: number, extraHeaders: Record<string, string> = {}) => json(request, env, requestId, { error: { code, message, retryable } }, status, extraHeaders);
type EvaluationDiagnostic = ProviderResponseDiagnostic & {
  context_provenance?: ContextProvenance;
  provider_rate_limits?: ProviderRateLimitMetadata;
  rejection_category?: string;
  language_detected?: string;
  generated_reply_blocked?: boolean;
  safety_policy_triggered?: string;
  fallback_used?: string;
  provider_attempted?: boolean;
  safety_category?: SafetyIntent;
  deterministic_fallback?: boolean;
  active_locale?: Locale;
  requested_locale?: Locale;
  locale_source?: 'SIGNED_CONVERSATION_STATE' | 'REQUEST_LOCALE';
  deterministic_policy_audit?: string;
  repair_attempted?: boolean;
  provider_attempt_count?: number;
};
const failWithProviderDiagnostic = (request: Request, env: Env, requestId: string, code: ErrorCode, message: string, retryable: boolean, status: number, diagnosticsEnabled: boolean, diagnostic?: EvaluationDiagnostic) => json(request, env, requestId, {
  error: { code, message, retryable },
  ...(diagnosticsEnabled && diagnostic ? { evaluation_diagnostic: diagnostic } : {}),
}, status);

function workerOnlyDiagnostic(code: string, path: string, message: string): EvaluationDiagnostic {
  return {
    provider_request_id: null,
    provider_http_status: 0,
    provider_model: 'not_attempted',
    provider_finish_reason: null,
    provider_content_present: false,
    provider_content_length: 0,
    provider_content_type: 'missing',
    provider_json_parse_status: 'not_attempted',
    worker_validation_status: 'rejected',
    worker_validation_error_code: code,
    worker_validation_error_path: path,
    worker_validation_error_message: message,
    sanitized_provider_content: null,
    provider_usage: null,
    prompt_cache: null,
    rejection_category: code,
  };
}

function providerTransportDiagnostic(metadata: ProviderRateLimitMetadata, model: string): ProviderResponseDiagnostic {
  return {
    provider_request_id: null,
    provider_http_status: metadata.providerHttpStatus,
    provider_model: model,
    provider_finish_reason: null,
    provider_content_present: false,
    provider_content_length: 0,
    provider_content_type: 'missing',
    provider_json_parse_status: 'not_attempted',
    worker_validation_status: 'not_attempted',
    worker_validation_error_code: null,
    worker_validation_error_path: null,
    worker_validation_error_message: null,
    sanitized_provider_content: null,
    provider_usage: null,
    prompt_cache: null,
  };
}

async function promptCacheDiagnostic(system: string): Promise<PromptCacheDiagnostic> {
  const bytes = new TextEncoder().encode(system);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const stablePrefixHash = Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, '0')).join('');
  return {
    stable_prefix_hash: stablePrefixHash,
    stable_prefix_byte_length: bytes.byteLength,
    stable_prefix_message_count: 1,
    variable_context_message_index: 1,
  };
}

function rateLimited(request: Request): boolean {
  const key = request.headers.get('CF-Connecting-IP') ?? 'anonymous';
  const now = Date.now();
  const current = rateBuckets.get(key);
  if (!current || current.resetAt <= now) { rateBuckets.set(key, { count: 1, resetAt: now + 60_000 }); return false; }
  current.count += 1;
  return current.count > MAX_RATE_PER_MINUTE;
}

function evidenceEnabled(env: Env): boolean {
  return env.EVIDENCE_BANK_ENABLED === 'true' && env.EVIDENCE_BANK_VERSION === evidenceBankVersion;
}

const lessonContextById: Record<string, string> = {
  'm1-01': 'm1-01', 'm1-02': 'm1-01', 'm1-03': 'm1-01', 'm1-04': 'm1-01', 'm1-05': 'm1-01', 'm1-06': 'm1-01', 'm1-07': 'm1-01', 'm1-q1': 'm1-01', 'm1-q2': 'm1-01', 'm1-r1': 'm1-01', 'm1-ai1': 'm1-01', 'm1-recap': 'm1-01',
  'm2-01': 'm2-01', 'm2-02': 'm2-01', 'm2-03': 'm2-01', 'm2-04': 'm2-01', 'm2-q1': 'm2-01', 'm2-q2': 'm2-01', 'm2-r1': 'm2-01', 'm2-ai1': 'm2-01', 'm2-recap': 'm2-01',
  'm3-01': 'm3-01', 'm3-02': 'm3-01', 'm3-03': 'm3-01', 'm3-04': 'm3-01', 'm3-q1': 'm3-01', 'm3-q2': 'm3-01', 'm3-ai1': 'm3-01', 'm3-ai2': 'm3-01', 'm3-recap': 'm3-01',
  'm4-01': 'm4-01', 'm4-02': 'm4-01', 'm4-03': 'm4-01', 'm4-04': 'm4-01', 'm4-05': 'm4-01', 'm4-06': 'm4-01', 'm4-q1': 'm4-01', 'm4-q2': 'm4-01', 'm4-q3': 'm4-01', 'm4-ai1': 'm4-01', 'm4-ai2': 'm4-01', 'm4-recap': 'm4-01',
  'm5-01': 'm5-01', 'm5-02': 'm5-01', 'm5-03': 'm5-01', 'm5-04': 'm5-01', 'm5-05': 'm5-01', 'm5-06': 'm5-01', 'm5-07': 'm5-01', 'm5-08': 'm5-01', 'm5-09': 'm5-01', 'm5-10': 'm5-01', 'm5-11': 'm5-01', 'm5-q1': 'm5-01', 'm5-q2': 'm5-01', 'm5-q3': 'm5-01', 'm5-q4': 'm5-01', 'm5-ai1': 'm5-01', 'm5-ai2': 'm5-01', 'm5-ai3': 'm5-01', 'm5-recap': 'm5-01',
  'm6-01': 'm6-01', 'm6-02': 'm6-01', 'm6-03': 'm6-01', 'm6-04': 'm6-01', 'm6-05': 'm6-01', 'm6-06': 'm6-01', 'm6-q1': 'm6-01', 'm6-q2': 'm6-01', 'm6-q3': 'm6-01', 'm6-ai1': 'm6-01', 'm6-ai2': 'm6-01', 'm6-recap': 'm6-01',
  'm7-01': 'm7-01', 'm7-02': 'm7-01', 'm7-03': 'm7-01', 'm7-04': 'm7-01', 'm7-q1': 'm7-01', 'm7-q2': 'm7-01', 'm7-r1': 'm7-01', 'm7-ai1': 'm7-01', 'm7-recap': 'm7-01',
};

type Context = { evidence: EvidenceEntry[]; rubric?: unknown; activityId: string; valid: boolean; knowledge: KnowledgeSelection | null };
const emptyKnowledge = (): KnowledgeSelection => ({ knowledge_bank_version: 'kb-unavailable', module_source_ids: [], scientific_source_ids: [], safety_policy_ids: [], claim_ids: [], module_context: [], scientific_context: [], safety_context: [], claim_context: [] });
function getContext(task: TaskName, input: Record<string, unknown>, env: Env): Context {
  let contextId = '';
  let activityId = String(input.activityId ?? input.lessonId ?? '');
  let rubric: unknown;
  if (task === 'teach-back') {
    const requested = String(input.activityId ?? '');
    const selected = teachBackRubrics[requested as keyof typeof teachBackRubrics];
    contextId = selected?.contextId ?? '';
    rubric = selected;
    if (!selected) return { evidence: [], activityId: requested, valid: false, knowledge: null };
  } else if (task === 'lesson-chat') {
    const requested = String(input.activityId ?? input.lessonId ?? '');
    const selectedRubric = teachBackRubrics[requested as keyof typeof teachBackRubrics];
    const selectedActivity = activityCatalog[requested as keyof typeof activityCatalog];
    rubric = selectedRubric;
    const lessonContext = lessonContextById[String(input.lessonId)];
    const activityKnown = !String(input.activityId ?? '') || Boolean(selectedRubric || selectedActivity || lessonContextById[String(input.activityId)]);
    const requestedModule = requested.match(/^(m[1-7])(?:-|$)/)?.[1];
    const lessonModule = lessonContext?.slice(0, 2);
    if (!lessonContext || !activityKnown || (String(input.activityId ?? '') && requestedModule !== lessonModule)) return { evidence: [], activityId, valid: false, knowledge: null };
    // The app sends an activity identifier alongside the concrete lesson screen.
    // For lesson-chat, the screen is the authoritative knowledge-bank context;
    // generic activity contexts such as "pap-barriers" do not identify a module.
    contextId = lessonContext ?? selectedRubric?.contextId ?? selectedActivity?.contextId ?? '';
  } else {
    const requested = String(task === 'lesson-question' ? input.lessonId : input.activityId ?? '');
    const selectedActivity = activityCatalog[requested as keyof typeof activityCatalog];
    if (selectedActivity && selectedActivity.task !== task) return { evidence: [], activityId: requested, valid: false, knowledge: null };
    if (task === 'lesson-question') {
      contextId = selectedActivity?.contextId ?? lessonContextById[requested] ?? '';
      if (!contextId) return { evidence: [], activityId: requested, valid: false, knowledge: null };
    } else {
      if (!selectedActivity) return { evidence: [], activityId: requested, valid: false, knowledge: null };
      contextId = selectedActivity.contextId;
    }
  }
  const locale: Locale = input.locale === 'es' ? 'es' : 'en';
  const userText = userTextFor(task, input);
  const knowledge = selectKnowledge({ moduleId: contextId.slice(0, 2), screenId: String(input.lessonId ?? input.activityId ?? ''), locale, userText });
  return { evidence: getEvidence(contextId, locale, evidenceEnabled(env), env.EVIDENCE_BANK_VERSION), rubric, activityId, valid: true, knowledge };
}

class ProviderError extends Error {
  constructor(
    public code: 'UPSTREAM_RATE_LIMITED' | 'TIMEOUT' | 'AI_UNAVAILABLE',
    public metadata: ProviderRateLimitMetadata = { providerHttpStatus: 0, headers: {} },
    public diagnostic?: ProviderResponseDiagnostic,
    public contextSnapshot?: ContextProvenance,
  ) { super(code); }
}

function userTextFor(task: TaskName, input: Record<string, unknown>): string {
  if (task === 'lesson-chat') return String((input.messages as { content: string }[]).at(-1)?.content ?? '');
  return String(input.response ?? input.question ?? input.goal ?? '');
}

function provenance(knowledge: KnowledgeSelection | null) {
  const selected = knowledge ?? emptyKnowledge();
  return { knowledge_bank_version: selected.knowledge_bank_version, module_source_ids: selected.module_source_ids, scientific_source_ids: selected.scientific_source_ids, safety_policy_ids: selected.safety_policy_ids, claim_ids: selected.claim_ids };
}

function commonMetadata(source_ids: string[], evidence_sufficient: boolean, needs_clinician: boolean, safety_category: SafetyCategory, knowledge: KnowledgeSelection | null = null) {
  return { source_ids, evidence_sufficient, needs_clinician, safety_category, ...provenance(knowledge) };
}

function taskResponse(task: TaskName, message: string, metadata: Record<string, unknown>, outsideScope = false, urgent = false) {
  if (task === 'lesson-chat') return { message, ...metadata };
  if (task === 'teach-back') return { feedback: message, followUpQuestion: undefined, status: 'needs_support' as const, ...metadata };
  if (task === 'lesson-question') return { answer: message, approvedContentIds: [], suggestedClinicianQuestions: [], outsideScope, ...metadata };
  if (task === 'pap-barrier') return { identifiedCategories: ['other or unclear'], clarificationQuestion: undefined, approvedContentIds: [], educationalResponse: message, suggestedDiscussionTopics: [], urgentLanguageDetected: urgent, outsideScope, ...metadata };
  return { revisedPlan: message, isSpecific: false, isRealistic: false, identifiedBarrier: undefined, nextStep: undefined, supportPersonOrTeam: undefined, prohibitedMedicalAdviceDetected: metadata.needs_clinician === true, ...metadata };
}

function unsupportedResponse(task: TaskName, locale: Locale, knowledge: KnowledgeSelection | null = null) {
  const message = unsupportedFallback[locale];
  const metadata = commonMetadata([], false, true, 'unsupported', knowledge);
  return taskResponse(task, message, metadata, true);
}

function urgentResponse(task: TaskName, locale: Locale, knowledge: KnowledgeSelection | null = null) {
  const message = urgentFixedMessage[locale];
  const metadata = commonMetadata([], false, true, 'urgent', knowledge);
  return taskResponse(task, message, metadata, true, true);
}

function medicationBoundaryResponse(task: TaskName, locale: Locale, knowledge: KnowledgeSelection | null) {
  const message = deterministicSafetyMessages.medication[locale];
  const metadata = commonMetadata(['POLICY-MEDICATION'], true, true, 'clinician_escalation', knowledge);
  return taskResponse(task, message, metadata);
}

function policyBoundaryResponse(task: TaskName, locale: Locale, knowledge: KnowledgeSelection | null, intent: SafetyIntent) {
  const message = intent === 'PAP_PRESSURE_SELECTION'
    ? deterministicSafetyMessages.pressure[locale]
    : intent === 'DIAGNOSIS_REQUEST'
      ? deterministicSafetyMessages.diagnosis[locale]
      : deterministicSafetyMessages.personalized[locale];
  const policyId = intent === 'PAP_PRESSURE_SELECTION' ? 'POLICY-PAP-SETTINGS' : intent === 'DIAGNOSIS_REQUEST' ? 'POLICY-DIAGNOSIS' : 'POLICY-PERSONALIZED-MEDICAL-ADVICE';
  const metadata = commonMetadata([policyId], true, true, 'clinician_escalation', knowledge);
  return taskResponse(task, message, metadata);
}

function deterministicPolicyDiagnostic(intent: SafetyIntent): EvaluationDiagnostic {
  return {
    provider_request_id: null,
    provider_http_status: 0,
    provider_model: 'not_attempted',
    provider_finish_reason: null,
    provider_content_present: false,
    provider_content_length: 0,
    provider_content_type: 'missing',
    provider_json_parse_status: 'not_attempted',
    worker_validation_status: 'not_attempted',
    worker_validation_error_code: null,
    worker_validation_error_path: null,
    worker_validation_error_message: null,
    sanitized_provider_content: null,
    provider_usage: null,
    prompt_cache: null,
    provider_attempted: false,
    provider_attempt_count: 0,
    safety_category: intent,
    deterministic_fallback: true,
    rejection_category: 'WORKER_DETERMINISTIC_POLICY_ROUTE',
    safety_policy_triggered: intent,
    fallback_used: intent === 'DIAGNOSIS_REQUEST' ? 'DIAGNOSIS_FALLBACK' : 'POLICY_FALLBACK',
  };
}

async function authorizeLessonResponse(
  response: Record<string, unknown>,
  reservedClaims: ConversationStateClaims,
  signingSecret: string,
): Promise<Record<string, unknown>> {
  return {
    ...response,
    conversationToken: await issueConversationToken(reservedClaims, signingSecret),
  };
}

async function commitLessonResponse(
  env: Env,
  response: Record<string, unknown>,
  reservationId: string | undefined,
  reservedClaims: ConversationStateClaims | undefined,
  signingSecret: string,
): Promise<Record<string, unknown> | null> {
  if (!reservationId || !reservedClaims || !env.CONVERSATION_STATE) return null;
  const committed = await coordinatorCall<{ ok: boolean }>(env.CONVERSATION_STATE, reservedClaims.conversation_id, '/commit', { reservationId, finalClaims: reservedClaims });
  if (!committed.ok) return null;
  return authorizeLessonResponse(response, reservedClaims, signingSecret);
}

async function rollbackLessonReservation(env: Env, reservationId: string | undefined, claims: ConversationStateClaims | undefined): Promise<void> {
  if (!reservationId || !claims || !env.CONVERSATION_STATE) return;
  await coordinatorCall(env.CONVERSATION_STATE, claims.conversation_id, '/rollback', { reservationId }).catch(() => undefined);
}

function deterministicModelMetadata(knowledge: KnowledgeSelection | null) {
  const selected = knowledge ?? emptyKnowledge();
  const sourceIds = [...selected.scientific_source_ids, ...selected.claim_ids, ...selected.safety_policy_ids]
    .filter(id => /^[A-Za-z0-9_-]+$/.test(id))
    .filter((id, index, ids) => ids.indexOf(id) === index)
    .slice(0, 12);
  const policyIds = new Set(selected.safety_policy_ids);
  const urgent = policyIds.has('POLICY-URGENT');
  const clinician = urgent || ['POLICY-CLINICIAN-REFERRAL', 'POLICY-DIAGNOSIS', 'POLICY-MEDICATION', 'POLICY-PAP-SETTINGS', 'POLICY-PREGNANCY', 'POLICY-PERSONALIZED-MEDICAL-ADVICE'].some(id => policyIds.has(id));
  return {
    source_ids: sourceIds,
    evidence_sufficient: sourceIds.length > 0,
    needs_clinician: clinician,
    safety_category: urgent ? 'urgent' as const : clinician ? 'clinician_escalation' as const : sourceIds.length > 0 ? 'education' as const : 'unsupported' as const,
  };
}

const genericFollowUpPatterns = [
  /^would you like(?: me)? to\b/i,
  /^anything else\b/i,
  /^¿(?:te|le) gustaría\b/i,
  /^¿hay algo más\b/i,
];
const explicitContinuationPatterns = /\b(?:ask me|quiz me|test me|practice with me|help me practice|tell me more|explain (?:that|this) further|what should i ask|what can i try next|continue)\b|\b(?:pregúntame|hazme preguntas|cuéntame más|explícamelo mejor|qué debo preguntar|cómo puedo seguir)\b/i;

function removeRepeatedFollowUp(reply: string, followUpQuestion: string): string {
  const questionIndex = reply.lastIndexOf(followUpQuestion);
  if (questionIndex < 0 || reply.slice(questionIndex).trim() !== followUpQuestion) return reply;
  const prefix = reply.slice(0, questionIndex).replace(/(?:\s|\n)*(?:check|check-in|follow[- ]?up question)\s*:\s*$/i, '').trim();
  return prefix || reply;
}

export function normalizeFollowUpQuestion(candidate: ProviderReply, locale: Locale, learnerMessage = '', interactionKind = ''): string | undefined {
  const question = candidate.followUpQuestion?.trim();
  if (!question || (question.match(/\?/g) ?? []).length !== 1 || question.length > 300) return undefined;
  if (!languageMatchesLocale(question, locale).accepted) return undefined;
  if (!screenGeneratedReply(question).allowed) return undefined;
  if (genericFollowUpPatterns.some((pattern) => pattern.test(question))) return undefined;
  // A teach-back activity is already an explicit learning exercise. Allow one
  // specific check question there; ordinary lesson chat still requires the
  // learner to ask for continuation so the tutor does not manufacture a
  // follow-up after every answer.
  if (interactionKind !== 'teach-back' && !explicitContinuationPatterns.test(learnerMessage.trim())) return undefined;
  return question;
}

function normalizeProviderReply(task: TaskName, candidate: ProviderReply, knowledge: KnowledgeSelection | null, lessonToken?: string, locale: Locale = 'en', learnerMessage = '', interactionKind = ''): Record<string, unknown> {
  const metadata = deterministicModelMetadata(knowledge);
  if (task === 'lesson-chat') {
    if (!lessonToken) throw new Error('Lesson authorization is required.');
    const followUpQuestion = normalizeFollowUpQuestion(candidate, locale, learnerMessage, interactionKind);
    return { message: followUpQuestion ? removeRepeatedFollowUp(candidate.reply, followUpQuestion) : candidate.reply, followUpQuestion, conversationToken: lessonToken, ...metadata };
  }
  if (task === 'teach-back') return { feedback: candidate.reply, followUpQuestion: undefined, status: 'needs_support', ...metadata };
  if (task === 'lesson-question') return { answer: candidate.reply, approvedContentIds: metadata.source_ids, suggestedClinicianQuestions: [], outsideScope: metadata.safety_category === 'unsupported', ...metadata };
  if (task === 'pap-barrier') return { identifiedCategories: ['other or unclear'], clarificationQuestion: undefined, approvedContentIds: metadata.source_ids, educationalResponse: candidate.reply, suggestedDiscussionTopics: [], urgentLanguageDetected: metadata.safety_category === 'urgent', outsideScope: metadata.safety_category === 'unsupported', ...metadata };
  return { revisedPlan: candidate.reply, isSpecific: false, isRealistic: false, identifiedBarrier: undefined, nextStep: undefined, supportPersonOrTeam: undefined, prohibitedMedicalAdviceDetected: metadata.needs_clinician, ...metadata };
}

const providerRequest = async (
  task: TaskName,
  input: Record<string, unknown>,
  context: Context,
  env: Env,
  diagnosticsEnabled: boolean,
  authoritativeState?: ConversationStateClaims,
  repairAttempt = false,
  modelOverride?: string,
) => {
  const controller = new AbortController();
  const timeoutMs = Math.min(modelConfig.timeoutMs, Math.max(1, Number(env.UPSTREAM_TIMEOUT_MS ?? modelConfig.timeoutMs)));
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const locale = authoritativeState?.locale ?? (input.locale === 'es' ? 'es' : 'en');
  const providerModel = modelOverride ?? env.GROQ_MODEL ?? modelConfig.defaultModel;
  const interactionKind = task === 'lesson-chat' ? String(input.kind ?? '') : '';
  const interactionInstructions = interactionKind === 'teach-back'
    ? 'INTERACTION MODE: teach-back. Treat the latest learner message as their attempt to explain the lesson, not as a request to recite the lesson. Respond to that exact attempt first: acknowledge what is correct using the learner’s own wording, identify at most one important missing or unclear concept from the supplied rubric, and explain that missing link briefly. If the latest message is a clear general question, answer that question directly instead of forcing it into a teach-back rubric or a diagnosis refusal. For treatment-pathway questions such as surgery, explain the general evaluation pathway (usually confirmation of the condition, assessment by the sleep-care or relevant surgical team, and discussion of options) without deciding candidacy or recommending treatment for the individual. For a short or partial answer, do not stop at “Got it”; add the key causal step the learner has not stated. Ask at most one specific concept-check question when it would help learning. Do not merely restate a generic OSA explanation, end with an open invitation such as “What would you like to practice?”, or put the same check question in both reply and followUpQuestion. Put explanatory feedback only in reply and the optional check question only in followUpQuestion. If the learner says they are confused, explain the current concept in simpler language and connect it to the conversation before asking a narrow check question; do not ask a broad “what would you like clarified?” question. If the learner sends a low-information message such as “test”, acknowledge it without inventing symptoms, diagnoses, or a system-status claim, and ask what they want to practice.'
    : interactionKind === 'reflection'
      ? 'INTERACTION MODE: reflection. Respond to the learner’s reflection and its emotional or practical meaning before offering any lesson context; do not replace it with a generic lesson summary.'
      : interactionKind === 'lesson-question'
        ? 'INTERACTION MODE: lesson question. Answer the learner’s actual question directly and do not treat it as a teach-back attempt.'
        : interactionKind
          ? `INTERACTION MODE: ${interactionKind}. Respond to the learner’s latest message in that activity’s specific context before adding general education.`
          : '';
  const system = `${canonicalConversationPolicy.system} Policy ID: ${canonicalConversationPolicy.id}. Policy version: ${canonicalConversationPolicy.version}. The explicit LOCALE is authoritative: respond only in that language even if the user message uses another language. Keep reply under 800 characters, using 2-4 short sentences or a few short bullets; never exceed 900 characters and do not produce an exhaustive numbered list. Most complete learner questions should end after the answer; reserve followUpQuestion for a real ambiguity, explicit teach-back or reflection, or a learner who asks to continue. ${interactionInstructions} ${repairAttempt ? 'This is the single allowed repair attempt after a provider-format or language-policy failure. Recompose the reply in the active LOCALE using the same supplied context and policy; do not add any new facts.' : ''} Example: {"reply":"A concise educational explanation."}`;
  if (!context.knowledge) throw new ProviderError('AI_UNAVAILABLE');
  const history = task === 'lesson-chat'
    ? trimConversationHistory(input.messages as ConversationMessage[])
    : [{ role: 'user' as const, content: userTextFor(task, input) }];
  const actualSuppliedContext = {
    APPROVED_KNOWLEDGE: context.knowledge,
    CLAIM_CONTEXT: context.knowledge.claim_context,
    APPROVED_EVIDENCE: context.evidence,
    RUBRIC: context.rubric ?? null,
    CONVERSATION_HISTORY: history.slice(0, -1),
    CURRENT_USER_MESSAGE: history.at(-1) ?? null,
  };
  const contextSnapshot = await contextProvenance(actualSuppliedContext, context.knowledge);
  const body = {
    model: providerModel,
    messages: [
      { role: 'system', content: system },
      { role: 'system', content: JSON.stringify({
        TASK: task,
        INTERACTION_KIND: interactionKind || null,
        INTERACTION_INSTRUCTIONS: interactionInstructions || null,
        LOCALE: locale,
        CONVERSATION_POLICY: canonicalConversationPolicy.id,
        CONVERSATION_HISTORY_BUDGET: { maxPriorMessages: CONVERSATION_HISTORY_MAX_MESSAGES - 1, maxMessages: CONVERSATION_HISTORY_MAX_MESSAGES, maxCharacters: CONVERSATION_HISTORY_MAX_CHARS },
        LESSON_ACTIVITY_CONTEXT: 'Use the supplied context when it applies, but do not attribute general education to the lesson unless the fact is explicitly present in that context.',
        ...actualSuppliedContext,
      }) },
      ...history,
    ],
    temperature: modelConfig.temperature,
    max_completion_tokens: modelConfig.maxCompletionTokens,
    include_reasoning: modelConfig.includeReasoning,
    reasoning_effort: modelConfig.reasoningEffort,
    response_format: { type: 'json_object' },
  };
  const promptCache = await promptCacheDiagnostic(system);
  let providerMetadata: ProviderRateLimitMetadata = { providerHttpStatus: 0, headers: {} };
  let providerDiagnostic: ProviderResponseDiagnostic | undefined;
  try {
    const response = await fetch(modelConfig.endpoint, { method: 'POST', headers: { Authorization: `Bearer ${env.GROQ_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: controller.signal });
    const metadata = captureProviderRateLimitMetadata(response);
    providerMetadata = metadata;
    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      providerDiagnostic = withProviderHttpFailure(errorBody, { captureContent: diagnosticsEnabled, providerRequestId: response.headers.get('x-request-id'), providerHttpStatus: response.status, providerModel, promptCache, sensitiveValues: [env.GROQ_API_KEY ?? '', env.EVALUATION_DIAGNOSTICS_TOKEN ?? '', env.CONVERSATION_STATE_SIGNING_SECRET ?? ''] });
      if (response.status === 429) throw new ProviderError('UPSTREAM_RATE_LIMITED', metadata, providerDiagnostic, contextSnapshot);
      if (!repairAttempt && response.status === 400 && /json_validate_failed/i.test(errorBody)) {
        return await providerRequest(task, input, context, env, diagnosticsEnabled, authoritativeState, true, modelOverride);
      }
      throw new ProviderError('AI_UNAVAILABLE', metadata, providerDiagnostic, contextSnapshot);
    }
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      providerDiagnostic = withProviderEnvelopeFailure({ captureContent: diagnosticsEnabled, providerRequestId: response.headers.get('x-request-id'), providerHttpStatus: response.status, providerModel, promptCache, sensitiveValues: [env.GROQ_API_KEY ?? '', env.EVALUATION_DIAGNOSTICS_TOKEN ?? '', env.CONVERSATION_STATE_SIGNING_SECRET ?? ''] });
      throw new ProviderError('AI_UNAVAILABLE', metadata, providerDiagnostic, contextSnapshot);
    }
    const parsed = parseProviderEnvelope(payload, { captureContent: diagnosticsEnabled, providerRequestId: response.headers.get('x-request-id'), providerHttpStatus: response.status, providerModel, promptCache, sensitiveValues: [env.GROQ_API_KEY ?? '', env.EVALUATION_DIAGNOSTICS_TOKEN ?? '', env.CONVERSATION_STATE_SIGNING_SECRET ?? ''] });
    providerDiagnostic = parsed.diagnostic;
    if (!parsed.ok) throw new ProviderError('AI_UNAVAILABLE', metadata, parsed.diagnostic, contextSnapshot);
     return { candidate: parsed.candidate, metadata, diagnostic: parsed.diagnostic, contextSnapshot, repair_attempted: repairAttempt, provider_attempt_count: repairAttempt ? 2 : 1 };
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    if (error instanceof Error && error.name === 'AbortError') throw new ProviderError('TIMEOUT', providerMetadata, providerDiagnostic, contextSnapshot);
    throw new ProviderError('AI_UNAVAILABLE', providerMetadata, providerDiagnostic, contextSnapshot);
  } finally { clearTimeout(timer); }
};

export async function handleRequest(request: Request, env: Env): Promise<Response> {
  const requestId = createRequestId();
  const diagnosticsEnabled = await evaluationDiagnosticsAuthorized(request, env);
  if (!originAllowed(request, env)) return fail(request, env, requestId, 'INVALID_REQUEST', 'Request origin is not allowed.', false, 403);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request, env, requestId) });
  const url = new URL(request.url);
  if (request.method === 'GET' && url.pathname === '/health') {
    audit(requestId, 'health', 'complete', 200);
    return json(request, env, requestId, {
      ok: true,
      service: 'sleep-education-ai-worker',
      configured: Boolean(env.GROQ_API_KEY && env.GROQ_MODEL && modelConfig.allowedModels.includes(env.GROQ_MODEL as never) && (env.CONVERSATION_STATE_SIGNING_SECRET?.length ?? 0) >= 32 && env.CONVERSATION_STATE),
      evidence_enabled: evidenceEnabled(env),
      conversation_state_signing_configured: (env.CONVERSATION_STATE_SIGNING_SECRET?.length ?? 0) >= 32,
      evaluation_diagnostics_configured: env.EVALUATION_DIAGNOSTICS_ENABLED === 'true' && (env.EVALUATION_DIAGNOSTICS_TOKEN?.length ?? 0) >= 32,
    });
  }
  const match = url.pathname.match(/^\/v1\/([^/]+)$/);
  const route = match?.[1];
  const task = route as TaskName | undefined;
  const conversationStart = route === 'conversation-start';
  if (request.method !== 'POST' || (!conversationStart && (!task || !taskNames.includes(task)))) return fail(request, env, requestId, 'INVALID_REQUEST', 'Route not found.', false, 404);
  if (rateLimited(request)) return fail(request, env, requestId, 'RATE_LIMITED', 'Too many requests. Please wait and try again.', true, 429);
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return fail(request, env, requestId, 'INVALID_REQUEST', 'Request body must be JSON.', false, 415);
  const declaredLength = Number(request.headers.get('Content-Length') ?? 0);
  if (declaredLength > MAX_BODY_BYTES) return fail(request, env, requestId, 'INVALID_REQUEST', 'Request body is too large.', false, 413);
  let rawText: string;
  try { rawText = await request.text(); } catch { return fail(request, env, requestId, 'INVALID_REQUEST', 'Request body could not be read.', false, 400); }
  if (new TextEncoder().encode(rawText).byteLength > MAX_BODY_BYTES) return fail(request, env, requestId, 'INVALID_REQUEST', 'Request body is too large.', false, 413);
  let raw: unknown;
  try { raw = JSON.parse(rawText); } catch { return fail(request, env, requestId, 'INVALID_REQUEST', 'Request body must be valid JSON.', false, 400); }
  const signingSecret = env.CONVERSATION_STATE_SIGNING_SECRET ?? '';
  if (conversationStart) {
    if (signingSecret.length < 32 || !env.CONVERSATION_STATE) return fail(request, env, requestId, 'CONFIGURATION_ERROR', 'AI service configuration is incomplete.', false, 503);
    const start = conversationStartRequestSchema.safeParse(raw);
    if (!start.success || !lessonContextById[start.data.lessonId]) return fail(request, env, requestId, 'INVALID_REQUEST', 'The lesson context is not recognized.', false, 400);
    const claims = createConversationState({ module_id: start.data.lessonId.slice(0, 2), screen_id: start.data.lessonId, locale: start.data.locale });
    const initialized = await coordinatorCall<{ ok: boolean; reason?: string }>(env.CONVERSATION_STATE, claims.conversation_id, '/initialize', { claims });
    if (!initialized.ok) return fail(request, env, requestId, 'AI_UNAVAILABLE', 'AI feedback is temporarily unavailable. Your lesson and saved progress are still available.', true, 503);
    return json(request, env, requestId, {
      conversationToken: await issueConversationToken(claims, signingSecret),
    });
  }
  if (!task) return fail(request, env, requestId, 'INVALID_REQUEST', 'Route not found.', false, 404);
  const parsed = requestSchemas[task].safeParse(raw);
  if (!parsed.success) { audit(requestId, task, 'request_schema', 400, 'invalid'); return fail(request, env, requestId, 'INVALID_REQUEST', 'The request is missing required fields or exceeds a safe limit.', false, 400); }
  const input = parsed.data as Record<string, unknown>;
  const userText = userTextFor(task, input);
  const conversationMessages = task === 'lesson-chat' ? trimConversationHistory(input.messages as ConversationMessage[]) : [];
  const conversationText = task === 'lesson-chat'
    ? conversationMessages.map(message => message.content).join('\n')
    : userText;
  const totalLength = conversationText.length;
  if (totalLength > MAX_TOTAL_MESSAGE_CHARS) return fail(request, env, requestId, 'INVALID_REQUEST', 'The conversation is too long.', false, 400);
  const requestedLocale: Locale = input.locale === 'es' ? 'es' : 'en';
  let locale: Locale = requestedLocale;
  let authorizedState: ConversationStateClaims | undefined;
  if (task === 'lesson-chat') {
    if (signingSecret.length < 32 || !env.CONVERSATION_STATE) return fail(request, env, requestId, 'CONFIGURATION_ERROR', 'AI service configuration is incomplete.', false, 503);
    const binding = { module_id: String(input.lessonId).slice(0, 2), screen_id: String(input.lessonId) };
    const verified = await verifyConversationTokenForScreen(String(input.conversationToken), signingSecret, binding);
    if (!verified.ok) {
      audit(requestId, task, 'conversation_state', 400, verified.reason);
      return failWithProviderDiagnostic(request, env, requestId, 'INVALID_REQUEST', 'The conversation authorization is invalid or expired.', false, 400, diagnosticsEnabled, workerOnlyDiagnostic('WORKER_STATE_REJECTION', 'conversationToken', verified.reason));
    }
    authorizedState = verified.claims;
    locale = authorizedState.locale;
  }
  const authoritativeInput = task === 'lesson-chat' && authorizedState ? { ...input, locale: authorizedState.locale } : input;
  if (urgentPatterns.some(pattern => pattern.test(userText)) && task !== 'lesson-chat') return json(request, env, requestId, urgentResponse(task, locale, selectKnowledge({ moduleId: String(input.lessonId ?? '').slice(0, 2), screenId: String(input.lessonId ?? ''), locale, userText })));
  if (injectionPatterns.some(pattern => pattern.test(conversationText))) return fail(request, env, requestId, 'OUTSIDE_SCOPE', 'That request is outside this educational tool scope.', false, 400);
  if (identifierPatterns.some(pattern => pattern.test(conversationText))) return fail(request, env, requestId, 'INVALID_REQUEST', 'Please remove identifying information before sending.', false, 400);
  if (injectionPatterns.some(pattern => pattern.test(userText))) return fail(request, env, requestId, 'OUTSIDE_SCOPE', 'That request is outside this educational tool’s scope.', false, 400);
  if (identifierPatterns.some(pattern => pattern.test(userText))) return fail(request, env, requestId, 'INVALID_REQUEST', 'Please remove identifying information before sending.', false, 400);
  const context = getContext(task, authoritativeInput, env);
  if (!context.valid) return fail(request, env, requestId, 'INVALID_REQUEST', 'The lesson context is not recognized.', false, 400);
  const intent = classifySafetyIntent(userText, context.knowledge, { interactionKind: task === 'lesson-chat' ? String(authoritativeInput.kind ?? '') : undefined });
  let reservationId: string | undefined;
  let reservedState: ConversationStateClaims | undefined;
  if (task === 'lesson-chat' && authorizedState && env.CONVERSATION_STATE) {
    const reserved = await coordinatorCall<{ ok: boolean; reason?: string; reservationId?: string; nextClaims?: ConversationStateClaims; current?: ConversationStateClaims }>(env.CONVERSATION_STATE, authorizedState.conversation_id, '/reserve', { claims: authorizedState });
    if (!reserved.ok) {
      return failWithProviderDiagnostic(request, env, requestId, 'INVALID_REQUEST', 'The conversation authorization is invalid or expired.', false, 400, diagnosticsEnabled, workerOnlyDiagnostic('WORKER_STATE_REJECTION', 'conversationToken', reserved.reason ?? 'STATE_REJECTED'));
    }
    reservationId = reserved.reservationId;
    reservedState = reserved.nextClaims;
    if (!reservationId || !reservedState) return fail(request, env, requestId, 'AI_UNAVAILABLE', 'AI feedback is temporarily unavailable. Your lesson and saved progress are still available.', true, 503);
  }
  if (intent === 'EMERGENCY') {
    const fixed = urgentResponse(task, locale, context.knowledge);
    const accepted = task === 'lesson-chat' ? await commitLessonResponse(env, fixed, reservationId, reservedState, signingSecret) : fixed;
    return accepted ? json(request, env, requestId, accepted) : fail(request, env, requestId, 'AI_UNAVAILABLE', 'AI feedback is temporarily unavailable. Your lesson and saved progress are still available.', true, 503);
  }
  if (intent === 'MEDICATION_SELECTION') {
    const fixed = medicationBoundaryResponse(task, locale, context.knowledge);
    const accepted = task === 'lesson-chat' ? await commitLessonResponse(env, fixed, reservationId, reservedState, signingSecret) : fixed;
    return accepted ? json(request, env, requestId, accepted) : fail(request, env, requestId, 'AI_UNAVAILABLE', 'AI feedback is temporarily unavailable. Your lesson and saved progress are still available.', true, 503);
  }
  if (intent === 'PAP_PRESSURE_SELECTION' || intent === 'DIAGNOSIS_REQUEST' || intent === 'PERSONALIZED_MEDICAL_ADVICE') {
    const fixed = policyBoundaryResponse(task, locale, context.knowledge, intent);
    const accepted = task === 'lesson-chat' ? await commitLessonResponse(env, fixed, reservationId, reservedState, signingSecret) : fixed;
    return accepted
      ? json(request, env, requestId, { ...accepted, ...(diagnosticsEnabled ? { evaluation_diagnostic: { ...deterministicPolicyDiagnostic(intent), active_locale: locale, requested_locale: requestedLocale, locale_source: task === 'lesson-chat' ? 'SIGNED_CONVERSATION_STATE' : 'REQUEST_LOCALE' } } : {}) })
      : fail(request, env, requestId, 'AI_UNAVAILABLE', 'AI feedback is temporarily unavailable. Your lesson and saved progress are still available.', true, 503);
  }
  if (!context.evidence.length && !context.knowledge) {
    audit(requestId, task, 'knowledge_unavailable', 200, 'fail_closed');
    const fixed = unsupportedResponse(task, locale, context.knowledge);
    const accepted = task === 'lesson-chat' ? await commitLessonResponse(env, fixed, reservationId, reservedState, signingSecret) : fixed;
    return accepted ? json(request, env, requestId, accepted) : fail(request, env, requestId, 'AI_UNAVAILABLE', 'AI feedback is temporarily unavailable. Your lesson and saved progress are still available.', true, 503);
  }
  if (!env.GROQ_API_KEY || !env.GROQ_MODEL || !modelConfig.allowedModels.includes(env.GROQ_MODEL as never)) {
    await rollbackLessonReservation(env, reservationId, reservedState);
    return fail(request, env, requestId, 'CONFIGURATION_ERROR', 'AI service configuration is incomplete.', false, 503);
  }
  try {
    let providerModel = env.GROQ_MODEL;
    let fallbackModelUsed: string | undefined;
    let providerResult: Awaited<ReturnType<typeof providerRequest>>;
    try {
      providerResult = await providerRequest(task, authoritativeInput, context, env, diagnosticsEnabled, authorizedState);
    } catch (primaryError) {
      const fallbackModel = modelConfig.fallbackModels.find(model => model !== providerModel && modelConfig.allowedModels.includes(model as never));
      const canUseFallback = primaryError instanceof ProviderError && ['UPSTREAM_RATE_LIMITED', 'AI_UNAVAILABLE', 'TIMEOUT'].includes(primaryError.code);
      if (!fallbackModel || !canUseFallback) throw primaryError;
      try {
        providerModel = fallbackModel;
        providerResult = await providerRequest(task, authoritativeInput, context, env, diagnosticsEnabled, authorizedState, false, fallbackModel);
        fallbackModelUsed = fallbackModel;
        providerResult = { ...providerResult, provider_attempt_count: providerResult.provider_attempt_count + 1 };
      } catch {
        throw primaryError;
      }
    }
    let providerAttemptCount = providerResult.provider_attempt_count;
    const safety = screenGeneratedReply(providerResult.candidate.reply);
    const pregnancyBoundary = intent === 'PREGNANCY_PAP_EDUCATION'
      ? screenPregnancyReply(providerResult.candidate.reply)
      : { allowed: true, missing: [] as string[] };
    if (!safety.allowed || !pregnancyBoundary.allowed) {
      const code = 'WORKER_SAFETY_REJECTION';
      const teachBackUncertainty = task === 'lesson-chat' && String(authoritativeInput.kind ?? '') === 'teach-back' && isTeachBackUncertaintyMessage(userText);
      const diagnosisRequested = isDirectDiagnosisRequest(userText);
      const surgeryPathway = task === 'lesson-chat' && isSurgeryPathwayQuestion(userText);
      const fallbackUsed = !safety.allowed
        ? safety.policyClass === 'PAP_SETTING_DIRECTIVE'
          ? 'PAP_SETTINGS_FALLBACK'
          : safety.policyClass === 'DIAGNOSIS_ASSERTION' && diagnosisRequested
            ? 'DIAGNOSIS_FALLBACK'
            : teachBackUncertainty
              ? 'TEACH_BACK_UNCERTAINTY_FALLBACK'
              : surgeryPathway
                ? 'SURGERY_PATHWAY_FALLBACK'
            : safety.policyClass.startsWith('MEDICATION_')
              ? 'MEDICATION_FALLBACK'
              : 'GENERATED_SAFETY_FALLBACK'
        : 'PREGNANCY_BOUNDED_FALLBACK';
      const diagnostic: EvaluationDiagnostic = {
        ...withWorkerValidation(providerResult.diagnostic, code, 'reply', !safety.allowed ? safety.violation : `Pregnancy response omitted required concepts: ${pregnancyBoundary.missing.join(', ')}.`),
        context_provenance: providerResult.contextSnapshot,
        provider_rate_limits: providerResult.metadata,
        rejection_category: code,
        generated_reply_blocked: true,
        safety_policy_triggered: !safety.allowed ? safety.policyClass : 'PREGNANCY_RESPONSE_BOUNDS',
        fallback_used: fallbackUsed,
        provider_attempt_count: providerResult.provider_attempt_count,
      };
      const fallbackMessage = intent === 'PREGNANCY_PAP_EDUCATION'
        ? deterministicSafetyMessages.pregnancy[locale]
        : !safety.allowed && safety.policyClass === 'PAP_SETTING_DIRECTIVE'
          ? deterministicSafetyMessages.pressure[locale]
          : !safety.allowed && safety.policyClass === 'DIAGNOSIS_ASSERTION' && diagnosisRequested
            ? deterministicSafetyMessages.diagnosis[locale]
            : teachBackUncertainty
              ? deterministicSafetyMessages.teachBackUncertainty[locale]
              : surgeryPathway
                ? deterministicSafetyMessages.surgeryPathway[locale]
            : !safety.allowed && safety.policyClass.startsWith('MEDICATION_')
              ? deterministicSafetyMessages.medication[locale]
              : deterministicSafetyMessages.generatedFallback[locale];
      const fallbackBase = { message: fallbackMessage, ...deterministicModelMetadata(context.knowledge) };
      const fallback = task === 'lesson-chat'
        ? await commitLessonResponse(env, fallbackBase, reservationId, reservedState, signingSecret)
        : normalizeProviderReply(task, { reply: fallbackMessage }, context.knowledge);
      if (!fallback) return fail(request, env, requestId, 'AI_UNAVAILABLE', 'AI feedback is temporarily unavailable. Your lesson and saved progress are still available.', true, 503);
      audit(requestId, task, 'safety_screen', 200, code);
      return json(request, env, requestId, { ...fallback, ...provenance(context.knowledge), ...(diagnosticsEnabled ? { evaluation_diagnostic: diagnostic } : {}) });
    }
    let language = languageMatchesLocale(providerResult.candidate.reply, locale);
    if (!language.accepted) {
      try {
        const repaired = await providerRequest(task, authoritativeInput, context, env, diagnosticsEnabled, authorizedState, true, providerModel);
        providerAttemptCount = providerAttemptCount + repaired.provider_attempt_count - 1;
        const repairedSafety = screenGeneratedReply(repaired.candidate.reply);
        const repairedPregnancy = intent === 'PREGNANCY_PAP_EDUCATION' ? screenPregnancyReply(repaired.candidate.reply) : { allowed: true, missing: [] as string[] };
        if (!repairedSafety.allowed || !repairedPregnancy.allowed) {
          const safetyDiagnostic: EvaluationDiagnostic = {
            ...withWorkerValidation(repaired.diagnostic, 'WORKER_SAFETY_REJECTION', 'reply', !repairedSafety.allowed ? repairedSafety.violation : `Pregnancy response omitted required concepts: ${repairedPregnancy.missing.join(', ')}.`),
            context_provenance: repaired.contextSnapshot,
            provider_rate_limits: repaired.metadata,
            rejection_category: 'WORKER_SAFETY_REJECTION',
            generated_reply_blocked: true,
            safety_policy_triggered: !repairedSafety.allowed ? repairedSafety.policyClass : 'PREGNANCY_RESPONSE_BOUNDS',
            fallback_used: 'GENERATED_SAFETY_FALLBACK',
            repair_attempted: true,
            provider_attempt_count: repaired.provider_attempt_count,
            active_locale: locale,
            requested_locale: requestedLocale,
            locale_source: task === 'lesson-chat' ? 'SIGNED_CONVERSATION_STATE' : 'REQUEST_LOCALE',
          };
          const fallbackBase = { message: deterministicSafetyMessages.generatedFallback[locale], ...deterministicModelMetadata(context.knowledge) };
          const fallback = task === 'lesson-chat' ? await commitLessonResponse(env, fallbackBase, reservationId, reservedState, signingSecret) : normalizeProviderReply(task, { reply: fallbackBase.message }, context.knowledge);
          if (!fallback) return fail(request, env, requestId, 'AI_UNAVAILABLE', 'AI feedback is temporarily unavailable. Your lesson and saved progress are still available.', true, 503);
          return json(request, env, requestId, { ...fallback, ...provenance(context.knowledge), ...(diagnosticsEnabled ? { evaluation_diagnostic: safetyDiagnostic } : {}) });
        }
        const repairedLanguage = languageMatchesLocale(repaired.candidate.reply, locale);
        if (repairedLanguage.accepted) {
           providerResult = repaired;
          language = repairedLanguage;
        }
      } catch {
        providerAttemptCount = Math.max(providerAttemptCount ?? 0, 2);
        // The deterministic localized fallback below is the only release path
        // when the single repair attempt is unavailable or rate-limited.
      }
    }
    if (!language.accepted) {
      const code = 'WORKER_LANGUAGE_REJECTION';
      const diagnostic: EvaluationDiagnostic = {
        ...withWorkerValidation(providerResult.diagnostic, code, 'reply', `Expected ${locale}; detected ${language.detected}.`),
        context_provenance: providerResult.contextSnapshot,
        provider_rate_limits: providerResult.metadata,
        rejection_category: code,
        language_detected: language.detected,
        generated_reply_blocked: true,
        safety_policy_triggered: 'ACTIVE_LANGUAGE',
        fallback_used: 'LANGUAGE_FALLBACK',
        repair_attempted: true,
        provider_attempt_count: providerAttemptCount,
        active_locale: locale,
        requested_locale: requestedLocale,
        locale_source: task === 'lesson-chat' ? 'SIGNED_CONVERSATION_STATE' : 'REQUEST_LOCALE',
      };
      const fallbackBase = { message: languageFallback[locale], ...deterministicModelMetadata(context.knowledge) };
      const fallback = task === 'lesson-chat'
        ? await commitLessonResponse(env, fallbackBase, reservationId, reservedState, signingSecret)
        : normalizeProviderReply(task, { reply: languageFallback[locale] }, context.knowledge);
      if (!fallback) return fail(request, env, requestId, 'AI_UNAVAILABLE', 'AI feedback is temporarily unavailable. Your lesson and saved progress are still available.', true, 503);
      audit(requestId, task, 'language_screen', 200, language.detected);
      return json(request, env, requestId, { ...fallback, ...provenance(context.knowledge), ...(diagnosticsEnabled ? { evaluation_diagnostic: diagnostic } : {}) });
    }
    let lessonToken: string | undefined;
    if (task === 'lesson-chat' && reservedState) {
      lessonToken = await issueConversationToken(reservedState, signingSecret);
    }
    const latestLearnerMessage = task === 'lesson-chat'
      ? (authoritativeInput.messages as ConversationMessage[]).at(-1)?.content
      : undefined;
    const normalized = normalizeProviderReply(task, providerResult.candidate, context.knowledge, lessonToken, locale, latestLearnerMessage, task === 'lesson-chat' ? String(authoritativeInput.kind ?? '') : '');
    const validated = responseSchemas[task].safeParse(normalized);
    if (!validated.success) {
      const issue = validated.error.issues[0];
      const diagnostic = withWorkerValidation(providerResult.diagnostic, 'WORKER_RESPONSE_SCHEMA', issue?.path.length ? issue.path.join('.') : '$', issue?.message ?? 'Normalized Worker response does not match its schema.');
      audit(requestId, task, 'response_schema', 502, 'invalid');
      await rollbackLessonReservation(env, reservationId, reservedState);
      return failWithProviderDiagnostic(request, env, requestId, 'AI_UNAVAILABLE', 'AI feedback is temporarily unavailable. Your lesson and saved progress are still available.', true, 502, diagnosticsEnabled, { ...diagnostic, context_provenance: providerResult.contextSnapshot, provider_rate_limits: providerResult.metadata, rejection_category: 'WORKER_PROVIDER_CONTRACT_REJECTION' });
    }
    const result = validated.data as Record<string, unknown>;
    const sourceIds = result.source_ids as string[];
    const legacyIds = (result.approvedContentIds as string[] | undefined) ?? [];
    const allowedKnowledgeIds = new Set([...(context.knowledge?.scientific_source_ids ?? []), ...(context.knowledge?.module_source_ids ?? []), ...(context.knowledge?.safety_policy_ids ?? []), ...(context.knowledge?.claim_ids ?? [])]);
    if (legacyIds.some(sourceId => !isValidEvidenceId(sourceId, context.evidence)) || sourceIds.some(sourceId => !isValidEvidenceId(sourceId, context.evidence) && !allowedKnowledgeIds.has(sourceId))) {
      const diagnostic = withWorkerValidation(providerResult.diagnostic, 'INVALID_SOURCE_ID', 'source_ids', 'Normalized source IDs are not present in the selected evidence or knowledge context.');
      audit(requestId, task, 'knowledge_validation', 502, 'invalid_source');
      await rollbackLessonReservation(env, reservationId, reservedState);
      return failWithProviderDiagnostic(request, env, requestId, 'AI_UNAVAILABLE', 'AI feedback is temporarily unavailable. Your lesson and saved progress are still available.', true, 502, diagnosticsEnabled, { ...diagnostic, context_provenance: providerResult.contextSnapshot, provider_rate_limits: providerResult.metadata, rejection_category: 'WORKER_PROVIDER_CONTRACT_REJECTION' });
    }
    if (result.evidence_sufficient === true && sourceIds.length === 0 && legacyIds.length === 0) {
      const diagnostic = withWorkerValidation(providerResult.diagnostic, 'MISSING_SOURCE', 'source_ids', 'Evidence-sufficient response contains no deterministic source IDs.');
      audit(requestId, task, 'knowledge_validation', 502, 'missing_source');
      await rollbackLessonReservation(env, reservationId, reservedState);
      return failWithProviderDiagnostic(request, env, requestId, 'AI_UNAVAILABLE', 'AI feedback is temporarily unavailable. Your lesson and saved progress are still available.', true, 502, diagnosticsEnabled, { ...diagnostic, context_provenance: providerResult.contextSnapshot, provider_rate_limits: providerResult.metadata, rejection_category: 'WORKER_PROVIDER_CONTRACT_REJECTION' });
    }
    if (result.evidence_sufficient === false) {
      const fixed = unsupportedResponse(task, locale, context.knowledge);
      const accepted = task === 'lesson-chat' ? await commitLessonResponse(env, fixed, reservationId, reservedState, signingSecret) : fixed;
      return accepted ? json(request, env, requestId, accepted) : fail(request, env, requestId, 'AI_UNAVAILABLE', 'AI feedback is temporarily unavailable. Your lesson and saved progress are still available.', true, 503);
    }
    if (task === 'lesson-chat' && reservedState && reservationId && env.CONVERSATION_STATE) {
      const committed = await coordinatorCall<{ ok: boolean }>(env.CONVERSATION_STATE, reservedState.conversation_id, '/commit', { reservationId, finalClaims: reservedState });
      if (!committed.ok) return fail(request, env, requestId, 'AI_UNAVAILABLE', 'AI feedback is temporarily unavailable. Your lesson and saved progress are still available.', true, 503);
    }
    audit(requestId, task, 'complete', 200);
     const diagnostic: EvaluationDiagnostic = { ...providerResult.diagnostic, context_provenance: providerResult.contextSnapshot, provider_rate_limits: providerResult.metadata, active_locale: locale, requested_locale: requestedLocale, locale_source: task === 'lesson-chat' ? 'SIGNED_CONVERSATION_STATE' : 'REQUEST_LOCALE', repair_attempted: providerResult.repair_attempted, provider_attempt_count: providerAttemptCount, ...(fallbackModelUsed ? { fallback_used: 'MODEL_FALLBACK' } : {}) };
    return json(request, env, requestId, { ...result, ...provenance(context.knowledge), ...(diagnosticsEnabled ? { evaluation_diagnostic: diagnostic } : {}) });
  } catch (error) {
    await rollbackLessonReservation(env, reservationId, reservedState);
    const code = error instanceof ProviderError ? error.code : 'AI_UNAVAILABLE';
    const status = code === 'UPSTREAM_RATE_LIMITED' ? 429 : code === 'TIMEOUT' ? 504 : 502;
    audit(requestId, task, 'provider', status, code);
    const providerError = error instanceof ProviderError ? error : undefined;
    const rejectionCategory = providerError?.metadata.providerHttpStatus === 200 && providerError.diagnostic?.worker_validation_status === 'rejected' ? 'WORKER_PROVIDER_CONTRACT_REJECTION' : undefined;
    const diagnosticBase = providerError ? (providerError.diagnostic ?? providerTransportDiagnostic(providerError.metadata, env.GROQ_MODEL ?? modelConfig.defaultModel)) : undefined;
    const diagnostic = diagnosticBase ? { ...diagnosticBase, context_provenance: providerError?.contextSnapshot, provider_rate_limits: providerError?.metadata, rejection_category: rejectionCategory, active_locale: locale, requested_locale: requestedLocale, locale_source: task === 'lesson-chat' ? ('SIGNED_CONVERSATION_STATE' as const) : ('REQUEST_LOCALE' as const) } : undefined;
    return failWithProviderDiagnostic(request, env, requestId, code, 'AI feedback is temporarily unavailable. Your lesson and saved progress are still available.', true, status, diagnosticsEnabled, diagnostic);
  }
}

export default { fetch: handleRequest };
