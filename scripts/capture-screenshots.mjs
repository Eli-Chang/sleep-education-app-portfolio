// Captures the README screenshots from a running Expo web server (npm run web).
// All progress shown is a synthetic seed written to localStorage; no learner data is involved.
// Usage: node scripts/capture-screenshots.mjs [baseUrl]
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:19009';
const STORAGE_KEY = 'sleep_education_state_v3';
const out = 'screenshots';
mkdirSync(out, { recursive: true });

const m1 = ['m1-01', 'm1-03', 'm1-q1', 'm1-04'];
const seed = (language, extra = {}) => ({
  curriculumVersion: 5, language, narrationEnabled: false,
  completedScreenIds: m1, completedModuleIds: [], currentModuleId: 'm1',
  lastScreenByModule: { m1: 'm1-05' }, ...extra,
});

const shots = [
  { file: 'home-en-mobile.png', language: 'en', route: '/', viewport: { width: 390, height: 844 } },
  { file: 'home-es-mobile.png', language: 'es', route: '/', viewport: { width: 390, height: 844 } },
  { file: 'module-en-mobile.png', language: 'en', route: '/module/m1', viewport: { width: 390, height: 844 } },
  { file: 'lesson-en-mobile.png', language: 'en', route: '/lesson/m1?screenId=m1-04&direction=forward', viewport: { width: 390, height: 844 } },
  { file: 'lesson-es-mobile.png', language: 'es', route: '/lesson/m5b?screenId=m5-06&direction=forward', viewport: { width: 390, height: 844 } },
  { file: 'question-en-mobile.png', language: 'en', route: '/lesson/m1?screenId=m1-q2&direction=forward', viewport: { width: 390, height: 844 } },
  { file: 'ai-consent-en-mobile.png', language: 'en', route: '/ai?returnTo=%2Fsettings', viewport: { width: 390, height: 844 } },
  { file: 'home-en-desktop.png', language: 'en', route: '/', viewport: { width: 1280, height: 860 } },
  { file: 'lesson-en-desktop.png', language: 'en', route: '/lesson/m1?screenId=m1-04&direction=forward', viewport: { width: 1280, height: 860 } },
];

const browser = await chromium.launch({ channel: 'chrome' });
for (const shot of shots) {
  const context = await browser.newContext({ viewport: shot.viewport, deviceScaleFactor: 2 });
  await context.addInitScript(([key, value]) => localStorage.setItem(key, value), [STORAGE_KEY, JSON.stringify(seed(shot.language))]);
  const page = await context.newPage();
  await page.goto(`${baseUrl}${shot.route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${out}/${shot.file}` });
  await context.close();
  console.log(`captured ${shot.file}`);
}
await browser.close();
