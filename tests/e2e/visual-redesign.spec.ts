import { expect, test } from '@playwright/test';

test('lesson controls remain usable on a reflection screen', async ({ page }) => {
  await page.goto('/lesson/m1/m1-r1');
  await expect(page.getByRole('button', { name: 'Previous', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Listen', exact: true })).toBeVisible();
});
