import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_PORT ?? 19009);

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  // A single Expo dev server is shared by the suite; parallel workers intermittently
  // starve route navigation while Metro is compiling the next entry point.
  workers: 1,
  outputDir: process.env.PLAYWRIGHT_ARTIFACT_DIR ?? 'artifacts/playwright-review/automated',
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npm.cmd run web -- --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 390, height: 844 } },
    },
  ],
});
