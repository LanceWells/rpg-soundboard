import { describe, it, expect } from 'vitest'
import { SupportedFileTypes } from './supportedFileTypes'

describe('SupportedFileTypes', () => {
  it('contains all expected audio formats', () => {
    const expected = [
      '.mp3',
      '.mpeg',
      '.opus',
      '.ogg',
      '.oga',
      '.wav',
      '.aac',
      '.caf',
      '.m4a',
      '.mp4',
      '.weba',
      '.webm',
      '.dolby',
      '.flac'
    ]
    expected.forEach((ext) => {
      expect(SupportedFileTypes).toHaveProperty(ext)
    })
  })

  it('all keys begin with a dot', () => {
    Object.keys(SupportedFileTypes).forEach((key) => {
      expect(key).toMatch(/^\./)
    })
  })
})
