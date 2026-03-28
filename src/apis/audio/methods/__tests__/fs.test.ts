import { describe, it, expect, vi, beforeEach } from 'vitest'
import path from 'node:path'

const TEST_APP_DATA = path.join(
  process.platform === 'win32' ? 'C:\\' : '/',
  'TestAppData',
  'rpg-soundboard'
)

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    readdirSync: vi.fn(),
    copyFileSync: vi.fn(),
    rmSync: vi.fn(),
    promises: {
      stat: vi.fn()
    }
  }
}))

vi.mock('../../../utils/paths', () => ({
  GetAppDataPath: vi.fn(() => TEST_APP_DATA)
}))

import fs from 'node:fs'
import { getGroupPath, saveSoundEffect, deleteFile, getFileSize } from '../fs'
import { GroupID } from '../../types/groups'

const mockFs = fs as unknown as {
  existsSync: ReturnType<typeof vi.fn>
  mkdirSync: ReturnType<typeof vi.fn>
  readdirSync: ReturnType<typeof vi.fn>
  copyFileSync: ReturnType<typeof vi.fn>
  rmSync: ReturnType<typeof vi.fn>
  promises: { stat: ReturnType<typeof vi.fn> }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getGroupPath', () => {
  it('returns the correct directory path for a group', () => {
    const groupID: GroupID = 'grp-1-2-3-4-5'
    const result = getGroupPath(groupID)
    expect(result).toBe(path.join(TEST_APP_DATA, 'board-data', 'grp-1-2-3-4-5'))
  })
})

describe('saveSoundEffect', () => {
  it('throws when the source file does not exist', () => {
    mockFs.existsSync.mockReturnValue(false)
    expect(() => saveSoundEffect('grp-1-2-3-4-5', '/path/to/file.mp3')).toThrow(
      'Path does not exist'
    )
  })

  it('throws for an unsupported file extension', () => {
    mockFs.existsSync.mockReturnValue(true)
    expect(() => saveSoundEffect('grp-1-2-3-4-5', '/path/to/file.xyz')).toThrow(
      'Unsupported file type'
    )
  })

  it('creates the destination directory when it does not exist', () => {
    mockFs.existsSync.mockImplementation((p: string) => p.endsWith('.mp3'))
    mockFs.readdirSync.mockReturnValue([])

    saveSoundEffect('grp-1-2-3-4-5', '/path/to/file.mp3')

    expect(mockFs.mkdirSync).toHaveBeenCalledOnce()
  })

  it('does not create directory when it already exists', () => {
    mockFs.existsSync.mockReturnValue(true)
    mockFs.readdirSync.mockReturnValue([])

    saveSoundEffect('grp-1-2-3-4-5', '/path/to/file.mp3')

    expect(mockFs.mkdirSync).not.toHaveBeenCalled()
  })

  it('returns an aud:// protocol path', () => {
    mockFs.existsSync.mockImplementation((p: string) => p.endsWith('.mp3'))
    mockFs.readdirSync.mockReturnValue([])

    const result = saveSoundEffect('grp-1-2-3-4-5', '/path/to/file.mp3')

    expect(result.path).toMatch(/^aud:\/\//)
  })

  it('returns the correct format for the saved file', () => {
    mockFs.existsSync.mockImplementation((p: string) => p.endsWith('.ogg'))
    mockFs.readdirSync.mockReturnValue([])

    const result = saveSoundEffect('grp-1-2-3-4-5', '/path/to/file.ogg')

    expect(result.format).toBe('.ogg')
  })

  it('path contains the group ID', () => {
    mockFs.existsSync.mockImplementation((p: string) => p.endsWith('.mp3'))
    mockFs.readdirSync.mockReturnValue([])

    const result = saveSoundEffect('grp-1-2-3-4-5', '/path/to/file.mp3')

    expect(result.path).toContain('grp-1-2-3-4-5')
  })

  it('starts filename at 1 for an empty directory', () => {
    mockFs.existsSync.mockImplementation((p: string) => p.endsWith('.mp3'))
    mockFs.readdirSync.mockReturnValue([])

    const result = saveSoundEffect('grp-1-2-3-4-5', '/path/to/file.mp3')

    expect(result.path).toContain('1.mp3')
  })

  it('increments the filename when files already exist', () => {
    mockFs.existsSync.mockImplementation((p: string) => p.endsWith('.mp3'))
    mockFs.readdirSync.mockReturnValue(['1.mp3', '2.mp3'])

    const result = saveSoundEffect('grp-1-2-3-4-5', '/path/to/file.mp3')

    expect(result.path).toContain('3.mp3')
  })

  it('replaces spaces with underscores in the returned path', () => {
    mockFs.existsSync.mockImplementation((p: string) => p.includes('my track'))
    mockFs.readdirSync.mockReturnValue([])

    const result = saveSoundEffect('grp-1-2-3-4-5', '/path/to/my track.mp3')

    expect(result.path).not.toContain(' ')
  })

  it('copies the source file to the destination', () => {
    mockFs.existsSync.mockImplementation((p: string) => p.endsWith('.mp3'))
    mockFs.readdirSync.mockReturnValue([])

    saveSoundEffect('grp-1-2-3-4-5', '/path/to/file.mp3')

    expect(mockFs.copyFileSync).toHaveBeenCalledOnce()
  })
})

describe('deleteFile', () => {
  it('does not delete when path traversal resolves outside the app directory', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    deleteFile('aud://../../system/important-file')

    expect(mockFs.rmSync).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('does not delete when the file does not exist', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFs.existsSync.mockReturnValue(false)

    deleteFile('aud://board-data/grp-1-2-3-4-5/1.mp3')

    expect(mockFs.rmSync).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('deletes the file when it exists within the app directory', () => {
    mockFs.existsSync.mockReturnValue(true)

    deleteFile('aud://board-data/grp-1-2-3-4-5/1.mp3')

    expect(mockFs.rmSync).toHaveBeenCalledOnce()
  })

  it('logs an error instead of throwing when path is outside app directory', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => deleteFile('aud://../../etc/passwd')).not.toThrow()
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})

describe('getFileSize', () => {
  it('returns file size in megabytes', async () => {
    const oneMb = 1 * 1024 * 1024
    mockFs.promises.stat.mockResolvedValue({ size: oneMb })

    const size = await getFileSize('/some/file.mp3')

    expect(size).toBe(1)
  })

  it('returns a fractional MB for files smaller than 1 MB', async () => {
    const halfMb = 0.5 * 1024 * 1024
    mockFs.promises.stat.mockResolvedValue({ size: halfMb })

    const size = await getFileSize('/some/file.mp3')

    expect(size).toBe(0.5)
  })

  it('returns 0 for an empty file', async () => {
    mockFs.promises.stat.mockResolvedValue({ size: 0 })

    const size = await getFileSize('/some/file.mp3')

    expect(size).toBe(0)
  })
})
