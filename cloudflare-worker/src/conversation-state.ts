export type ConversationLocale = 'en' | 'es';

export type ConversationStateClaims = {
  version: 1;
  conversation_id: string;
  module_id: string;
  screen_id: string;
  revision: number;
  locale: ConversationLocale;
  issued_at: number;
};

export type ConversationBinding = Pick<ConversationStateClaims, 'module_id' | 'screen_id' | 'locale'>;
export type ConversationScreenBinding = Pick<ConversationStateClaims, 'module_id' | 'screen_id'>;

const encoder = new TextEncoder();
const TOKEN_VERSION = 1;
const MAX_TOKEN_AGE_SECONDS = 24 * 60 * 60;

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

async function signingKey(secret: string): Promise<CryptoKey> {
  if (secret.length < 32) throw new Error('CONVERSATION_STATE_SIGNING_SECRET must contain at least 32 characters.');
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

function validClaims(value: unknown): value is ConversationStateClaims {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const claims = value as Partial<ConversationStateClaims>;
  return claims.version === TOKEN_VERSION
    && typeof claims.conversation_id === 'string' && /^[0-9a-f-]{36}$/i.test(claims.conversation_id)
    && typeof claims.module_id === 'string' && /^m[1-7]$/.test(claims.module_id)
    && typeof claims.screen_id === 'string' && /^m[1-7]-[A-Za-z0-9-]+$/.test(claims.screen_id)
    && Number.isSafeInteger(claims.revision) && Number(claims.revision) >= 0
    && (claims.locale === 'en' || claims.locale === 'es')
    && Number.isInteger(claims.issued_at) && Number(claims.issued_at) > 0;
}

export function createConversationState(binding: ConversationBinding, nowSeconds = Math.floor(Date.now() / 1000)): ConversationStateClaims {
  return {
    version: TOKEN_VERSION,
    conversation_id: crypto.randomUUID(),
    ...binding,
    revision: 0,
    issued_at: nowSeconds,
  };
}

export async function issueConversationToken(claims: ConversationStateClaims, secret: string): Promise<string> {
  if (!validClaims(claims)) throw new Error('Cannot sign invalid conversation state.');
  const payload = base64UrlEncode(encoder.encode(JSON.stringify(claims)));
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', await signingKey(secret), encoder.encode(payload)));
  return `${payload}.${base64UrlEncode(signature)}`;
}

async function verifySignedClaims(
  token: string,
  secret: string,
  nowSeconds: number,
): Promise<{ ok: true; claims: ConversationStateClaims } | { ok: false; reason: string }> {
  try {
    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra) return { ok: false, reason: 'TOKEN_FORMAT' };
    const signatureBytes = base64UrlDecode(signature);
    const validSignature = await crypto.subtle.verify('HMAC', await signingKey(secret), signatureBytes.buffer as ArrayBuffer, encoder.encode(payload));
    if (!validSignature) return { ok: false, reason: 'TOKEN_SIGNATURE' };
    const claims = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload))) as unknown;
    if (!validClaims(claims)) return { ok: false, reason: 'TOKEN_CLAIMS' };
    if (claims.issued_at > nowSeconds + 60 || nowSeconds - claims.issued_at > MAX_TOKEN_AGE_SECONDS) return { ok: false, reason: 'TOKEN_AGE' };
    return { ok: true, claims };
  } catch {
    return { ok: false, reason: 'TOKEN_INVALID' };
  }
}

export async function verifyConversationToken(
  token: string,
  secret: string,
  binding: ConversationBinding,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<{ ok: true; claims: ConversationStateClaims } | { ok: false; reason: string }> {
  const verified = await verifySignedClaims(token, secret, nowSeconds);
  if (!verified.ok) return verified;
  if (verified.claims.module_id !== binding.module_id || verified.claims.screen_id !== binding.screen_id || verified.claims.locale !== binding.locale) return { ok: false, reason: 'TOKEN_BINDING' };
  return verified;
}

/**
 * Verify follow-up authorization without allowing the mutable request locale
 * to become authoritative. The signed claims remain the only locale source.
 */
export async function verifyConversationTokenForScreen(
  token: string,
  secret: string,
  binding: ConversationScreenBinding,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<{ ok: true; claims: ConversationStateClaims } | { ok: false; reason: string }> {
  const verified = await verifySignedClaims(token, secret, nowSeconds);
  if (!verified.ok) return verified;
  if (verified.claims.module_id !== binding.module_id || verified.claims.screen_id !== binding.screen_id) return { ok: false, reason: 'TOKEN_BINDING' };
  return verified;
}

/** Rotate the signed replay revision after a successful reservation. */
export function advanceConversationState(claims: ConversationStateClaims, nowSeconds = Math.floor(Date.now() / 1000)): ConversationStateClaims {
  return { ...claims, revision: claims.revision + 1, issued_at: nowSeconds };
}
