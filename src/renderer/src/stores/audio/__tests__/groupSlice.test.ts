import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { create } from 'zustand'
import type { ISoundGroup, SoundGroupSource, SoundGroupSequence } from 'src/apis/audio/types/items'
import type { GroupID } from 'src/apis/audio/types/groups'
import { createGroupSlice, GroupSlice, getDefaultGroup, getDefaultSequence } from '../groupSlice'

// ---------------------------------------------------------------------------
// Types for the window.audio mock
// ---------------------------------------------------------------------------
type MockAudio = {
  Groups: {
    GetAll: ReturnType<typeof vi.fn>
    GetPinnedSearches: ReturnType<typeof vi.fn>
    Get: ReturnType<typeof vi.fn>
    Create: ReturnType<typeof vi.fn>
    CreateSequence: ReturnType<typeof vi.fn>
    Update: ReturnType<typeof vi.fn>
    UpdateSequence: ReturnType<typeof vi.fn>
    Delete: ReturnType<typeof vi.fn>
    GetSounds: ReturnType<typeof vi.fn>
    UpdatePinnedSearches: ReturnType<typeof vi.fn>
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeGroupId(n: number): GroupID {
  return `grp-${n.toString().padStart(3, '0')}-000-000-000-000` as GroupID
}

const baseIcon = { type: 'svg' as const, name: 'moon', foregroundColor: '#ffffff' }

function makeGroup(id: GroupID, overrides: Partial<SoundGroupSource> = {}): SoundGroupSource {
  return {
    type: 'source',
    id,
    name: 'Test Group',
    icon: baseIcon,
    variant: 'Default',
    tags: [],
    effects: [],
    ...overrides
  }
}

// ---------------------------------------------------------------------------
// window.audio mock — set up fresh before each test, torn down after
// ---------------------------------------------------------------------------
let mockAudio: MockAudio

beforeEach(() => {
  mockAudio = {
    Groups: {
      GetAll: vi.fn().mockReturnValue({ groups: [] }),
      GetPinnedSearches: vi.fn().mockReturnValue({ pinnedSearches: [] }),
      Get: vi.fn(),
      Create: vi.fn(),
      CreateSequence: vi.fn(),
      Update: vi.fn(),
      UpdateSequence: vi.fn(),
      Delete: vi.fn(),
      GetSounds: vi.fn().mockResolvedValue({ variant: 'Default', sounds: [] }),
      UpdatePinnedSearches: vi.fn().mockReturnValue({})
    }
  }
  vi.stubGlobal('audio', mockAudio)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ---------------------------------------------------------------------------
// Store factory — configures the mock's initial return values then creates
// a fresh, isolated Zustand store using only the group slice.
// ---------------------------------------------------------------------------
function createStore(groups: ISoundGroup[] = [], pinnedSearches: string[] = []) {
  mockAudio.Groups.GetAll.mockReturnValue({ groups })
  mockAudio.Groups.GetPinnedSearches.mockReturnValue({ pinnedSearches })
  return create<GroupSlice>()(createGroupSlice)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('GroupSlice', () => {
  describe('initialization', () => {
    it('loads groups from window.audio.Groups.GetAll()', () => {
      const g = makeGroup(makeGroupId(1))
      const store = createStore([g])
      expect(store.getState().groups).toHaveLength(1)
      expect(store.getState().groups[0].id).toBe(g.id)
    })

    it('loads pinnedSearches from window.audio.Groups.GetPinnedSearches()', () => {
      const store = createStore([], ['combat', 'tavern'])
      expect(store.getState().pinnedSearches).toEqual(['combat', 'tavern'])
    })

    it('initializes searchText as empty string', () => {
      const store = createStore()
      expect(store.getState().searchText).toBe('')
    })

    it('initializes sorting with empty soundTypes and empty search', () => {
      const store = createStore()
      expect(store.getState().sorting.soundTypes).toEqual([])
      expect(store.getState().sorting.search).toBe('')
    })
  })

  describe('getGroup()', () => {
    it('returns the group from window.audio.Groups.Get()', () => {
      const g = makeGroup(makeGroupId(1))
      const store = createStore([g])
      mockAudio.Groups.Get.mockReturnValue({ group: g })
      const result = store.getState().getGroup(g.id)
      expect(result).toEqual(g)
    })

    it('throws when the group is not found', () => {
      const store = createStore()
      mockAudio.Groups.Get.mockReturnValue({ group: undefined })
      expect(() => store.getState().getGroup(makeGroupId(99))).toThrow()
    })
  })

  describe('getGroupSource()', () => {
    it('returns the group when it is a source type', () => {
      const g = makeGroup(makeGroupId(1))
      const store = createStore([g])
      mockAudio.Groups.Get.mockReturnValue({ group: g })
      const result = store.getState().getGroupSource(g.id)
      expect(result.type).toBe('source')
    })

    it('throws when the group is a sequence type', () => {
      const g: SoundGroupSequence = {
        type: 'sequence',
        id: makeGroupId(1),
        name: 'Seq',
        icon: baseIcon,
        variant: 'Sequence',
        tags: [],
        sequence: []
      }
      const store = createStore([g])
      mockAudio.Groups.Get.mockReturnValue({ group: g })
      expect(() => store.getState().getGroupSource(g.id)).toThrow()
    })
  })

  describe('addGroup()', () => {
    it('calls window.audio.Groups.Create and updates groups', () => {
      const g = makeGroup(makeGroupId(1))
      const store = createStore()
      mockAudio.Groups.Create.mockReturnValue({ group: g })
      mockAudio.Groups.GetAll.mockReturnValue({ groups: [g] })

      store.getState().addGroup({
        name: g.name,
        icon: g.icon,
        variant: g.variant,
        tags: [],
        effects: [],
        type: 'source'
      })

      expect(mockAudio.Groups.Create).toHaveBeenCalledTimes(1)
      expect(store.getState().groups).toHaveLength(1)
    })
  })

  describe('deleteGroup()', () => {
    it('calls window.audio.Groups.Delete and updates groups', () => {
      const g = makeGroup(makeGroupId(1))
      const store = createStore([g])
      mockAudio.Groups.Delete.mockReturnValue({})
      mockAudio.Groups.GetAll.mockReturnValue({ groups: [] })

      store.getState().deleteGroup(g.id)

      expect(mockAudio.Groups.Delete).toHaveBeenCalledWith({ groupID: g.id })
      expect(store.getState().groups).toHaveLength(0)
    })
  })

  describe('updateGroup()', () => {
    it('calls window.audio.Groups.Update and refreshes groups', () => {
      const g = makeGroup(makeGroupId(1))
      const updated = makeGroup(makeGroupId(1), { name: 'Updated' })
      const store = createStore([g])
      mockAudio.Groups.Update.mockReturnValue({ group: updated })
      mockAudio.Groups.GetAll.mockReturnValue({ groups: [updated] })

      store.getState().updateGroup({
        groupID: g.id,
        name: 'Updated',
        icon: g.icon,
        variant: g.variant,
        tags: [],
        effects: [],
        type: 'source'
      })

      expect(mockAudio.Groups.Update).toHaveBeenCalledTimes(1)
      expect(store.getState().groups[0].name).toBe('Updated')
    })
  })

  describe('getTags()', () => {
    it('returns a Set of all tags from all groups', () => {
      const g1 = makeGroup(makeGroupId(1), { tags: ['combat', 'indoor'] })
      const g2 = makeGroup(makeGroupId(2), { tags: ['outdoor', 'combat'] })
      const store = createStore([g1, g2])
      mockAudio.Groups.GetAll.mockReturnValue({ groups: [g1, g2] })

      const tags = store.getState().getTags()
      expect(tags).toBeInstanceOf(Set)
      expect(tags.has('combat')).toBe(true)
      expect(tags.has('indoor')).toBe(true)
      expect(tags.has('outdoor')).toBe(true)
      expect(tags.size).toBe(3)
    })

    it('returns an empty Set when no groups have tags', () => {
      const store = createStore()
      mockAudio.Groups.GetAll.mockReturnValue({ groups: [] })
      expect(store.getState().getTags().size).toBe(0)
    })
  })

  describe('toggleVariantFilter()', () => {
    it('adds a variant to soundTypes when not present', () => {
      const store = createStore()
      store.getState().toggleVariantFilter('Default')
      expect(store.getState().sorting.soundTypes).toContain('Default')
    })

    it('removes a variant from soundTypes when already present', () => {
      const store = createStore()
      store.getState().toggleVariantFilter('Default')
      store.getState().toggleVariantFilter('Default')
      expect(store.getState().sorting.soundTypes).not.toContain('Default')
    })

    it('can have multiple variants active at once', () => {
      const store = createStore()
      store.getState().toggleVariantFilter('Default')
      store.getState().toggleVariantFilter('Looping')
      expect(store.getState().sorting.soundTypes).toContain('Default')
      expect(store.getState().sorting.soundTypes).toContain('Looping')
    })
  })

  describe('setSorting()', () => {
    it('sets a sort order and clears it back to undefined', () => {
      const store = createStore()
      store.getState().setSorting({ type: 'name', order: 'asc' })
      expect(store.getState().sorting.sorting).toEqual({ type: 'name', order: 'asc' })
      store.getState().setSorting(undefined)
      expect(store.getState().sorting.sorting).toBeUndefined()
    })

    it('can set sort order to desc', () => {
      const store = createStore()
      store.getState().setSorting({ type: 'name', order: 'desc' })
      expect(store.getState().sorting.sorting?.order).toBe('desc')
    })
  })

  describe('searchForGroups()', () => {
    it('updates sorting.search', () => {
      const store = createStore()
      store.getState().searchForGroups('dragon', ['source'])
      expect(store.getState().sorting.search).toBe('dragon')
    })

    it('returns all groups when searchText is empty', () => {
      const groups = [makeGroup(makeGroupId(1)), makeGroup(makeGroupId(2))]
      const store = createStore(groups)
      mockAudio.Groups.GetAll.mockReturnValue({ groups })
      store.getState().searchForGroups('', ['source'])
      expect(store.getState().soughtGroups).toHaveLength(2)
    })

    it('filters results when searchText matches group names', () => {
      const g1 = makeGroup(makeGroupId(1), { name: 'Dragon Roar' })
      const g2 = makeGroup(makeGroupId(2), { name: 'Tavern Music' })
      const store = createStore([g1, g2])
      mockAudio.Groups.GetAll.mockReturnValue({ groups: [g1, g2] })
      store.getState().searchForGroups('Dragon', ['source'])
      expect(store.getState().soughtGroups.some((g) => g.name === 'Dragon Roar')).toBe(true)
    })
  })

  describe('setSearchText()', () => {
    it('updates searchText immediately', () => {
      const store = createStore()
      store.getState().setSearchText('test', true)
      expect(store.getState().searchText).toBe('test')
    })

    it('calls searchForGroups immediately when skipDebounce is true', () => {
      const groups = [makeGroup(makeGroupId(1), { name: 'Forest' })]
      const store = createStore(groups)
      mockAudio.Groups.GetAll.mockReturnValue({ groups })
      store.getState().setSearchText('', true)
      expect(store.getState().soughtGroups).toHaveLength(1)
    })
  })

  describe('updatePinnedSearches()', () => {
    it('calls window.audio.Groups.UpdatePinnedSearches with the new searches', () => {
      const store = createStore()
      mockAudio.Groups.GetAll.mockReturnValue({ groups: [] })
      store.getState().updatePinnedSearches(['combat', 'exploration'])
      expect(mockAudio.Groups.UpdatePinnedSearches).toHaveBeenCalledWith({
        newPinnedSearches: ['combat', 'exploration']
      })
    })
  })

  describe('updateSorting()', () => {
    it('sorts groups ascending by name', () => {
      const gA = makeGroup(makeGroupId(1), { name: 'Alpha' })
      const gB = makeGroup(makeGroupId(2), { name: 'Beta' })
      const gC = makeGroup(makeGroupId(3), { name: 'Gamma' })
      const store = createStore([gC, gA, gB])
      mockAudio.Groups.GetAll.mockReturnValue({ groups: [gC, gA, gB] })

      store.getState().setSorting({ type: 'name', order: 'asc' })

      const names = store.getState().soughtGroups.map((g) => g.name)
      expect(names).toEqual(['Alpha', 'Beta', 'Gamma'])
    })

    it('sorts groups descending by name', () => {
      const gA = makeGroup(makeGroupId(1), { name: 'Alpha' })
      const gB = makeGroup(makeGroupId(2), { name: 'Beta' })
      const gC = makeGroup(makeGroupId(3), { name: 'Gamma' })
      const store = createStore([gA, gB, gC])
      mockAudio.Groups.GetAll.mockReturnValue({ groups: [gA, gB, gC] })

      store.getState().setSorting({ type: 'name', order: 'desc' })

      const names = store.getState().soughtGroups.map((g) => g.name)
      expect(names).toEqual(['Gamma', 'Beta', 'Alpha'])
    })

    it('filters by variant when soundTypes is set', () => {
      const gDef = makeGroup(makeGroupId(1), { variant: 'Default' })
      const gLoop = makeGroup(makeGroupId(2), { variant: 'Looping' })
      const store = createStore([gDef, gLoop])
      mockAudio.Groups.GetAll.mockReturnValue({ groups: [gDef, gLoop] })

      store.getState().toggleVariantFilter('Looping')

      const variants = store.getState().soughtGroups.map((g) => g.variant)
      expect(variants).toEqual(['Looping'])
    })
  })

  describe('getDefaultGroup()', () => {
    it('returns a group with type "source"', () => {
      expect(getDefaultGroup().type).toBe('source')
    })

    it('returns a group with empty effects', () => {
      expect(getDefaultGroup().effects).toEqual([])
    })

    it('returns a group with variant "Default"', () => {
      expect(getDefaultGroup().variant).toBe('Default')
    })
  })

  describe('getDefaultSequence()', () => {
    it('returns an object with an empty sequence array', () => {
      expect(getDefaultSequence().sequence).toEqual([])
    })

    it('returns an object with an empty name', () => {
      expect(getDefaultSequence().name).toBe('')
    })
  })
})
