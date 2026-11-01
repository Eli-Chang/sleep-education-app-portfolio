import { expect, test, type Page } from '@playwright/test';
import { englishModules } from '../../src/content/en';
import { spanishModules } from '../../src/content/es';
import type { LessonScreen } from '../../src/types/content';

// These tests replace the browser speech engine with a recording stand-in so the app's narration logic
// (voice choice, chunking, stop/replay, cancellation) can be checked deterministically. They prove what the
// app asks the engine to say; they do not prove audible playback. Real-engine checks are recorded separately.
const STORAGE_KEY = 'sleep_education_state_v3';
// Every curriculum screen carries explicit narration text, which is what the app sends to the engine.
const narrationText = (screen: LessonScreen) => { if (!screen.narrationText) throw new Error(`${screen.id} has no narrationText`); return screen.narrationText; };
type Call = { kind: 'speak' | 'cancel'; at: number; text?: string; lang?: string; voice?: string };

async function installSpeech(page: Page, voices: { name: string; lang: string }[], options: { neverListVoices?: boolean } = {}) {
  await page.addInitScript(([voiceList, neverList]) => {
    const calls: Call[] = [];
    let queue: SpeechSynthesisUtterance[] = [];
    let current: SpeechSynthesisUtterance | undefined;
    const fakeVoices = (voiceList as { name: string; lang: string }[]).map((voice) => ({ ...voice, voiceURI: voice.name, localService: true, default: false }));
    const next = () => {
      current = queue.shift();
      if (!current) return;
      const utterance = current;
      setTimeout(() => {
        if (current !== utterance) return;
        utterance.onstart?.(new Event('start') as SpeechSynthesisEvent);
        setTimeout(() => {
          if (current !== utterance) return;
          utterance.onend?.(new Event('end') as SpeechSynthesisEvent);
          next();
        }, Math.max(150, utterance.text.length * 4));
      }, 20);
    };
    const engine = {
      get speaking() { return Boolean(current); },
      get pending() { return queue.length > 0; },
      paused: false,
      onvoiceschanged: null as null | (() => void),
      getVoices: () => (neverList ? [] : fakeVoices),
      speak: (utterance: SpeechSynthesisUtterance) => {
        calls.push({ kind: 'speak', at: performance.now(), text: utterance.text, lang: utterance.lang, voice: (utterance.voice as { name?: string } | null)?.name });
        queue.push(utterance);
        if (!current) next();
      },
      cancel: () => { calls.push({ kind: 'cancel', at: performance.now() }); queue = []; current = undefined; },
      pause: () => undefined,
      resume: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    };
    class RecordingUtterance {
      text = ''; lang = ''; voice: unknown = null; rate = 1; pitch = 1; volume = 1;
      onstart: ((event: Event) => void) | null = null; onend: ((event: Event) => void) | null = null;
      onerror: ((event: Event) => void) | null = null; onpause: ((event: Event) => void) | null = null;
      onresume: ((event: Event) => void) | null = null; onmark: ((event: Event) => void) | null = null;
      onboundary: ((event: Event) => void) | null = null;
      constructor(text?: string) { if (text) this.text = text; }
    }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: RecordingUtterance });
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: engine });
    (window as unknown as { __speech: { calls: Call[]; active: () => string[] } }).__speech = {
      calls,
      active: () => [current, ...queue].filter(Boolean).map((u) => (u as SpeechSynthesisUtterance).text),
    };
  }, [voices, Boolean(options.neverListVoices)] as const);
}

async function seed(page: Page, state: Record<string, unknown>) {
  await page.addInitScript(([key, value]) => {
    if (!sessionStorage.getItem('seeded')) { localStorage.setItem(key, value); sessionStorage.setItem('seeded', '1'); }
  }, [STORAGE_KEY, JSON.stringify(state)] as const);
}

const calls = (page: Page) => page.evaluate(() => (window as unknown as { __speech: { calls: Call[] } }).__speech.calls);
const spokenSince = async (page: Page, from = 0) => (await calls(page)).filter((call) => call.kind === 'speak' && call.at >= from);
const now = (page: Page) => page.evaluate(() => performance.now());
const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
const ENGLISH = [{ name: 'Test English (United States)', lang: 'en-US' }];
const BOTH = [...ENGLISH, { name: 'Test Español (Estados Unidos)', lang: 'es-US' }];
const screenOf = (modules: typeof englishModules, moduleId: string, screenId: string) =>
  modules.find((module) => module.id === moduleId)!.screens.find((screen) => screen.id === screenId)!;

test('narration is off by default and the Listen control is disabled', async ({ page }) => {
  await installSpeech(page, BOTH);
  await page.goto('/lesson/m6/m6-01');
  const listen = page.getByRole('button', { name: 'Listen', exact: true }).filter({ visible: true }).first();
  await expect(listen).toBeVisible();
  await expect(listen).toBeDisabled();
  expect(await spokenSince(page)).toEqual([]);
});

test('English narration reads the whole screen in order with an English voice, then stops and replays', async ({ page }) => {
  await installSpeech(page, BOTH);
  await seed(page, { narrationEnabled: true, language: 'en' });
  const longest = englishModules.flatMap((module) => module.screens.map((screen) => ({ module, screen })))
    .sort((a, b) => narrationText(b.screen).length - narrationText(a.screen).length)[0];
  await page.goto(`/lesson/${longest.module.id}/${longest.screen.id}`);
  await page.getByRole('button', { name: 'Listen', exact: true }).filter({ visible: true }).first().click();
  await expect(page.getByRole('button', { name: 'Stop', exact: true }).filter({ visible: true }).first()).toBeVisible();
  const spoken = await spokenSince(page);
  expect(spoken.length).toBeGreaterThan(1); // long passages are split into ordered chunks
  expect(new Set(spoken.map((call) => call.lang))).toEqual(new Set(['en-US']));
  expect(new Set(spoken.map((call) => call.voice))).toEqual(new Set([ENGLISH[0].name]));
  expect(normalize(spoken.map((call) => call.text).join(' '))).toBe(normalize(narrationText(longest.screen)));

  await page.getByRole('button', { name: 'Stop', exact: true }).filter({ visible: true }).first().click();
  await expect(page.getByRole('button', { name: 'Replay', exact: true }).filter({ visible: true }).first()).toBeVisible();
  expect((await calls(page)).at(-1)?.kind).toBe('cancel');
  expect(await page.evaluate(() => (window as unknown as { __speech: { active: () => string[] } }).__speech.active())).toEqual([]);

  const beforeReplay = await now(page);
  await page.getByRole('button', { name: 'Replay', exact: true }).filter({ visible: true }).first().click();
  await expect(page.getByRole('button', { name: 'Stop', exact: true }).filter({ visible: true }).first()).toBeVisible();
  expect(normalize((await spokenSince(page, beforeReplay)).map((call) => call.text).join(' '))).toBe(normalize(narrationText(longest.screen)));
});

test('a short screen returns to Replay when the engine finishes', async ({ page }) => {
  await installSpeech(page, BOTH);
  await seed(page, { narrationEnabled: true, language: 'en' });
  await page.goto('/lesson/m1/m1-01');
  await page.getByRole('button', { name: 'Listen', exact: true }).filter({ visible: true }).first().click();
  await expect(page.getByRole('button', { name: 'Replay', exact: true }).filter({ visible: true }).first()).toBeVisible({ timeout: 15_000 });
});

test('Spanish narration uses a Spanish voice and never reads the answer explanation before an answer', async ({ page }) => {
  await installSpeech(page, BOTH);
  await seed(page, { narrationEnabled: true, language: 'es' });
  const question = screenOf(spanishModules, 'm4', 'm4-q3');
  await page.goto('/lesson/m4/m4-q3');
  await page.getByRole('button', { name: 'Escuchar', exact: true }).filter({ visible: true }).first().click();
  await expect(page.getByRole('button', { name: 'Detener', exact: true }).filter({ visible: true }).first()).toBeVisible();
  const spoken = await spokenSince(page);
  expect(new Set(spoken.map((call) => call.lang))).toEqual(new Set(['es-US']));
  expect(new Set(spoken.map((call) => call.voice))).toEqual(new Set(['Test Español (Estados Unidos)']));
  const text = normalize(spoken.map((call) => call.text).join(' '));
  expect(question.type === 'singleChoice' && text.startsWith(normalize(question.prompt))).toBe(true);
  const explanation = question.type === 'singleChoice' ? question.questionFeedback?.generalExplanation ?? '' : '';
  expect(explanation.length).toBeGreaterThan(10);
  expect(text.includes(normalize(explanation))).toBe(false);
});

test('moving to another screen stops narration and the old screen is not spoken again', async ({ page }) => {
  await installSpeech(page, BOTH);
  await seed(page, { narrationEnabled: true, language: 'en' });
  const first = screenOf(englishModules, 'm6', 'm6-01');
  await page.goto('/lesson/m6/m6-01');
  await page.getByRole('button', { name: 'Listen', exact: true }).filter({ visible: true }).first().click();
  await expect(page.getByRole('button', { name: 'Stop', exact: true }).filter({ visible: true }).first()).toBeVisible();
  await page.waitForTimeout(400);
  const leftAt = await now(page);
  await page.getByRole('button', { name: 'Next', exact: true }).filter({ visible: true }).first().click();
  await expect(page).toHaveURL(/m6-02/);
  await page.waitForTimeout(1500);
  const after = await calls(page);
  expect(after.some((call) => call.kind === 'cancel' && call.at >= leftAt)).toBe(true);
  expect(after.filter((call) => call.kind === 'speak' && call.at >= leftAt)).toEqual([]);
  expect(await page.evaluate(() => (window as unknown as { __speech: { active: () => string[] } }).__speech.active())).toEqual([]);
  expect(narrationText(first).length).toBeGreaterThan(0);
});

const activeSpeech = (page: Page) => page.evaluate(() => (window as unknown as { __speech: { active: () => string[] } }).__speech.active());

test('leaving a lesson stops narration', async ({ page }) => {
  await installSpeech(page, BOTH);
  await seed(page, { narrationEnabled: true, language: 'en' });
  await page.goto('/lesson/m6/m6-05');
  await page.getByRole('button', { name: 'Listen', exact: true }).filter({ visible: true }).first().click();
  await expect(page.getByRole('button', { name: 'Stop', exact: true }).filter({ visible: true }).first()).toBeVisible();
  const leftAt = await now(page);
  await page.getByRole('button', { name: /^Back to Module/ }).filter({ visible: true }).first().click();
  await expect(page).toHaveURL(/\/module\/m6$/);
  await page.waitForTimeout(800);
  expect((await calls(page)).some((call) => call.kind === 'cancel' && call.at >= leftAt)).toBe(true);
  expect(await activeSpeech(page)).toEqual([]);
});

test('completing a module while narration plays leaves nothing playing', async ({ page }) => {
  await installSpeech(page, BOTH);
  await seed(page, { narrationEnabled: true, language: 'en' });
  const last = englishModules.find((module) => module.id === 'm6')!.screens.at(-1)!;
  await page.goto(`/lesson/m6/${last.id}`);
  if (last.type === 'singleChoice' && last.correctChoiceId) {
    await page.getByRole('radio', { name: last.choices.find((choice) => choice.id === last.correctChoiceId)!.label, exact: true }).filter({ visible: true }).first().click();
    await page.getByRole('button', { name: /^Submit/ }).filter({ visible: true }).first().click();
  }
  await page.getByRole('button', { name: 'Listen', exact: true }).filter({ visible: true }).first().click();
  await expect(page.getByRole('button', { name: 'Stop', exact: true }).filter({ visible: true }).first()).toBeVisible();
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Complete module', exact: true }).filter({ visible: true }).first().click();
  await expect(page).toHaveURL(/\/module\/m6\/complete/);
  await page.waitForTimeout(800);
  expect(await activeSpeech(page)).toEqual([]);
});

test('switching language stops speech and the next lesson uses the new language voice', async ({ page }) => {
  await installSpeech(page, BOTH);
  await seed(page, { narrationEnabled: true, language: 'en' });
  await page.goto('/');
  const switchAt = await now(page);
  await page.getByRole('button', { name: 'Cambiar a español' }).click();
  await expect(page.getByText('MÓDULO 1').first()).toBeVisible();
  expect((await calls(page)).some((call) => call.kind === 'cancel' && call.at >= switchAt)).toBe(true);
  expect(await activeSpeech(page)).toEqual([]);
  await page.getByRole('button', { name: /^1\. Introducción a la apnea del sueño/ }).click();
  await page.getByRole('button', { name: /^(Comenzar|Continuar)/ }).first().click();
  const before = await now(page);
  await page.getByRole('button', { name: 'Escuchar', exact: true }).filter({ visible: true }).first().click();
  await expect(page.getByRole('button', { name: 'Detener', exact: true }).filter({ visible: true }).first()).toBeVisible();
  const spoken = await spokenSince(page, before);
  expect(spoken.length).toBeGreaterThan(0);
  expect(new Set(spoken.map((call) => call.lang))).toEqual(new Set(['es-US']));
});

test('pressing Listen twice quickly does not queue overlapping narration', async ({ page }) => {
  await installSpeech(page, BOTH);
  await seed(page, { narrationEnabled: true, language: 'en' });
  const screen = screenOf(englishModules, 'm6', 'm6-02');
  await page.goto('/lesson/m6/m6-02');
  const listen = page.getByRole('button', { name: 'Listen', exact: true }).filter({ visible: true }).first();
  await expect(listen).toBeEnabled();
  await listen.dblclick();
  await page.waitForTimeout(300);
  const queued = await page.evaluate(() => (window as unknown as { __speech: { active: () => string[] } }).__speech.active());
  const expectedChunks = (await spokenSince(page)).length;
  expect(queued.length).toBeLessThanOrEqual(expectedChunks);
  expect(new Set(queued).size).toBe(queued.length); // no chunk is queued twice
  expect(normalize(narrationText(screen)).length).toBeGreaterThan(0);
});

test('a missing Spanish voice is reported and does not hang, including when the browser lists no voices', async ({ page }) => {
  await installSpeech(page, ENGLISH);
  await seed(page, { narrationEnabled: true, language: 'es' });
  await page.goto('/lesson/m1/m1-01');
  await expect(page.getByRole('button', { name: 'Escuchar: no hay una voz en español disponible en este dispositivo' }).filter({ visible: true }).first()).toBeDisabled({ timeout: 10_000 });

  const other = await page.context().newPage();
  await installSpeech(other, [], { neverListVoices: true });
  await other.goto('/lesson/m1/m1-01');
  await expect(other.getByRole('button', { name: 'Escuchar: no hay una voz en español disponible en este dispositivo' }).filter({ visible: true }).first()).toBeDisabled({ timeout: 10_000 });
});
