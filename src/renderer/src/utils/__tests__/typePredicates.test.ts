import { describe, it, expect } from 'vitest'
import { isSourceGroup, isSequenceGroup, isSoundtrackContainer } from '../typePredicates'

describe('isSourceGroup', () => {
  it('returns true for a group with type "source"', () => {
    const group = { type: 'source' } as any
    expect(isSourceGroup(group)).toBe(true)
  })

  it('returns false for a group with type "sequence"', () => {
    const group = { type: 'sequence' } as any
    expect(isSourceGroup(group)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isSourceGroup(undefined)).toBe(false)
  })

  it('returns false for an object with no type', () => {
    const group = { name: 'test' } as any
    expect(isSourceGroup(group)).toBe(false)
  })
})

describe('isSequenceGroup', () => {
  it('returns true for a group with type "sequence"', () => {
    const group = { type: 'sequence' } as any
    expect(isSequenceGroup(group)).toBe(true)
  })

  it('returns false for a group with type "source"', () => {
    const group = { type: 'source' } as any
    expect(isSequenceGroup(group)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isSequenceGroup(undefined)).toBe(false)
  })

  it('returns false for an object with no type', () => {
    const group = { name: 'test' } as any
    expect(isSequenceGroup(group)).toBe(false)
  })
})

describe('isSoundtrackContainer', () => {
  it('returns true for an object with both playNextSong and getActiveSong methods', () => {
    const obj = {
      playNextSong: () => Promise.resolve(),
      getActiveSong: () => undefined
    }
    expect(isSoundtrackContainer(obj)).toBe(true)
  })

  it('returns false when playNextSong is missing', () => {
    const obj = { getActiveSong: () => undefined }
    expect(isSoundtrackContainer(obj)).toBe(false)
  })

  it('returns false when getActiveSong is missing', () => {
    const obj = { playNextSong: () => Promise.resolve() }
    expect(isSoundtrackContainer(obj)).toBe(false)
  })

  it('returns false when playNextSong is not a function', () => {
    const obj = { playNextSong: 'not-a-function', getActiveSong: () => undefined }
    expect(isSoundtrackContainer(obj)).toBe(false)
  })

  it('returns false when getActiveSong is not a function', () => {
    const obj = { playNextSong: () => Promise.resolve(), getActiveSong: 42 }
    expect(isSoundtrackContainer(obj)).toBe(false)
  })

  it('returns false for a plain object with no matching properties', () => {
    expect(isSoundtrackContainer({})).toBe(false)
  })

  it('throws for null input (implementation does not guard against null)', () => {
    // The function casts directly without null-check, so null[prop] throws.
    // This documents actual runtime behaviour.
    expect(() => isSoundtrackContainer(null)).toThrow()
  })

  it('throws for undefined input (implementation does not guard against undefined)', () => {
    expect(() => isSoundtrackContainer(undefined)).toThrow()
  })
})
