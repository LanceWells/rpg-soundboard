import { randomUUID } from 'node:crypto'
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const FIXTURE_WAV = join(
  __dirname,
  '../../src/renderer/src/assets/impulseResponses/echothief_moonsmugglers.wav'
)

/**
 * An isolated, throwaway app-data directory seeded with one playable sound group. Points the app
 * at this instead of a developer's real saved boards, so E2E runs don't depend on (or modify)
 * anyone's personal data.
 */
export type TestAppData = {
  /**
   * Directory to assign to the app's `APPDATA` environment variable. The app resolves its config
   * and board-data paths from this at startup.
   */
  root: string

  /**
   * The ID of the seeded sound group, for locating its button in the UI.
   */
  groupId: string
}

/**
 * Creates a {@link TestAppData} directory containing one source-type sound group with a single
 * real, short audio file, laid out the same way the app stores its own boards on disk.
 */
export function seedTestAppData(): TestAppData {
  const root = mkdtempSync(join(tmpdir(), 'rpg-soundboard-e2e-'))
  const soundboardDir = join(root, 'rpg-soundboard')
  const groupId = `grp-${randomUUID()}`
  const groupDir = join(soundboardDir, 'board-data', groupId)

  mkdirSync(groupDir, { recursive: true })
  copyFileSync(FIXTURE_WAV, join(groupDir, '1.wav'))

  const config = {
    version: 3,
    pinnedSearches: [],
    Groups: [
      {
        type: 'source',
        id: groupId,
        variant: 'Default',
        name: 'E2E Test Sound',
        icon: { type: 'svg', name: 'moon', foregroundColor: '#ffffff' },
        tags: [],
        effects: [
          {
            id: `eff-${randomUUID()}`,
            path: `aud://board-data/${groupId}/1.wav`,
            format: '.wav',
            volume: 100,
            name: 'Test Effect'
          }
        ]
      }
    ]
  }

  writeFileSync(join(soundboardDir, 'audio.json'), JSON.stringify(config))

  return { root, groupId }
}

/**
 * Deletes a {@link TestAppData} directory created by {@link seedTestAppData}.
 */
export function cleanupTestAppData(data: TestAppData): void {
  rmSync(data.root, { recursive: true, force: true })
}
