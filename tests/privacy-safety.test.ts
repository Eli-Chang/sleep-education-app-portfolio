import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { checkAiHealth, createEphemeralSessionId } from '../src/services/ai-privacy';
import { containsLikelyIdentifier } from '../src/services/privacy';

test('obvious identifier checks are supplementary and block common patterns', () => {
  assert.equal(containsLikelyIdentifier('synthetic@example.com'), true);
  assert.equal(containsLikelyIdentifier('Call 555-010-1234'), true);
  assert.equal(containsLikelyIdentifier('Record 123456'), true);
  assert.equal(containsLikelyIdentifier('The airway narrows during sleep.'), false);
});

test('health check is consent-gated before any network call', async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (async () => { calls += 1; return new Response('{}'); }) as typeof fetch;
  try {
    assert.deepEqual(await checkAiHealth('https://worker.test', false), { ok: false, status: 'consent_required' });
    assert.equal(calls, 0);
  } finally { globalThis.fetch = originalFetch; }
});

test('session identifiers are ephemeral and do not encode lesson IDs', () => {
  const first = createEphemeralSessionId();
  const second = createEphemeralSessionId();
  assert.match(first, /^session_/);
  assert.notEqual(first, second);
  assert.equal(first.includes('lesson'), false);
});
