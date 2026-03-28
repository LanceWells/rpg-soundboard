import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ISoundGroup, SoundGroupSequence, SoundGroupSource } from '../types/items'
import type { AudioApiConfig } from '../interface'

// vi.hoisted ensures this object is accessible from mock factories (which are hoisted above imports)
const mockState = vi.hoisted<{ config: AudioApiConfig }>(() => ({
  config: { Groups: [], version: 3, pinnedSearches: [] }
}))

vi.mock('../utils/config', () => ({
  AudioConfig: {
    get Config(): AudioApiConfig {
      return mockState.config
    },
    set Config(newConfig: AudioApiConfig) {
      mockState.config = newConfig
    },
    getGroup(id: string): ISoundGroup | undefined {
      return mockState.config.Groups.find((g) => g.id === id)
    },
    getAllGroups(): ISoundGroup[] {
      return [...mockState.config.Groups]
    }
  }
}))

vi.mock('./fs', () => ({
  saveSoundEffect: vi.fn((_groupID: string, srcPath: string) => ({
    path: `aud://board-data/fake-group/${srcPath.split(/[\\/]/).pop()}`,
    format: '.mp3' as const
  })),
  deleteFile: vi.fn(),
  getFileSize: vi.fn().mockResolvedValue(1.0)
}))

vi.mock('../../../utils/paths', () => ({
  GetAppDataPath: vi.fn(() => 'C:\\TestAppData\\rpg-soundboard')
}))

import { GroupsAudioAPI } from './groups'

const baseIcon = { type: 'svg' as const, name: 'moon', foregroundColor: '#ffffff' }
const makeSourceGroup = (
  id: string,
  overrides: Partial<SoundGroupSource> = {}
): SoundGroupSource => ({
  type: 'source',
  id: id as any,
  name: 'Test Group',
  icon: baseIcon,
  variant: 'Default',
  tags: [],
  effects: [],
  ...overrides
})
const makeSequenceGroup = (
  id: string,
  overrides: Partial<SoundGroupSequence> = {}
): SoundGroupSequence => ({
  type: 'sequence',
  id: id as any,
  name: 'Test Sequence',
  icon: baseIcon,
  variant: 'Sequence',
  tags: [],
  sequence: [],
  ...overrides
})

beforeEach(() => {
  mockState.config = { Groups: [], version: 3, pinnedSearches: [] }
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Get
// ---------------------------------------------------------------------------

describe('GroupsAudioAPI.Get', () => {
  it('returns the matching group', () => {
    const group = makeSourceGroup('grp-1-2-3-4-5')
    mockState.config.Groups.push(group)

    const { group: result } = GroupsAudioAPI.Get({ groupID: 'grp-1-2-3-4-5' as any })
    expect(result).toEqual(group)
  })

  it('returns undefined for a non-existent group ID', () => {
    const { group: result } = GroupsAudioAPI.Get({ groupID: 'grp-nonexistent' as any })
    expect(result).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// GetAll
// ---------------------------------------------------------------------------

describe('GroupsAudioAPI.GetAll', () => {
  it('returns all stored groups', () => {
    mockState.config.Groups.push(makeSourceGroup('grp-1-1-1-1-1'), makeSourceGroup('grp-2-2-2-2-2'))

    const { groups } = GroupsAudioAPI.GetAll()
    expect(groups).toHaveLength(2)
  })

  it('returns an empty array when no groups exist', () => {
    const { groups } = GroupsAudioAPI.GetAll()
    expect(groups).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

describe('GroupsAudioAPI.Create', () => {
  it('returns a new source group with the correct fields', () => {
    const { group } = GroupsAudioAPI.Create({
      name: 'Combat',
      icon: baseIcon,
      variant: 'Rapid',
      tags: ['combat', 'action'],
      effects: [{ name: 'slash', path: '/audio/slash.mp3', volume: 100 }],
      type: 'source'
    })

    expect(group.type).toBe('source')
    expect(group.name).toBe('Combat')
    expect(group.variant).toBe('Rapid')
    expect(group.tags).toEqual(['combat', 'action'])
    expect(group.id).toMatch(/^grp-/)
    expect(group.effects).toHaveLength(1)
  })

  it('assigns a unique ID to the new group', () => {
    const { group: g1 } = GroupsAudioAPI.Create({
      name: 'A',
      icon: baseIcon,
      variant: 'Default',
      tags: [],
      effects: [],
      type: 'source'
    })
    const { group: g2 } = GroupsAudioAPI.Create({
      name: 'B',
      icon: baseIcon,
      variant: 'Default',
      tags: [],
      effects: [],
      type: 'source'
    })

    expect(g1.id).not.toBe(g2.id)
  })

  it('adds the new group to the config', () => {
    GroupsAudioAPI.Create({
      name: 'X',
      icon: baseIcon,
      variant: 'Default',
      tags: [],
      effects: [],
      type: 'source'
    })
    expect(mockState.config.Groups).toHaveLength(1)
  })

  it('assigns unique IDs to each effect', () => {
    const { group } = GroupsAudioAPI.Create({
      name: 'Multi',
      icon: baseIcon,
      variant: 'Default',
      tags: [],
      effects: [
        { name: 'a', path: '/a.mp3', volume: 100 },
        { name: 'b', path: '/b.mp3', volume: 100 }
      ],
      type: 'source'
    })

    expect(group.effects[0].id).not.toBe(group.effects[1].id)
    expect(group.effects[0].id).toMatch(/^eff-/)
  })

  it('calls the AudioConfig.Config setter with the updated config', async () => {
    const { AudioConfig } = await import('../utils/config')
    const setterSpy = vi.spyOn(AudioConfig, 'Config', 'set')

    GroupsAudioAPI.Create({
      name: 'X',
      icon: baseIcon,
      variant: 'Default',
      tags: ['combat'],
      effects: [{ name: 'slash', path: '/slash.mp3', volume: 100 }],
      type: 'source'
    })

    expect(setterSpy).toHaveBeenCalledOnce()
    expect(setterSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        Groups: expect.arrayContaining([
          expect.objectContaining({
            name: 'X',
            icon: baseIcon,
            variant: 'Default',
            tags: ['combat'],
            type: 'source',
            effects: expect.arrayContaining([
              expect.objectContaining({
                name: 'slash',
                volume: 100,
                path: expect.stringContaining('slash')
              })
            ])
          })
        ])
      })
    )
  })

  it('calls saveSoundEffect once per effect', async () => {
    const { saveSoundEffect } = vi.mocked(await import('./fs'))
    GroupsAudioAPI.Create({
      name: 'X',
      icon: baseIcon,
      variant: 'Default',
      tags: [],
      effects: [
        { name: 'a', path: '/a.mp3', volume: 100 },
        { name: 'b', path: '/b.mp3', volume: 100 }
      ],
      type: 'source'
    })

    expect(saveSoundEffect).toHaveBeenCalledTimes(2)
  })
})

// ---------------------------------------------------------------------------
// CreateBulk
// ---------------------------------------------------------------------------

describe('GroupsAudioAPI.CreateBulk', () => {
  it('creates all provided groups', async () => {
    await GroupsAudioAPI.CreateBulk({
      groups: [
        { name: 'A', icon: baseIcon, variant: 'Default', tags: [], effects: [], type: 'source' },
        { name: 'B', icon: baseIcon, variant: 'Default', tags: [], effects: [], type: 'source' }
      ],
      commonTags: []
    })

    expect(mockState.config.Groups).toHaveLength(2)
  })

  it("merges common tags with each group's own tags", async () => {
    await GroupsAudioAPI.CreateBulk({
      groups: [
        {
          name: 'A',
          icon: baseIcon,
          variant: 'Default',
          tags: ['combat'],
          effects: [],
          type: 'source'
        }
      ],
      commonTags: ['shared']
    })

    expect(mockState.config.Groups[0].tags).toContain('combat')
    expect(mockState.config.Groups[0].tags).toContain('shared')
  })

  it('calls GroupsAudioAPI.Create once per group with all fields', async () => {
    const createSpy = vi.spyOn(GroupsAudioAPI, 'Create')
    const altIcon = { type: 'svg' as const, name: 'sword', foregroundColor: '#ff0000' }
    const effectA = { name: 'slash', path: '/slash.mp3', volume: 80 }
    const effectB = { name: 'boom', path: '/boom.mp3', volume: 50 }

    await GroupsAudioAPI.CreateBulk({
      groups: [
        {
          name: 'A',
          icon: baseIcon,
          variant: 'Rapid',
          tags: ['combat'],
          effects: [effectA],
          type: 'source'
        },
        {
          name: 'B',
          icon: altIcon,
          variant: 'Looping',
          tags: ['ambient'],
          effects: [effectB],
          type: 'source'
        }
      ],
      commonTags: []
    })

    expect(createSpy).toHaveBeenCalledTimes(2)
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'A',
        icon: baseIcon,
        variant: 'Rapid',
        tags: expect.arrayContaining(['combat']),
        effects: expect.arrayContaining([expect.objectContaining(effectA)])
      })
    )
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'B',
        icon: altIcon,
        variant: 'Looping',
        tags: expect.arrayContaining(['ambient']),
        effects: expect.arrayContaining([expect.objectContaining(effectB)])
      })
    )
  })

  it('deduplicates tags (same tag in group and commonTags)', async () => {
    await GroupsAudioAPI.CreateBulk({
      groups: [
        {
          name: 'A',
          icon: baseIcon,
          variant: 'Default',
          tags: ['combat'],
          effects: [],
          type: 'source'
        }
      ],
      commonTags: ['combat']
    })

    const tags = mockState.config.Groups[0].tags
    expect(tags.filter((t) => t === 'combat')).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

describe('GroupsAudioAPI.Update', () => {
  it('throws when the group does not exist', () => {
    expect(() =>
      GroupsAudioAPI.Update({
        groupID: 'grp-nonexistent' as any,
        name: 'X',
        icon: baseIcon,
        variant: 'Default',
        tags: [],
        effects: [],
        type: 'source'
      })
    ).toThrow('Could not find matching group')
  })

  it('throws when attempting to update a sequence group', () => {
    mockState.config.Groups.push(makeSequenceGroup('grp-1-2-3-4-5'))

    expect(() =>
      GroupsAudioAPI.Update({
        groupID: 'grp-1-2-3-4-5' as any,
        name: 'X',
        icon: baseIcon,
        variant: 'Default',
        tags: [],
        effects: [],
        type: 'source'
      })
    ).toThrow('Cannot update non-source group')
  })

  it('updates name, variant, and tags on an existing source group', () => {
    mockState.config.Groups.push(makeSourceGroup('grp-1-2-3-4-5'))

    const { group } = GroupsAudioAPI.Update({
      groupID: 'grp-1-2-3-4-5' as any,
      name: 'Updated Name',
      icon: baseIcon,
      variant: 'Looping',
      tags: ['ambient'],
      effects: [],
      type: 'source'
    })

    expect(group.name).toBe('Updated Name')
    expect(group.variant).toBe('Looping')
    expect(group.tags).toEqual(['ambient'])
  })

  it('preserves existing effects that are still in the request', () => {
    const existingEffect = {
      id: 'eff-1-1-1-1-1' as any,
      path: 'aud://board-data/grp-1/1.mp3',
      format: '.mp3' as any,
      volume: 100,
      name: 'sound1'
    }
    mockState.config.Groups.push(makeSourceGroup('grp-1-2-3-4-5', { effects: [existingEffect] }))

    const { group } = GroupsAudioAPI.Update({
      groupID: 'grp-1-2-3-4-5' as any,
      name: 'X',
      icon: baseIcon,
      variant: 'Default',
      tags: [],
      effects: [{ path: 'aud://board-data/grp-1/1.mp3', volume: 80, name: 'sound1' }],
      type: 'source'
    })

    expect(group.effects).toHaveLength(1)
    expect(group.effects[0].id).toBe('eff-1-1-1-1-1')
    expect(group.effects[0].volume).toBe(80)
  })

  it('calls the AudioConfig.Config setter with all updated fields', async () => {
    const { AudioConfig } = await import('../utils/config')
    const setterSpy = vi.spyOn(AudioConfig, 'Config', 'set')
    const altIcon = { type: 'svg' as const, name: 'sword', foregroundColor: '#ff0000' }
    const existingEffect = {
      id: 'eff-1-1-1-1-1' as any,
      path: 'aud://board-data/grp-1-2-3-4-5/1.mp3',
      format: '.mp3' as any,
      volume: 100,
      name: 'battle'
    }
    mockState.config.Groups.push(makeSourceGroup('grp-1-2-3-4-5', { effects: [existingEffect] }))

    GroupsAudioAPI.Update({
      groupID: 'grp-1-2-3-4-5' as any,
      name: 'Updated',
      icon: altIcon,
      variant: 'Looping',
      tags: ['ambient'],
      effects: [{ path: 'aud://board-data/grp-1-2-3-4-5/1.mp3', volume: 75, name: 'battle' }],
      type: 'source'
    })

    expect(setterSpy).toHaveBeenCalledOnce()
    expect(setterSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        Groups: expect.arrayContaining([
          expect.objectContaining({
            name: 'Updated',
            icon: altIcon,
            variant: 'Looping',
            tags: ['ambient'],
            type: 'source',
            effects: expect.arrayContaining([
              expect.objectContaining({
                name: 'battle',
                volume: 75,
                path: expect.stringContaining('grp-1-2-3-4-5')
              })
            ])
          })
        ])
      })
    )
  })
})

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

describe('GroupsAudioAPI.Delete', () => {
  it('removes the group from the config', () => {
    mockState.config.Groups.push(makeSourceGroup('grp-1-2-3-4-5'))

    GroupsAudioAPI.Delete({ groupID: 'grp-1-2-3-4-5' as any })

    expect(mockState.config.Groups).toHaveLength(0)
  })

  it('does not throw when deleting a non-existent group', () => {
    expect(() => GroupsAudioAPI.Delete({ groupID: 'grp-nonexistent' as any })).not.toThrow()
  })

  it('only removes the targeted group', () => {
    mockState.config.Groups.push(makeSourceGroup('grp-1-1-1-1-1'), makeSourceGroup('grp-2-2-2-2-2'))

    GroupsAudioAPI.Delete({ groupID: 'grp-1-1-1-1-1' as any })

    expect(mockState.config.Groups).toHaveLength(1)
    expect(mockState.config.Groups[0].id).toBe('grp-2-2-2-2-2')
  })
})

// ---------------------------------------------------------------------------
// CreateSequence
// ---------------------------------------------------------------------------

describe('GroupsAudioAPI.CreateSequence', () => {
  it('creates a sequence group with the correct type and name', () => {
    const { sequence } = GroupsAudioAPI.CreateSequence({
      name: 'Intro',
      icon: baseIcon,
      tags: ['narrative'],
      sequence: []
    })

    expect(sequence.type).toBe('sequence')
    expect(sequence.name).toBe('Intro')
    expect(sequence.variant).toBe('Sequence')
    expect(sequence.id).toMatch(/^grp-/)
  })

  it('creates delay and group elements from the request', () => {
    const { sequence } = GroupsAudioAPI.CreateSequence({
      name: 'Complex',
      icon: baseIcon,
      tags: [],
      sequence: [
        { type: 'delay', id: 'seq-0-0-0-0-0' as any, msToDelay: 2000 },
        { type: 'group', id: 'seq-0-0-0-0-1' as any, groupID: 'grp-1-2-3-4-5' as any }
      ]
    })

    expect(sequence.sequence).toHaveLength(2)
    expect(sequence.sequence[0].type).toBe('delay')
    expect(sequence.sequence[1].type).toBe('group')
  })

  it('assigns new IDs to each sequence element', () => {
    const { sequence } = GroupsAudioAPI.CreateSequence({
      name: 'X',
      icon: baseIcon,
      tags: [],
      sequence: [
        { type: 'delay', id: 'seq-0-0-0-0-0' as any, msToDelay: 500 },
        { type: 'delay', id: 'seq-0-0-0-0-1' as any, msToDelay: 500 }
      ]
    })

    expect(sequence.sequence[0].id).toMatch(/^seq-/)
    expect(sequence.sequence[0].id).not.toBe(sequence.sequence[1].id)
  })

  it('throws for an unknown sequence element type', () => {
    expect(() =>
      GroupsAudioAPI.CreateSequence({
        name: 'Bad',
        icon: baseIcon,
        tags: [],
        sequence: [{ type: 'unknown' } as any]
      })
    ).toThrow('Unknown type')
  })
})

// ---------------------------------------------------------------------------
// UpdateSequence
// ---------------------------------------------------------------------------

describe('GroupsAudioAPI.UpdateSequence', () => {
  it('throws when the group does not exist', () => {
    expect(() =>
      GroupsAudioAPI.UpdateSequence({
        groupID: 'grp-nonexistent' as any,
        name: 'X',
        icon: baseIcon,
        tags: [],
        sequence: []
      })
    ).toThrow('Could not find matching group')
  })

  it('throws when attempting to update a source group as a sequence', () => {
    mockState.config.Groups.push(makeSourceGroup('grp-1-2-3-4-5'))

    expect(() =>
      GroupsAudioAPI.UpdateSequence({
        groupID: 'grp-1-2-3-4-5' as any,
        name: 'X',
        icon: baseIcon,
        tags: [],
        sequence: []
      })
    ).toThrow('Cannot update non-sequence group')
  })

  it('updates sequence name and tags', () => {
    mockState.config.Groups.push(makeSequenceGroup('grp-1-2-3-4-5'))

    const { sequence } = GroupsAudioAPI.UpdateSequence({
      groupID: 'grp-1-2-3-4-5' as any,
      name: 'New Name',
      icon: baseIcon,
      tags: ['updated'],
      sequence: []
    })

    expect(sequence.name).toBe('New Name')
    expect(sequence.tags).toEqual(['updated'])
  })
})

// ---------------------------------------------------------------------------
// GetSounds
// ---------------------------------------------------------------------------

describe('GroupsAudioAPI.GetSounds', () => {
  it('returns an empty sounds array for a sequence group', async () => {
    mockState.config.Groups.push(makeSequenceGroup('grp-1-2-3-4-5'))

    const result = await GroupsAudioAPI.GetSounds({ groupID: 'grp-1-2-3-4-5' as any })

    expect(result.sounds).toEqual([])
  })

  it('throws when a source group has no effects', async () => {
    mockState.config.Groups.push(makeSourceGroup('grp-1-2-3-4-5', { effects: [] }))

    await expect(GroupsAudioAPI.GetSounds({ groupID: 'grp-1-2-3-4-5' as any })).rejects.toThrow(
      'Could not find group with effects'
    )
  })

  it('returns sounds with useHtml5=false for files under 2 MB', async () => {
    const { getFileSize } = await import('./fs')
    vi.mocked(getFileSize).mockResolvedValue(1.0) // 1 MB < 2 MB threshold

    mockState.config.Groups.push(
      makeSourceGroup('grp-1-2-3-4-5', {
        effects: [
          {
            id: 'eff-1-1-1-1-1' as any,
            path: 'aud://board-data/grp/1.mp3',
            format: '.mp3',
            volume: 100,
            name: 'sound'
          }
        ]
      })
    )

    const result = await GroupsAudioAPI.GetSounds({ groupID: 'grp-1-2-3-4-5' as any })

    expect(result.sounds).toHaveLength(1)
    expect(result.sounds[0].useHtml5).toBe(false)
  })

  it('returns sounds with useHtml5=true for files over 2 MB', async () => {
    const { getFileSize } = await import('./fs')
    vi.mocked(getFileSize).mockResolvedValue(3.0) // 3 MB > 2 MB threshold

    mockState.config.Groups.push(
      makeSourceGroup('grp-1-2-3-4-5', {
        effects: [
          {
            id: 'eff-1-1-1-1-1' as any,
            path: 'aud://board-data/grp/1.mp3',
            format: '.mp3',
            volume: 100,
            name: 'sound'
          }
        ]
      })
    )

    const result = await GroupsAudioAPI.GetSounds({ groupID: 'grp-1-2-3-4-5' as any })

    expect(result.sounds[0].useHtml5).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// GetPinnedSearches / UpdatePinnedSearches
// ---------------------------------------------------------------------------

describe('GroupsAudioAPI.GetPinnedSearches', () => {
  it('returns an empty array by default', () => {
    const { pinnedSearches } = GroupsAudioAPI.GetPinnedSearches({})
    expect(pinnedSearches).toEqual([])
  })

  it('returns the stored pinned searches', () => {
    mockState.config.pinnedSearches = ['combat', 'tavern']

    const { pinnedSearches } = GroupsAudioAPI.GetPinnedSearches({})
    expect(pinnedSearches).toEqual(['combat', 'tavern'])
  })
})

describe('GroupsAudioAPI.UpdatePinnedSearches', () => {
  it('replaces pinned searches with the new list', () => {
    mockState.config.pinnedSearches = ['old']

    GroupsAudioAPI.UpdatePinnedSearches({ newPinnedSearches: ['forest', 'dungeon'] })

    expect(mockState.config.pinnedSearches).toEqual(['forest', 'dungeon'])
  })

  it('can clear all pinned searches', () => {
    mockState.config.pinnedSearches = ['combat']

    GroupsAudioAPI.UpdatePinnedSearches({ newPinnedSearches: [] })

    expect(mockState.config.pinnedSearches).toEqual([])
  })
})
