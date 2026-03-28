import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../utils/fetchIcons', () => ({
  soundboardIcons: {
    GetBestIcon: vi.fn(),
    SearchIcons: vi.fn(),
    GetIcon: vi.fn()
  }
}))

import { IconsApi } from '../icons'
import { soundboardIcons } from '../../utils/fetchIcons'

const mockIcons = vi.mocked(soundboardIcons)

const stubIcon = { name: 'sword', body: '<svg>sword</svg>' }

beforeEach(() => {
  vi.clearAllMocks()
  mockIcons.GetBestIcon.mockResolvedValue(stubIcon)
  mockIcons.SearchIcons.mockReturnValue([stubIcon])
  mockIcons.GetIcon.mockReturnValue(stubIcon)
})

// ---------------------------------------------------------------------------
// GenGroupInput
// ---------------------------------------------------------------------------

describe('IconsApi.GenGroupInput', () => {
  it('returns the name from the request', async () => {
    const { group } = await IconsApi.GenGroupInput({ name: 'Combat', filePaths: [] })
    expect(group.name).toBe('Combat')
  })

  it('uses the icon returned by GetBestIcon', async () => {
    const { group } = await IconsApi.GenGroupInput({ name: 'Combat', filePaths: [] })
    expect(group.icon.name).toBe('sword')
  })

  it('sets the icon type to svg and foregroundColor to white', async () => {
    const { group } = await IconsApi.GenGroupInput({ name: 'Combat', filePaths: [] })
    expect(group.icon.type).toBe('svg')
    expect(group.icon.foregroundColor).toBe('#ffffff')
  })

  it('calls GetBestIcon with the request name', async () => {
    await IconsApi.GenGroupInput({ name: 'Combat', filePaths: [] })
    expect(mockIcons.GetBestIcon).toHaveBeenCalledWith('Combat')
  })

  it('maps filePaths to effects with volume 100', async () => {
    const { group } = await IconsApi.GenGroupInput({
      name: 'Combat',
      filePaths: ['/a.mp3', '/b.mp3']
    })
    expect(group.effects).toHaveLength(2)
    expect(group.effects[0]).toEqual({ name: '/a.mp3', path: '/a.mp3', volume: 100 })
    expect(group.effects[1]).toEqual({ name: '/b.mp3', path: '/b.mp3', volume: 100 })
  })

  it('splits the name on whitespace to produce tags', async () => {
    const { group } = await IconsApi.GenGroupInput({ name: 'Dark Forest', filePaths: [] })
    expect(group.tags).toEqual(['Dark', 'Forest'])
  })

  it('returns variant Default for 1 or 2 files with no loop keyword', async () => {
    const { group } = await IconsApi.GenGroupInput({
      name: 'X',
      filePaths: ['/a.mp3', '/b.mp3']
    })
    expect(group.variant).toBe('Default')
  })

  it('returns variant Rapid for more than 2 files', async () => {
    const { group } = await IconsApi.GenGroupInput({
      name: 'X',
      filePaths: ['/a.mp3', '/b.mp3', '/c.mp3']
    })
    expect(group.variant).toBe('Rapid')
  })

  it('returns variant Looping when a filepath contains "_loop"', async () => {
    const { group } = await IconsApi.GenGroupInput({
      name: 'X',
      filePaths: ['/ambient_loop.mp3']
    })
    expect(group.variant).toBe('Looping')
  })

  it('returns variant Looping when a filepath contains " loop"', async () => {
    const { group } = await IconsApi.GenGroupInput({
      name: 'X',
      filePaths: ['/ambient loop.mp3']
    })
    expect(group.variant).toBe('Looping')
  })

  it('prefers Looping over Rapid when more than 2 files but one contains loop', async () => {
    const { group } = await IconsApi.GenGroupInput({
      name: 'X',
      filePaths: ['/a_loop.mp3', '/b.mp3', '/c.mp3']
    })
    expect(group.variant).toBe('Looping')
  })
})

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

describe('IconsApi.Search', () => {
  it('returns icons from SearchIcons', () => {
    const { icons } = IconsApi.Search({ search: 'sword' })
    expect(icons).toEqual([stubIcon])
  })

  it('calls SearchIcons with the search string', () => {
    IconsApi.Search({ search: 'sword' })
    expect(mockIcons.SearchIcons).toHaveBeenCalledWith('sword')
  })

  it('returns an empty array when SearchIcons returns none', () => {
    mockIcons.SearchIcons.mockReturnValue([])
    const { icons } = IconsApi.Search({ search: 'zzz' })
    expect(icons).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// GetIcon
// ---------------------------------------------------------------------------

describe('IconsApi.GetIcon', () => {
  it('returns the icon from GetIcon', () => {
    const { icon } = IconsApi.GetIcon({ iconName: 'sword' })
    expect(icon).toEqual(stubIcon)
  })

  it('calls GetIcon with the icon name', () => {
    IconsApi.GetIcon({ iconName: 'sword' })
    expect(mockIcons.GetIcon).toHaveBeenCalledWith('sword')
  })

  it('returns undefined for an unknown icon name', () => {
    mockIcons.GetIcon.mockReturnValue(undefined)
    const { icon } = IconsApi.GetIcon({ iconName: 'nonexistent' })
    expect(icon).toBeUndefined()
  })
})
