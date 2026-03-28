import { describe, it, expect, beforeAll } from 'vitest'
import { SoundboardIcons } from '../fetchIcons'

let icons: SoundboardIcons

beforeAll(() => {
  icons = new SoundboardIcons()
})

describe('SoundboardIcons.SearchIcons', () => {
  it('returns an empty array for an empty search string', () => {
    expect(icons.SearchIcons('')).toEqual([])
  })

  it('returns results for a known word', () => {
    const results = icons.SearchIcons('sword')
    expect(results.length).toBeGreaterThan(0)
  })

  it('each result has a name and an svg body', () => {
    const results = icons.SearchIcons('sword')
    results.forEach((r) => {
      expect(r.name).toBeTruthy()
      expect(r.body).toContain('<svg')
    })
  })

  it('matches on partial word prefix', () => {
    const partial = icons.SearchIcons('swo')
    const full = icons.SearchIcons('sword')
    // Partial should be a superset of (or at least contain) full matches
    expect(partial.length).toBeGreaterThan(0)
    const partialNames = new Set(partial.map((r) => r.name))
    full.forEach((r) => expect(partialNames.has(r.name)).toBe(true))
  })

  it('is case-insensitive', () => {
    const lower = icons.SearchIcons('sword')
    const upper = icons.SearchIcons('SWORD')
    expect(upper.length).toBe(lower.length)
  })

  it('returns no results for a whitespace-only string', () => {
    expect(icons.SearchIcons('   ')).toEqual([])
  })

  it('returns no results for a string that matches nothing', () => {
    const results = icons.SearchIcons('zzzzzznotanicon')
    expect(results).toEqual([])
  })
})

describe('SoundboardIcons.GetIcon', () => {
  it('returns an icon for a known icon name', () => {
    const icon = icons.GetIcon('moon')
    expect(icon).toBeDefined()
    expect(icon!.name).toBe('moon')
    expect(icon!.body).toContain('<svg')
  })

  it('returns undefined for an unknown icon name', () => {
    expect(icons.GetIcon('this-icon-definitely-does-not-exist-xyz')).toBeUndefined()
  })
})

describe('SoundboardIcons.GetBestIcon', () => {
  it('returns a valid icon for a recognizable search term', async () => {
    const icon = await icons.GetBestIcon('sword')
    expect(icon.name).toBeTruthy()
    expect(icon.body).toContain('<svg')
  })

  it('falls back to the moon icon when no match is found', async () => {
    const icon = await icons.GetBestIcon('xyzxyzxyznotaword12345')
    expect(icon.name).toBe('moon')
  })

  it('finds a result for a plural search term', async () => {
    const result = await icons.GetBestIcon('swords')
    // The algorithm searches both the original term and the de-pluralised form,
    // so either 'swords' or 'sword' hits should produce a real icon.
    expect(result.name).not.toBe('moon') // did not fall back to default
    expect(result.body).toContain('<svg')
  })
})
