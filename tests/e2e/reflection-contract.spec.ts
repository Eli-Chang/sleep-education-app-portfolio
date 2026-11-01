import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('text reflection preserves a draft across save failure, supports retry/edit/cancel, and stays keyboard-safe', async ({ page }) => {
  await page.goto('/qa/reflection');
  const input = page.getByTestId('reflection-input');
  await expect(input).toBeVisible();
  await page.screenshot({ path: 'artifacts/current-reflection-390-en.png', fullPage: true });
  await input.fill('How will I know whether PAP is helping my sleep?');

  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Object.defineProperty(window, '__reflectionOriginalSetItem', { value: original, configurable: true });
    Storage.prototype.setItem = function () { throw new Error('synthetic reflection save failure'); };
  });
  await page.getByTestId('reflection-save').click();
  await expect(page.getByTestId('reflection-save-error')).toBeVisible();
  await expect(input).toHaveValue('How will I know whether PAP is helping my sleep?');

  await page.evaluate(() => {
    const original = (window as typeof window & { __reflectionOriginalSetItem?: Storage['setItem'] }).__reflectionOriginalSetItem;
    if (original) Storage.prototype.setItem = original;
  });
  await page.getByRole('button', { name: /Retry save/i }).click();
  await expect(page.getByTestId('reflection-saved-card')).toBeVisible();
  await expect(page.getByTestId('reflection-saved-card').getByText('Saved locally on this device.', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: /Edit response/i }).click();
  await expect(input).toHaveValue('How will I know whether PAP is helping my sleep?');
  await input.focus();
  const box = await input.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  await input.fill('What should I ask my sleep-care team?');
  await page.getByRole('button', { name: /^Cancel$/i }).click();
  await expect(page.getByTestId('reflection-saved-card')).toContainText('How will I know whether PAP is helping my sleep?');

  await page.getByRole('button', { name: /Edit response/i }).click();
  await input.fill('What should I ask my sleep-care team?');
  await page.getByTestId('reflection-save').click();
  await expect(page.getByTestId('reflection-saved-card')).toContainText('What should I ask my sleep-care team?');
});

test.describe('reflection responsive and bilingual states', () => {
  test.use({ viewport: { width: 360, height: 800 } });

  test('renders the local reflection card without horizontal overflow at 360px', async ({ page }) => {
    await page.goto('/qa/reflection');
    await expect(page.getByTestId('reflection-input')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: 'artifacts/current-reflection-360-en.png', fullPage: true });
  });

  test('keeps the reflection contract translated in Spanish', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('sleep_education_state_v3', JSON.stringify({ language: 'es' })));
    await page.goto('/qa/reflection');
    await expect(page.getByTestId('reflection-input')).toBeVisible();
    await expect(page.getByText('Piense en su propia experiencia')).toBeVisible();
    await expect(page.getByText(/Esto permanece en su dispositivo/i)).toBeVisible();
    await page.screenshot({ path: 'artifacts/current-reflection-360-es.png', fullPage: true });
  });
});
