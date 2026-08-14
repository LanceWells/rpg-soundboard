import { expect, test } from '@playwright/test'
import { _electron as electron, ElectronApplication, Page } from 'playwright-core'
import { join } from 'node:path'
import { cleanupTestAppData, seedTestAppData, TestAppData } from './fixtures/testAppData'

const APP_DIR = join(__dirname, '..')

/**
 * Resolves the platform-specific path to the locally installed Electron binary that
 * `electron-vite build` output should be launched with.
 */
function electronBinaryPath(): string {
  if (process.platform === 'darwin') {
    return join(APP_DIR, 'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron')
  }
  if (process.platform === 'win32') {
    return join(APP_DIR, 'node_modules/electron/dist/electron.exe')
  }
  return join(APP_DIR, 'node_modules/electron/dist/electron')
}

/**
 * The child process environment for the app under test: a copy of the current environment with
 * `APPDATA` pointed at an isolated {@link TestAppData} directory. `ELECTRON_RUN_AS_NODE` is
 * stripped because some dev environments (e.g. VS Code's extension host) set it, which makes the
 * spawned `electron.exe` run as plain Node instead of launching the app.
 */
function testEnv(appDataRoot: string): Record<string, string> {
  const env: Record<string, string> = {}
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined && key !== 'ELECTRON_RUN_AS_NODE') {
      env[key] = value
    }
  }
  env.APPDATA = appDataRoot
  return env
}

let app: ElectronApplication
let page: Page
let testData: TestAppData

test.beforeAll(async () => {
  test.setTimeout(60_000)

  testData = seedTestAppData()

  app = await electron.launch({
    executablePath: electronBinaryPath(),
    args: [join(APP_DIR, 'out/main/index.js')],
    cwd: APP_DIR,
    env: testEnv(testData.root),
    timeout: 30_000
  })

  page = await app.firstWindow()
})

test.afterAll(async () => {
  await app.close()
  cleanupTestAppData(testData)
})

test('playing a sound group loads and starts its audio without error', async () => {
  const pageErrors: string[] = []
  page.on('pageerror', (err) => pageErrors.push(err.message))

  // The app currently lands on a "Not Found" page when loaded from a file:// URL; navigating to
  // the board is a known, separate issue unrelated to audio playback.
  await page.getByRole('link', { name: 'Board' }).click()

  const audioRequest = page.waitForResponse(
    `aud://board-data/${testData.groupId}/1.wav`
  )

  await page.locator(`button[data-groupid="${testData.groupId}"]`).click()

  const response = await audioRequest
  expect(response.status()).toBe(200)

  const groupLabel = page.locator(`button[data-groupid="${testData.groupId}"] span`)
  await expect(groupLabel).toHaveClass(/background-animate/, { timeout: 10_000 })

  expect(pageErrors).toEqual([])
})
