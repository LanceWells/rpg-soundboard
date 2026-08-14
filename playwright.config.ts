import { defineConfig } from '@playwright/test'

/**
 * Playwright config for this project's Electron E2E suite. Tests launch the app's own built
 * `out/main` entry point directly (see e2e/audio.spec.ts), so there is no dev server to start.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: 'list'
})
