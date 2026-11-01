// Lightweight accessibility audit of rendered learner screens (Expo web).
// Checks: interactive elements have an accessible name, touch targets are at
// least 44x44 CSS px, no horizontal overflow, and keyboard focus is visible.
// Usage: node scripts/audit-ui-a11y.mjs [baseUrl] > report.json
import { chromium } from '@playwright/test';

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:19009';
const STORAGE_KEY = 'sleep_education_state_v3';
const routes = ['/', '/settings', '/about', '/module/m1', '/lesson/m1?screenId=m1-04&direction=forward', '/lesson/m1?screenId=m1-q2&direction=forward', '/lesson/m1?screenId=m1-r1&direction=forward', '/module/m1/complete', '/lesson/m5?screenId=m5-q5&direction=forward'];
const viewports = [{ width: 320, height: 640 }, { width: 390, height: 844 }];

const browser = await chromium.launch({ channel: 'chrome' });
const report = [];
for (const language of ['en', 'es']) for (const viewport of viewports) for (const route of routes) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript(([key, value]) => localStorage.setItem(key, value), [STORAGE_KEY, JSON.stringify({ language, curriculumVersion: 5 })]);
  const page = await context.newPage();
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  const result = await page.evaluate(() => {
    const visible = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && !el.closest('[aria-hidden="true"]'); };
    const interactive = [...document.querySelectorAll('[role=button],[role=link],[role=radio],[role=checkbox],[role=switch],a[href],button,input,textarea,[tabindex="0"]')].filter(visible);
    const name = (el) => (el.getAttribute('aria-label') || el.innerText || el.getAttribute('placeholder') || el.value || '').trim();
    const unnamed = interactive.filter((el) => !name(el)).map((el) => el.outerHTML.slice(0, 120));
    const small = interactive.filter((el) => el.tagName !== 'INPUT' || el.type !== 'checkbox').map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.width < 44 || r.height < 44).map(({ el, r }) => `${name(el).slice(0, 40)} (${Math.round(r.width)}x${Math.round(r.height)})`);
    const overflow = [...document.querySelectorAll('body *')].filter(visible).filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1 && !el.closest('svg')).map((el) => `${el.tagName}:${(el.innerText || '').slice(0, 30)}`).slice(0, 5);
    return { interactive: interactive.length, unnamed, small, overflow };
  });
  // Keyboard: the first few tab stops must show a visible outline or ring.
  const focus = [];
  for (let i = 0; i < 4; i += 1) {
    await page.keyboard.press('Tab');
    focus.push(await page.evaluate(() => { const el = document.activeElement; if (!el || el === document.body) return 'body'; const s = getComputedStyle(el); return `${(el.getAttribute('aria-label') || el.innerText || '').trim().slice(0, 24)}|outline=${s.outlineStyle}/${s.outlineWidth}`; }));
  }
  report.push({ language, viewport: `${viewport.width}x${viewport.height}`, route, ...result, focus });
  await context.close();
}
await browser.close();
console.log(JSON.stringify(report, null, 2));
