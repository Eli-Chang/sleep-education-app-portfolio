import { advanceConversationState, type ConversationStateClaims } from './conversation-state';

export type ConversationRecord = ConversationStateClaims & {
  reservation_id: string | null;
  reservation_started_at: number | null;
  previous_claims: ConversationStateClaims | null;
};

const STATE_KEY = 'conversation-state';
const RESERVATION_TTL_SECONDS = 60;

function sameClaims(left: ConversationStateClaims, right: ConversationStateClaims): boolean {
  return left.version === right.version
    && left.conversation_id === right.conversation_id
    && left.module_id === right.module_id
    && left.screen_id === right.screen_id
    && left.revision === right.revision
    && left.locale === right.locale
    && left.issued_at === right.issued_at;
}

export function initializeRecord(claims: ConversationStateClaims): ConversationRecord {
  return { ...claims, reservation_id: null, reservation_started_at: null, previous_claims: null };
}

export function reserveRecord(
  current: ConversationRecord,
  presented: ConversationStateClaims,
  nowSeconds = Math.floor(Date.now() / 1000),
): { ok: true; record: ConversationRecord; reservationId: string; nextClaims: ConversationStateClaims } | { ok: false; reason: string; current: ConversationRecord } {
  let active = current;
  if (active.reservation_id && active.reservation_started_at && nowSeconds - active.reservation_started_at > RESERVATION_TTL_SECONDS && active.previous_claims) active = initializeRecord(active.previous_claims);
  if (active.reservation_id) return { ok: false, reason: 'TURN_IN_PROGRESS', current: active };
  if (!sameClaims(active, presented)) return { ok: false, reason: 'STATE_REPLAY_OR_ROLLBACK', current: active };
  const reservationId = crypto.randomUUID();
  const nextClaims = advanceConversationState(active, nowSeconds);
  return {
    ok: true,
    reservationId,
    nextClaims,
    record: { ...nextClaims, reservation_id: reservationId, reservation_started_at: nowSeconds, previous_claims: presented },
  };
}

export function commitRecord(current: ConversationRecord, reservationId: string, finalClaims?: ConversationStateClaims): { ok: true; record: ConversationRecord } | { ok: false; reason: string } {
  if (!current.reservation_id || current.reservation_id !== reservationId) return { ok: false, reason: 'RESERVATION_MISMATCH' };
  if (finalClaims && !sameClaims(finalClaims, current)) return { ok: false, reason: 'FINAL_STATE_MISMATCH' };
  return { ok: true, record: initializeRecord(current) };
}

export function rollbackRecord(current: ConversationRecord, reservationId: string): { ok: true; record: ConversationRecord } | { ok: false; reason: string } {
  if (!current.reservation_id || current.reservation_id !== reservationId || !current.previous_claims) return { ok: false, reason: 'RESERVATION_MISMATCH' };
  return { ok: true, record: initializeRecord(current.previous_claims) };
}

export class ConversationStateCoordinator {
  constructor(private readonly state: DurableObjectState) {}

  async fetch(request: Request): Promise<Response> {
    const path = new URL(request.url).pathname;
    const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!payload) return Response.json({ ok: false, reason: 'INVALID_REQUEST' }, { status: 400 });
    if (path === '/initialize') {
      const claims = payload.claims as ConversationStateClaims;
      const existing = await this.state.storage.get<ConversationRecord>(STATE_KEY);
      if (existing) return Response.json({ ok: false, reason: 'ALREADY_INITIALIZED' }, { status: 409 });
      await this.state.storage.put(STATE_KEY, initializeRecord(claims));
      return Response.json({ ok: true });
    }
    const current = await this.state.storage.get<ConversationRecord>(STATE_KEY);
    if (!current) return Response.json({ ok: false, reason: 'STATE_NOT_FOUND' }, { status: 404 });
    if (path === '/reserve') {
      const reserved = reserveRecord(current, payload.claims as ConversationStateClaims);
      if (!reserved.ok) {
        if (reserved.current !== current) await this.state.storage.put(STATE_KEY, reserved.current);
        return Response.json({ ok: false, reason: reserved.reason, current: reserved.current }, { status: reserved.reason === 'TURN_IN_PROGRESS' ? 409 : 400 });
      }
      await this.state.storage.put(STATE_KEY, reserved.record);
      return Response.json({ ok: true, reservationId: reserved.reservationId, nextClaims: reserved.nextClaims });
    }
    if (path === '/commit') {
      const committed = commitRecord(current, String(payload.reservationId ?? ''), payload.finalClaims as ConversationStateClaims | undefined);
      if (!committed.ok) return Response.json(committed, { status: 409 });
      await this.state.storage.put(STATE_KEY, committed.record);
      return Response.json({ ok: true });
    }
    if (path === '/rollback') {
      const rolledBack = rollbackRecord(current, String(payload.reservationId ?? ''));
      if (!rolledBack.ok) return Response.json(rolledBack, { status: 409 });
      await this.state.storage.put(STATE_KEY, rolledBack.record);
      return Response.json({ ok: true });
    }
    return Response.json({ ok: false, reason: 'NOT_FOUND' }, { status: 404 });
  }
}

export async function coordinatorCall<T>(namespace: DurableObjectNamespace, conversationId: string, path: string, payload: Record<string, unknown>): Promise<T> {
  const stub = namespace.get(namespace.idFromName(conversationId));
  const response = await stub.fetch(`https://conversation-state.internal${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.json() as T & { ok?: boolean; reason?: string };
  if (!response.ok && body.ok !== false) throw new Error('Conversation coordinator failed.');
  return body;
}
