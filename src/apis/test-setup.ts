import path from 'node:path'
import { vi } from 'vitest'

// Redirect all config storage to a project-local directory so API tests never
// touch the real user config in AppData.
const TEST_APP_DATA = path.resolve(__dirname, '../../test-data')

vi.mock('../utils/paths', () => ({
  GetAppDataPath: () => TEST_APP_DATA,
  GetCwd: () => ''
}))
