import { z } from 'zod';

const providerReplySchema = z.object({
  reply: z.string().trim().min(1).max(1000),
  followUpQuestion: z.string().trim().min(1).max(300).nullable().optional().transform(value => value ?? undefined),
}).strict();

export type ProviderReply = { reply: string; followUpQuestion?: string };
export type ProviderJsonParseStatus = 'not_attempted' | 'parsed_object' | 'parsed_non_object' | 'invalid_json' | 'empty';
export type WorkerValidationStatus = 'not_attempted' | 'accepted' | 'rejected';
export type ProviderUsageDiagnostic = {
  prompt_tokens: number | null;
  cached_prompt_tokens: number | null;
  uncached_prompt_tokens: number | null;
  completion_tokens: number | null;
  reasoning_tokens: number | null;
  total_tokens: number | null;
  cache_hit_percentage: number | null;
};

export type PromptCacheDiagnostic = {
  stable_prefix_hash: string;
  stable_prefix_byte_length: number;
  stable_prefix_message_count: number;
  variable_context_message_index: number;
};

export type ProviderResponseDiagnostic = {
  scenario_id?: string;
  provider_request_id: string | null;
  provider_http_status: number;
  provider_model: string;
  provider_finish_reason: string | null;
  provider_content_present: boolean;
  provider_content_length: number;
  provider_content_type: string;
  provider_json_parse_status: ProviderJsonParseStatus;
  worker_validation_status: WorkerValidationStatus;
  worker_validation_error_code: string | null;
  worker_validation_error_path: string | null;
  worker_validation_error_message: string | null;
  sanitized_provider_content: string | null;
  provider_usage: ProviderUsageDiagnostic | null;
  prompt_cache: PromptCacheDiagnostic | null;
};

type DiagnosticOptions = {
  captureContent?: boolean;
  providerRequestId?: string | null;
  providerHttpStatus?: number;
  providerModel?: string;
  providerFinishReason?: string | null;
  providerUsage?: ProviderUsageDiagnostic | null;
  promptCache?: PromptCacheDiagnostic | null;
  sensitiveValues?: string[];
};

export type ProviderParseResult =
  | { ok: true; candidate: ProviderReply; diagnostic: ProviderResponseDiagnostic }
  | { ok: false; diagnostic: ProviderResponseDiagnostic };

const MAX_CAPTURED_CONTENT_CHARS = 4_000;

function contentType(value: unknown): string {
  if (value === undefined) return 'missing';
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function sanitizeProviderContent(value: string, sensitiveValues: string[] = []): string {
  let sanitized = value;
  for (const secret of sensitiveValues.filter(candidate => candidate.length >= 8)) {
    sanitized = sanitized.replace(new RegExp(escapeRegExp(secret), 'g'), '[REDACTED_SECRET]');
  }
  return sanitized
    .replace(/(?:^|[\s,{])(?:ENV|ENVIRONMENT)\s*[=:]\s*\{[^}\r\n]{0,2000}\}/gi, ' [REDACTED_ENV]')
    .replace(/\b(?:Bearer|Basic)\s+[^\s"'\\]+/gi, 'Bearer [REDACTED]')
    .replace(/\bgsk_[A-Za-z0-9_-]{12,}\b/gi, '[REDACTED_GROQ_TOKEN]')
    .replace(/(?:CLOUDFLARE_API_TOKEN|CF_API_TOKEN)\s*[=:]\s*(?:\\?["']?)[^\\\r\n,;}"']+/gi, '[REDACTED_CLOUDFLARE_TOKEN]')
    .replace(/(?:\\?["']?)\b(?:authorization|groq[_-]?api[_-]?key|evaluation[_-]?(?:diagnostics[_-]?)?token|cloudflare[_-]?api[_-]?token|cf[_-]?api[_-]?token|api[_-]?key|secret|access[_-]?token)(?:\\?["']?)\s*[:=]\s*(?:\\?["']?)[^\\\r\n,;}"']+/gi, '[REDACTED_KEY]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]')
    .replace(/(?:\+?\d[\d().\s-]{7,}\d)/g, '[REDACTED_PHONE]')
    .slice(0, MAX_CAPTURED_CONTENT_CHARS);
}

function baseDiagnostic(content: unknown, options: DiagnosticOptions): ProviderResponseDiagnostic {
  const isNonEmptyString = typeof content === 'string' && content.length > 0;
  return {
    provider_request_id: options.providerRequestId ?? null,
    provider_http_status: options.providerHttpStatus ?? 0,
    provider_model: options.providerModel ?? 'unknown',
    provider_finish_reason: options.providerFinishReason ?? null,
    provider_content_present: isNonEmptyString,
    provider_content_length: typeof content === 'string' ? content.length : 0,
    provider_content_type: contentType(content),
    provider_json_parse_status: 'not_attempted',
    worker_validation_status: 'not_attempted',
    worker_validation_error_code: null,
    worker_validation_error_path: null,
    worker_validation_error_message: null,
    sanitized_provider_content: options.captureContent && typeof content === 'string' ? sanitizeProviderContent(content, options.sensitiveValues) : null,
    provider_usage: options.providerUsage ?? null,
    prompt_cache: options.promptCache ?? null,
  };
}

function finiteNonNegativeInteger(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : null;
}

export function providerUsageFromEnvelope(payload: unknown): ProviderUsageDiagnostic | null {
  const record = payload && typeof payload === 'object' && !Array.isArray(payload) ? payload as { usage?: unknown } : {};
  const usage = record.usage && typeof record.usage === 'object' && !Array.isArray(record.usage) ? record.usage as Record<string, unknown> : null;
  if (!usage) return null;
  const promptDetails = usage.prompt_tokens_details && typeof usage.prompt_tokens_details === 'object' && !Array.isArray(usage.prompt_tokens_details)
    ? usage.prompt_tokens_details as Record<string, unknown> : {};
  const completionDetails = usage.completion_tokens_details && typeof usage.completion_tokens_details === 'object' && !Array.isArray(usage.completion_tokens_details)
    ? usage.completion_tokens_details as Record<string, unknown> : {};
  const promptTokens = finiteNonNegativeInteger(usage.prompt_tokens);
  const cachedPromptTokens = finiteNonNegativeInteger(promptDetails.cached_tokens);
  const uncachedPromptTokens = promptTokens === null || cachedPromptTokens === null ? null : Math.max(0, promptTokens - cachedPromptTokens);
  const completionTokens = finiteNonNegativeInteger(usage.completion_tokens);
  const reasoningTokens = finiteNonNegativeInteger(completionDetails.reasoning_tokens);
  const totalTokens = finiteNonNegativeInteger(usage.total_tokens);
  const cacheHitPercentage = promptTokens && cachedPromptTokens !== null
    ? Number((cachedPromptTokens / promptTokens * 100).toFixed(2)) : promptTokens === 0 ? 0 : null;
  return { prompt_tokens: promptTokens, cached_prompt_tokens: cachedPromptTokens, uncached_prompt_tokens: uncachedPromptTokens, completion_tokens: completionTokens, reasoning_tokens: reasoningTokens, total_tokens: totalTokens, cache_hit_percentage: cacheHitPercentage };
}

function rejected(diagnostic: ProviderResponseDiagnostic, code: string, path: string, message: string): ProviderParseResult {
  return {
    ok: false,
    diagnostic: {
      ...diagnostic,
      worker_validation_status: 'rejected',
      worker_validation_error_code: code,
      worker_validation_error_path: path,
      worker_validation_error_message: message,
    },
  };
}

export function parseProviderContent(content: unknown, options: DiagnosticOptions = {}): ProviderParseResult {
  const diagnostic = baseDiagnostic(content, options);
  if (typeof content !== 'string' || content.trim().length === 0) {
    return rejected({ ...diagnostic, provider_json_parse_status: 'empty' }, 'PROVIDER_CONTENT_EMPTY', 'choices[0].message.content', 'Provider message content is empty.');
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return rejected({ ...diagnostic, provider_json_parse_status: 'invalid_json' }, 'PROVIDER_INVALID_JSON', 'choices[0].message.content', 'Provider message content is not valid JSON.');
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return rejected({ ...diagnostic, provider_json_parse_status: 'parsed_non_object' }, 'PROVIDER_JSON_NOT_OBJECT', 'choices[0].message.content', 'Provider JSON value must be an object.');
  }
  const validated = providerReplySchema.safeParse(parsed);
  if (!validated.success) {
    const issue = validated.error.issues[0];
    const path = issue?.path.length ? issue.path.join('.') : '$';
    return rejected({ ...diagnostic, provider_json_parse_status: 'parsed_object' }, 'PROVIDER_RESPONSE_SCHEMA', path, issue?.message ?? 'Provider object does not match the reply contract.');
  }
  return {
    ok: true,
    candidate: { reply: validated.data.reply, ...(validated.data.followUpQuestion ? { followUpQuestion: validated.data.followUpQuestion } : {}) },
    diagnostic: { ...diagnostic, provider_json_parse_status: 'parsed_object', worker_validation_status: 'accepted' },
  };
}

export function parseProviderEnvelope(payload: unknown, options: DiagnosticOptions = {}): ProviderParseResult {
  const record = payload && typeof payload === 'object' && !Array.isArray(payload) ? payload as { choices?: unknown } : {};
  const choices = Array.isArray(record.choices) ? record.choices : [];
  const first = choices[0] && typeof choices[0] === 'object' && !Array.isArray(choices[0]) ? choices[0] as { message?: unknown; finish_reason?: unknown } : {};
  const message = first.message && typeof first.message === 'object' && !Array.isArray(first.message) ? first.message as { content?: unknown } : {};
  const finishReason = typeof first.finish_reason === 'string' ? first.finish_reason : null;
  const content = message.content;
  if (content === undefined) {
    const diagnostic = baseDiagnostic(undefined, { ...options, providerFinishReason: finishReason, providerUsage: options.providerUsage ?? providerUsageFromEnvelope(payload) });
    return rejected(diagnostic, 'PROVIDER_CONTENT_MISSING', 'choices[0].message.content', 'Provider response does not contain choices[0].message.content.');
  }
  return parseProviderContent(content, { ...options, providerFinishReason: finishReason, providerUsage: options.providerUsage ?? providerUsageFromEnvelope(payload) });
}

export function withWorkerValidation(diagnostic: ProviderResponseDiagnostic, code: string, path: string, message: string): ProviderResponseDiagnostic {
  return { ...diagnostic, worker_validation_status: 'rejected', worker_validation_error_code: code, worker_validation_error_path: path, worker_validation_error_message: message };
}

export function withProviderEnvelopeFailure(options: DiagnosticOptions = {}): ProviderResponseDiagnostic {
  return {
    ...baseDiagnostic(undefined, options),
    provider_json_parse_status: 'invalid_json',
    worker_validation_status: 'rejected',
    worker_validation_error_code: 'PROVIDER_ENVELOPE_INVALID_JSON',
    worker_validation_error_path: 'response',
    worker_validation_error_message: 'Provider HTTP response body is not valid JSON.',
  };
}

export function withProviderHttpFailure(content: string, options: DiagnosticOptions = {}): ProviderResponseDiagnostic {
  return {
    ...baseDiagnostic(content, options),
    provider_json_parse_status: 'not_attempted',
    worker_validation_status: 'rejected',
    worker_validation_error_code: 'PROVIDER_HTTP_ERROR',
    worker_validation_error_path: 'response',
    worker_validation_error_message: `Provider returned HTTP ${options.providerHttpStatus ?? 0}.`,
  };
}
