import { defineConfig, devices } from '@playwright/test'

/**
 * e2e runs against the production build served by `vite preview` on :4173 — never the dev server.
 * run `pnpm build` first (ci does it in the `check` job and hands `dist` over as an artifact).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    permissions: ['clipboard-read', 'clipboard-write'],
    colorScheme: 'light',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // coarse pointer: the textarea is not autofocused, so only the specs that tap first run here
      name: 'mobile',
      testMatch: /(first-interaction|persistence)\.spec\.ts$/,
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: 'pnpm exec vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
