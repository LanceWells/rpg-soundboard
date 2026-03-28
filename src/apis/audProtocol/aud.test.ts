import { describe, it, expect } from 'vitest'
import { AudProtocolPrefix } from './aud'

describe('AudProtocolPrefix', () => {
  it('equals "aud"', () => {
    expect(AudProtocolPrefix).toBe('aud')
  })

  it('can be used to construct a valid protocol string', () => {
    const url = `${AudProtocolPrefix}://board-data/grp-123/1.mp3`
    expect(url).toBe('aud://board-data/grp-123/1.mp3')
  })
})
