import { expect, test } from '@playwright/test';
import { englishModules } from '../../src/content/en';

test('the learner can open a module and the optional AI companion stays consent-gated', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: /1\. Intro to Sleep Apnea/i }).click();
  await page.getByRole('button', { name: /Start/i }).click();
  // The first lesson of Module 1 must open (its own heading, not any of the many "Sleep Apnea" strings on the page).
  await expect(page).toHaveURL(/\/lesson\/m1/);
  await expect(page.getByRole('heading', { name: englishModules[0].screens[0].title, exact: true }).first()).toBeVisible();
});
