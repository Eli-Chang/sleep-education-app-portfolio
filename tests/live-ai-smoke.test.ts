import assert from 'node:assert/strict';
import test from 'node:test';

const enabled = process.env.RUN_LIVE_AI_SMOKE_TESTS === 'true';
const baseUrl = (process.env.EXPO_PUBLIC_AI_API_BASE_URL ?? '').replace(/\/$/, '');

async function post(path: string, body: Record<string, unknown>) {
  assert.ok(baseUrl, 'EXPO_PUBLIC_AI_API_BASE_URL must be configured for live AI smoke tests.');
  const startedAt = Date.now();
  const response = await fetch(`${baseUrl}/v1/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => undefined) as Record<string, unknown> | undefined;
  assert.equal(response.ok, true, `${path} failed safely with HTTP ${response.status} after ${Date.now() - startedAt}ms: ${JSON.stringify(payload)}`);
  assert.ok(payload && typeof payload === 'object', `${path} returned no structured JSON object.`);
  return payload;
}

test('live deployed Worker supports curriculum v3 teach-back and lesson questions', { skip: !enabled, timeout: 60_000 }, async () => {
  const teachBack = await post('teach-back', {
    activityId: 'm1-osa-teach-back',
    response: 'During obstructive sleep apnea, the airway narrows or closes during sleep, reducing airflow and repeatedly disrupting sleep.',
    locale: 'en',
    sessionId: 'session_live_smoke_teach_back',
  });
  assert.match(String(teachBack.status), /understood|partially_understood|needs_support/);

  const lessonQuestion = await post('lesson-question', {
    lessonId: 'm1-01',
    question: 'How is PAP different from oxygen therapy?',
    locale: 'en',
    sessionId: 'session_live_smoke_lesson_question',
  });
  assert.match(String(lessonQuestion.answer), /PAP|pressur/i);
});

test('live deployed Worker supports the signed lesson-chat path used by the app', { skip: !enabled, timeout: 60_000 }, async () => {
  const started = await post('conversation-start', {
    activityId: 'm1-osa-teach-back',
    lessonId: 'm1-ai1',
    locale: 'en',
    sessionId: 'session_live_smoke_lesson_chat_20260812',
  });
  assert.equal(typeof started.conversationToken, 'string');
  const lessonChat = await post('lesson-chat', {
    activityId: 'm1-osa-teach-back',
    lessonId: 'm1-ai1',
    kind: 'lesson-question',
    locale: 'en',
    sessionId: 'session_live_smoke_lesson_chat_20260812',
    conversationToken: started.conversationToken,
    messages: [{ role: 'user', content: 'Explain in one sentence why the upper airway can narrow during sleep.' }],
  });
  assert.equal(typeof lessonChat.message, 'string');
  assert.ok(String(lessonChat.message).length > 0);
  assert.doesNotMatch(String(lessonChat.message), /AI feedback is temporarily unavailable/);
  assert.equal(typeof lessonChat.conversationToken, 'string');
});
