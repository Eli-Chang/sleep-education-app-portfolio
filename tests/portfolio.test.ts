import { strict as assert } from 'node:assert';
import test from 'node:test';
import { englishModules, spanishModules, validateBilingualContent, emptyProgress, completeScreen, completionPercent, restoreProgress, serializeProgress, nextScreenId, evaluateKnowledgeCheck, createNarrationCue, requestTeachBack } from '../src/index.js';

test('English and Spanish synthetic content preserve screen identity', () => {
  assert.deepEqual(validateBilingualContent(englishModules, spanishModules), []);
  assert.equal(englishModules.every((module) => module.synthetic), true);
  assert.equal(spanishModules.every((module) => module.synthetic), true);
});

test('content validation rejects ID mismatch, missing notice, and invalid checks', () => {
  const mismatchedModule = spanishModules.map((module) => ({ ...module, id: 'different-module' }));
  assert.equal(validateBilingualContent(englishModules, mismatchedModule).some((error) => error.includes('Module IDs')), true);
  const mismatchedSpanish = spanishModules.map((module) => ({ ...module, screens: module.screens.map((screen, index) => index === 0 ? { ...screen, id: 'different-id' } : screen) }));
  assert.equal(validateBilingualContent(englishModules, mismatchedSpanish).some((error) => error.includes('IDs')), true);
  const missingNotice = englishModules.map((module) => ({ ...module, screens: module.screens.map((screen, index) => index === 0 ? { ...screen, paragraphs: ['Synthetic copy.'] } : screen) }));
  assert.equal(validateBilingualContent(missingNotice, spanishModules).some((error) => error.includes('demonstration notice')), true);
  const invalidCheck = englishModules.map((module) => ({ ...module, screens: module.screens.map((screen) => screen.type === 'singleChoice' ? { ...screen, correctChoiceId: 'missing' } : screen) }));
  assert.equal(validateBilingualContent(invalidCheck, spanishModules).some((error) => error.includes('invalid knowledge check')), true);
});

test('navigation, progress, serialization, and restoration are deterministic', () => {
  const initial = emptyProgress();
  const next = completeScreen(initial, 'portfolio-demo-01-s01', 'portfolio-demo-01', 'portfolio-demo-01-s02', false);
  assert.equal(nextScreenId(englishModules[0], 'portfolio-demo-01-s01'), 'portfolio-demo-01-s02');
  assert.equal(nextScreenId(englishModules[0], 'portfolio-demo-01-s03'), null);
  assert.deepEqual(initial.completedScreenIds, []);
  assert.equal(completionPercent(next, ['portfolio-demo-01-s01', 'portfolio-demo-01-s02', 'portfolio-demo-01-s03']), 33);
  const restored = restoreProgress(serializeProgress(next));
  assert.deepEqual(restored, next);
  assert.deepEqual(restoreProgress('not-json'), emptyProgress());
});

test('narration cue uses the requested locale and screen text', () => {
  const cue = createNarrationCue(englishModules[0].screens[0], 'en');
  assert.equal(cue.locale, 'en');
  assert.match(cue.text, /Demonstration content/);
});

test('knowledge checks return a local demonstration result', () => {
  const screen = englishModules[0].screens[1];
  assert.equal(evaluateKnowledgeCheck(screen, 'a').kind, 'correct');
  assert.equal(evaluateKnowledgeCheck(screen, 'b').kind, 'try_again');
});

test('AI boundary does not invoke a request before consent', async () => {
  let calls = 0;
  const request = async () => { calls += 1; return { message: 'Synthetic feedback.' }; };
  const result = await requestTeachBack(false, 'I will try one small action.', request);
  assert.deepEqual(result, { kind: 'consent_required' });
  assert.equal(calls, 0);
});

test('AI boundary delegates only after consent and returns an offline-safe fallback', async () => {
  let calls = 0;
  const request = async (endpoint: string, body: Record<string, unknown>) => { calls += 1; assert.equal(endpoint, '/v1/teach-back'); assert.equal(body.learnerText, 'A plan.'); return { message: 'Synthetic feedback.' }; };
  assert.deepEqual(await requestTeachBack(true, ' A plan. ', request), { kind: 'success', message: 'Synthetic feedback.' });
  assert.equal(calls, 1);
  const failed = await requestTeachBack(true, 'A plan.', async () => { throw new Error('offline'); });
  assert.deepEqual(failed, { kind: 'unavailable', message: 'Feedback is unavailable; the lesson remains available.' });
});

test('AI boundary rejects empty and oversized input without a request', async () => {
  let calls = 0;
  const request = async () => { calls += 1; return { message: 'Should not run.' }; };
  assert.equal((await requestTeachBack(true, '   ', request)).kind, 'unavailable');
  assert.equal((await requestTeachBack(true, 'x'.repeat(501), request)).kind, 'unavailable');
  assert.equal(calls, 0);
});
