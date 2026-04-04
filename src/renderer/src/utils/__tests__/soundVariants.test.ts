import { describe, it, expect } from 'vitest'
import { SoundVariant } from '../soundVariants'

describe('SoundVariant', () => {
  it('has a display string for Default', () => {
    expect(SoundVariant.Default).toBe('Default')
  })

  it('has a display string for Looping', () => {
    expect(SoundVariant.Looping).toBe('Looping')
  })

  it('has a display string for Rapid', () => {
    expect(SoundVariant.Rapid).toBe('Rapid-Fire')
  })

  it('has a display string for Soundtrack', () => {
    expect(SoundVariant.Soundtrack).toBe('Soundtrack')
  })

  it('has a display string for Sequence', () => {
    expect(SoundVariant.Sequence).toBe('Sequence')
  })

  it('contains exactly the expected variants', () => {
    const keys = Object.keys(SoundVariant)
    expect(keys).toEqual(
      expect.arrayContaining(['Default', 'Looping', 'Rapid', 'Soundtrack', 'Sequence'])
    )
    expect(keys).toHaveLength(5)
  })
})
