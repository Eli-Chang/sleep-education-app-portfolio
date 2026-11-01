import { expect, test, type Page } from '@playwright/test';
import { englishModules } from '../../src/content/en';
import { spanishModules } from '../../src/content/es';
import type { LessonScreen } from '../../src/types/content';

const STORAGE_KEY = 'sleep_education_state_v3';
const isScored = (screen: LessonScreen) =>
  (screen.type === 'singleChoice' && Boolean(screen.correctChoiceId)) ||
  (screen.type === 'multiSelect' && Boolean(screen.correctChoiceIds?.length));


async function seed(page: Page, state: Record<string, unknown>) {
  await page.addInitScript(([key, value]) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem(key, value);
      sessionStorage.setItem('seeded', '1');
    }
  }, [STORAGE_KEY, JSON.stringify(state)] as const);
}

test('the home path lists all eight modules in order in English and Spanish', async ({ browser }) => {
  for (const [language, modules] of [['en', englishModules], ['es', spanishModules]] as const) {
    // A fresh context per language, seeded before any app code runs, so the app cannot persist over it.
    const context = await browser.newContext();
    const page = await context.newPage();
    await seed(page, { language });
    await page.goto('/');
    for (const module of modules) {
      await expect(page.getByRole('button', { name: new RegExp(`^${module.order}\\. ${module.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.`) })).toBeVisible();
    }
    await expect(page.getByRole('button', { name: /^9\. / })).toHaveCount(0);
    await context.close();
  }
});

const ui = {
  en: { modules: englishModules, open: /^(Start|Continue|Review Module)/, step: 'Step', of: 'of', submit: /^Submit/, correct: /\bCorrect[.!]/, advance: /^(Next|Skip)$/, complete: 'Complete module', done: (n: number) => `MODULE ${n} COMPLETE`, upNext: (n: number) => `UP NEXT · MODULE ${n}`, cont: (title: string) => `Continue to ${title}`, all: 'All modules complete' },
  es: { modules: spanishModules, open: /^(Comenzar|Continuar|Repasar módulo)/, step: 'Paso', of: 'de', submit: /^Enviar/, correct: /\bCorrecto[.!]/, advance: /^(Siguiente|Omitir)$/, complete: 'Completar módulo', done: (n: number) => `MÓDULO ${n} COMPLETADO`, upNext: (n: number) => `SIGUIENTE · MÓDULO ${n}`, cont: (title: string) => `Continuar a ${title}`, all: 'Todos los módulos están completos' },
} as const;

for (const language of ['en', 'es'] as const) {
  test(`every ${language === 'en' ? 'English' : 'Spanish'} module is reachable and completable by clicking through every screen`, async ({ page }) => {
    test.setTimeout(900_000);
    const t = ui[language];
    await seed(page, { language });
    for (const [moduleIndex, module] of t.modules.entries()) {
      await page.goto(`/module/${module.id}`);
      await expect(page.getByRole('heading', { name: module.title })).toBeVisible();
      await page.getByRole('button', { name: t.open }).first().click();
      for (const [index, screen] of module.screens.entries()) {
        await expect(page.getByText(`${t.step} ${index + 1} ${t.of} ${module.screens.length}`, { exact: true }).filter({ visible: true }).first()).toBeVisible({ timeout: 20_000 });
        await expect(page).toHaveURL(new RegExp(`/lesson/${module.id}.*${screen.id}`));
        await expect(page.getByText(screen.type === 'content' || screen.type === 'summary' ? screen.title : screen.prompt, { exact: true }).filter({ visible: true }).first()).toBeVisible();
        const last = index === module.screens.length - 1;
        if (isScored(screen) && (screen.type === 'singleChoice' || screen.type === 'multiSelect')) {
          const correct = screen.type === 'singleChoice' ? [screen.correctChoiceId!] : screen.correctChoiceIds!;
          for (const id of correct) {
            const label = screen.choices.find((choice) => choice.id === id)!.label;
            await page.getByRole(screen.type === 'singleChoice' ? 'radio' : 'checkbox', { name: label, exact: true }).filter({ visible: true }).first().click();
          }
          await page.getByRole('button', { name: t.submit }).filter({ visible: true }).first().click();
          await expect(page.getByRole('alert').filter({ visible: true }).filter({ hasText: t.correct }).first()).toBeVisible();
        }
        // The lesson screen ignores navigation for 320 ms after each page turn (a double-tap guard).
        await page.waitForTimeout(400);
        await page.getByRole('button', { name: last ? t.complete : t.advance }).filter({ visible: true }).first().click();
      }
      await expect(page).toHaveURL(new RegExp(`/module/${module.id}/complete`));
      await expect(page.getByText(t.done(module.order))).toBeVisible();
      const next = t.modules[moduleIndex + 1];
      if (next) {
        await expect(page.getByText(t.upNext(next.order))).toBeVisible();
        await page.getByRole('button', { name: t.cont(next.shortTitle) }).click();
        await expect(page).toHaveURL(new RegExp(`/module/${next.id}$`));
      }
    }
    await page.goto('/');
    await expect(page.getByText(t.all)).toBeVisible();
    const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), STORAGE_KEY);
    expect(stored.curriculumVersion).toBe(5);
    expect(new Set(stored.completedModuleIds)).toEqual(new Set(t.modules.map((module) => module.id)));
  });
}

test('saved single-module sleep-hygiene progress opens on Part 2 and keeps both sleep hygiene parts complete', async ({ page }) => {
  const m5Old = [...englishModules.find((module) => module.id === 'm5')!.screens, ...englishModules.find((module) => module.id === 'm5b')!.screens].map((screen) => screen.id);
  await seed(page, {
    curriculumVersion: 4,
    completedScreenIds: [...englishModules.slice(0, 4).flatMap((module) => module.screens.map((screen) => screen.id)), ...m5Old],
    completedModuleIds: ['m1', 'm2', 'm3', 'm4', 'm5'],
    currentModuleId: 'm5',
    lastScreenByModule: { m5: 'm5-recap' },
    answers: { 'm5-q2': ['c1'] },
    language: 'en',
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: /^5\. Healthy Sleep Hygiene, Part 1: Routine and Light\. Complete/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /^6\. Healthy Sleep Hygiene, Part 2: Environment and Daily Habits\. Complete/ })).toBeVisible();
  await expect(page.getByText('Module 7', { exact: true })).toBeVisible();
  const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), STORAGE_KEY);
  expect(stored.curriculumVersion).toBe(5);
  expect(stored.completedModuleIds).toEqual(['m1', 'm2', 'm3', 'm4', 'm5', 'm5b']);
  expect(stored.currentModuleId).toBe('m5b');
  expect(stored.answers).toEqual({ 'm5-q2': ['c1'] });
});

test('Spanish lesson and completion screens show the new module numbers and titles', async ({ page }) => {
  await seed(page, { language: 'es' });
  const partTwo = spanishModules.find((module) => module.id === 'm5b')!;
  await page.goto(`/lesson/m5b/${partTwo.screens[0].id}`);
  await expect(page.getByText('Módulo 6', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: partTwo.screens[0].title, exact: true }).first()).toBeVisible();
  await page.goto('/module/m5/complete');
  await expect(page.getByText('MÓDULO 5 COMPLETADO')).toBeVisible();
  await expect(page.getByText('SIGUIENTE · MÓDULO 6')).toBeVisible();
  await expect(page.getByText(partTwo.title)).toBeVisible();
});

for (const mode of ['system preference', 'app setting'] as const) {
  test(`with reduced motion (${mode}), a Spanish deep link and repeated page turns never leave a blank lesson`, async ({ page }) => {
    if (mode === 'system preference') await page.emulateMedia({ reducedMotion: 'reduce' });
    await seed(page, { language: 'es', reduceMotion: mode === 'app setting' });
    const partTwo = spanishModules.find((module) => module.id === 'm5b')!;
    await page.goto(`/lesson/m5b/${partTwo.screens[0].id}`);
    for (const [index, screen] of partTwo.screens.slice(0, 6).entries()) {
      await expect(page.getByText(`Paso ${index + 1} de ${partTwo.screens.length}`, { exact: true }).filter({ visible: true }).first()).toBeVisible();
      const visibleText = screen.type === 'content' || screen.type === 'summary' ? screen.title : screen.prompt;
      await expect(page.getByText(visibleText, { exact: true }).filter({ visible: true }).first()).toBeVisible();
      if (index === 5) break;
      if (screen.type === 'multiSelect' && screen.correctChoiceIds?.length) {
        for (const id of screen.correctChoiceIds) await page.getByRole('checkbox', { name: screen.choices.find((choice) => choice.id === id)!.label, exact: true }).filter({ visible: true }).first().click();
        await page.getByRole('button', { name: /^Enviar/ }).filter({ visible: true }).first().click();
      }
      await page.waitForTimeout(400);
      await page.getByRole('button', { name: /^(Siguiente|Omitir)$/ }).filter({ visible: true }).first().click();
    }
  });
}
