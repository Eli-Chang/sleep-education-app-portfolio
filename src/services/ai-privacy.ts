export function createEphemeralSessionId(): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  return uuid ? `session_${uuid}` : `session_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

export async function checkAiHealth(baseUrl: string, consent: boolean, timeoutMs = 5_000) {
  if (!consent) return { ok: false, status: 'consent_required' as const };
  if (!baseUrl) return { ok: false, status: 'not_configured' as const };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/health`, { signal: controller.signal });
    return { ok: response.ok, status: response.ok ? 'available' as const : 'unavailable' as const };
  } catch {
    return { ok: false, status: 'unavailable' as const };
  } finally {
    clearTimeout(timer);
  }
}
