import { describe, expect, it } from 'vitest';
import { advanceConversationState, createConversationState, issueConversationToken, verifyConversationToken, type ConversationStateClaims } from '../src/conversation-state';
import { commitRecord, initializeRecord, reserveRecord } from '../src/conversation-coordinator';

const fixtureSigningValue = 'fixture-value-aaaaaaaaaaaaaaaaaaaa';
const binding = { module_id: 'm1', screen_id: 'm1-ai1', locale: 'en' as const };

describe('server-authenticated conversation state', () => {
  it('accepts a valid bound token and rejects payload, signature, module, screen, and locale tampering', async () => {
    const claims = createConversationState(binding, 1_800_000_000);
    const token = await issueConversationToken(claims, fixtureSigningValue);
    await expect(verifyConversationToken(token, fixtureSigningValue, binding, 1_800_000_001)).resolves.toEqual({ ok: true, claims });

    const [payload, signature] = token.split('.');
    const decoded = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(payload.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)))) as ConversationStateClaims;
    for (const mutation of [
      { ...decoded, revision: decoded.revision + 1 },
      { ...decoded, module_id: 'm2' },
      { ...decoded, locale: 'es' },
    ]) {
      const forgedPayload = btoa(JSON.stringify(mutation)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
      expect((await verifyConversationToken(`${forgedPayload}.${signature}`, fixtureSigningValue, binding, 1_800_000_001)).ok).toBe(false);
    }
    const forgedSignatureFirstCharacter = signature.startsWith('a') ? 'b' : 'a';
    expect((await verifyConversationToken(`${payload}.${forgedSignatureFirstCharacter}${signature.slice(1)}`, fixtureSigningValue, binding, 1_800_000_001)).ok).toBe(false);
    expect((await verifyConversationToken(token, fixtureSigningValue, { ...binding, screen_id: 'm1-ai2' }, 1_800_000_001)).ok).toBe(false);
  });

  it('authorizes ongoing accepted turns and rejects replay of an older revision', () => {
    let claims = createConversationState(binding, 1_800_000_000);
    let record = initializeRecord(claims);
    const original = claims;
    for (let turn = 1; turn <= 13; turn += 1) {
      const reserved = reserveRecord(record, claims, 1_800_000_000 + turn);
      expect(reserved.ok).toBe(true);
      if (!reserved.ok) throw new Error('reservation unexpectedly failed');
      const committed = commitRecord(reserved.record, reserved.reservationId);
      expect(committed.ok).toBe(true);
      if (!committed.ok) throw new Error('commit unexpectedly failed');
      record = committed.record;
      claims = reserved.nextClaims;
      expect(claims.revision).toBe(turn);
    }
    expect(reserveRecord(record, original, 1_800_000_010)).toMatchObject({ ok: false, reason: 'STATE_REPLAY_OR_ROLLBACK' });
    expect(reserveRecord(record, claims, 1_800_000_014).ok).toBe(true);
  });

  it('advances only the signed replay revision and never auto-completes', () => {
    const claims = createConversationState(binding, 1_800_000_000);
    expect(advanceConversationState(claims, 1_800_000_001)).toMatchObject({ revision: 1, issued_at: 1_800_000_001 });
    expect(advanceConversationState({ ...claims, revision: 99 }, 1_800_000_003)).toMatchObject({ revision: 100, issued_at: 1_800_000_003 });
  });
});
