import NetInfo from '@react-native-community/netinfo';
import { checkAiHealth as checkConfiguredAiHealth } from './ai-privacy';
import { MAX_REQUEST_BYTES } from '../../shared/conversation-policy';

export { createEphemeralSessionId } from './ai-privacy';

export type AiEndpoint = 'conversation-start' | 'lesson-chat';
export type SafeAiErrorCode =
  | 'INVALID_REQUEST' | 'CONSENT_REQUIRED' | 'AI_UNAVAILABLE' | 'RATE_LIMITED'
  | 'UPSTREAM_RATE_LIMITED' | 'OUTSIDE_SCOPE' | 'TIMEOUT' | 'CONFIGURATION_ERROR';

export class SafeAiError extends Error {
  constructor(public code: SafeAiErrorCode, message: string, public retryable = false) {
    super(message);
  }
}

export const aiConfig = {
  enabled: process.env.EXPO_PUBLIC_AI_FEATURES_ENABLED === 'true',
  baseUrl: (process.env.EXPO_PUBLIC_AI_API_BASE_URL ?? '').replace(/\/$/, ''),
};

export const MAX_AI_REQUEST_BYTES = MAX_REQUEST_BYTES;
const safeFallback = 'AI feedback is temporarily unavailable. Your lesson and saved progress are still available.';

export async function callAi<T>(endpoint: AiEndpoint, body: Record<string, unknown>, consent: boolean, timeoutMs = 12_000, externalSignal?: AbortSignal): Promise<T> {
  if (!aiConfig.enabled) throw new SafeAiError('AI_UNAVAILABLE', 'AI features are disabled.');
  if (!consent) throw new SafeAiError('CONSENT_REQUIRED', 'Consent is required before using cloud AI.');
  if (!aiConfig.baseUrl) throw new SafeAiError('CONFIGURATION_ERROR', 'The AI backend URL is not configured.');
  const serialized = JSON.stringify(body);
  if (new TextEncoder().encode(serialized).byteLength > MAX_AI_REQUEST_BYTES) {
    throw new SafeAiError('INVALID_REQUEST', 'This message is too large to send.');
  }
  const network = await NetInfo.fetch();
  if (network.isConnected === false) throw new SafeAiError('AI_UNAVAILABLE', safeFallback, true);
  const controller = new AbortController();
  const abortExternal = () => controller.abort();
  externalSignal?.addEventListener('abort', abortExternal, { once: true });
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${aiConfig.baseUrl}/v1/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const json = await response.json().catch(() => undefined) as { error?: { code?: SafeAiErrorCode; message?: string; retryable?: boolean } } | undefined;
    if (!response.ok) {
      const error = json?.error;
      const safeMessage = response.status === 404 || error?.message === 'Route not found.' ? safeFallback : (error?.message ?? safeFallback);
      throw new SafeAiError(error?.code ?? 'AI_UNAVAILABLE', safeMessage, Boolean(error?.retryable));
    }
    if (!json || typeof json !== 'object') throw new SafeAiError('AI_UNAVAILABLE', safeFallback, true);
    return json as T;
  } catch (error) {
    if (error instanceof SafeAiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') throw new SafeAiError('TIMEOUT', safeFallback, true);
    throw new SafeAiError('AI_UNAVAILABLE', safeFallback, true);
  } finally {
    clearTimeout(timer);
    externalSignal?.removeEventListener('abort', abortExternal);
  }
}

export async function checkAiHealth(consent = false, timeoutMs = 5_000) {
  return checkConfiguredAiHealth(aiConfig.baseUrl, consent, timeoutMs);
}
