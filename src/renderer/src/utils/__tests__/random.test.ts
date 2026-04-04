import { describe, it, expect, vi, afterEach } from 'vitest'
import { getRandomArbitrary, getRandomInt } from '../random'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getRandomArbitrary', () => {
  it('returns a number within [min, max)', () => {
    for (let i = 0; i < 50; i++) {
      const val = getRandomArbitrary(1, 10)
      expect(val).toBeGreaterThanOrEqual(1)
      expect(val).toBeLessThan(10)
    }
  })

  it('returns exactly min when Math.random returns 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(getRandomArbitrary(5, 15)).toBe(5)
  })

  it('approaches max when Math.random approaches 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9999999)
    const val = getRandomArbitrary(0, 100)
    expect(val).toBeGreaterThan(99)
    expect(val).toBeLessThan(100)
  })

  it('works with negative ranges', () => {
    for (let i = 0; i < 20; i++) {
      const val = getRandomArbitrary(-10, -1)
      expect(val).toBeGreaterThanOrEqual(-10)
      expect(val).toBeLessThan(-1)
    }
  })

  it('works when min equals max', () => {
    const val = getRandomArbitrary(5, 5)
    expect(val).toBe(5)
  })
})

describe('getRandomInt', () => {
  it('returns an integer within [min, max] inclusive', () => {
    for (let i = 0; i < 50; i++) {
      const val = getRandomInt(1, 5)
      expect(val).toBeGreaterThanOrEqual(1)
      expect(val).toBeLessThanOrEqual(5)
      expect(Number.isInteger(val)).toBe(true)
    }
  })

  it('returns min when Math.random returns 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(getRandomInt(3, 7)).toBe(3)
  })

  it('returns max when Math.random returns just below 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9999999)
    expect(getRandomInt(3, 7)).toBe(7)
  })

  it('returns the only possible value when min equals max', () => {
    for (let i = 0; i < 10; i++) {
      expect(getRandomInt(4, 4)).toBe(4)
    }
  })

  it('ceils min and floors max for fractional inputs', () => {
    for (let i = 0; i < 20; i++) {
      const val = getRandomInt(1.2, 4.9)
      expect(val).toBeGreaterThanOrEqual(2)
      expect(val).toBeLessThanOrEqual(4)
      expect(Number.isInteger(val)).toBe(true)
    }
  })
})
