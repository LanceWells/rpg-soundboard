import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { create } from 'zustand'
import type { ISoundGroup, SoundGroupSource, SoundGroupSequence } from 'src/apis/audio/types/items'
import type { GroupID } from 'src/apis/audio/types/groups'
import type { EffectID } from 'src/apis/audio/types/effects'

// ---------------------------------------------------------------------------
// Mock @renderer/rpgAudioEngine so Ctx enum loads without the real audio chain
// ---------------------------------------------------------------------------
vi.mock('@renderer/rpgAudioEngine', () => ({
  RpgAudio: vi.fn().mockImplementation(function (this: any) {
    this.State = 0
    this.play = vi.fn().mockResolvedValue(undefined)
    this.stop = vi.fn()
    this.fade = vi.fn()
    this.on = vi.fn()
    this.getDuration = vi.fn().mockResolvedValue(5)
    this.setVolume = vi.fn()
  }),
  Ctx: { Environmental: 0, Soundtrack: 1, Effectless: 2 },
  ListenerType: { Load: 0, Stop: 1, Play: 2 },
  RpgAudioState: { Loading: 0, Ready: 1, Playing: 2, Stopped: 3, Error: 4 }
}))

// ---------------------------------------------------------------------------
// Mock sound container utilities — use function(this) so new works
// ---------------------------------------------------------------------------
const mockContainers = vi.hoisted(() => {
  const created: any[] = []

  function createContainerProps(variant = 'Default') {
    return {
      Variant: variant,
      Volume: 100,
      LoadedEffectID: 'eff-aaa-bbb-ccc-ddd-eee' as EffectID,
      Play: vi.fn(),
      Stop: vi.fn(),
      ChangeVolume: vi.fn(),
      Fade: vi.fn(),
      GetDuration: vi.fn().mockResolvedValue(5),
      on: vi.fn(),
      playNextSong: vi.fn().mockResolvedValue(undefined),
      getActiveSong: vi.fn().mockReturnValue({ name: 'Test Song', targetVolume: 100, audio: {} })
    }
  }

  // NewSoundContainer is a factory (no `new`), so arrow function is correct
  const MockNewSoundContainer = vi.fn().mockImplementation(() => {
    const c = createContainerProps()
    created.push(c)
    return c
  })

  const MockSequenceSoundContainerFn = vi.fn().mockImplementation(function (this: any) {
    Object.assign(this, createContainerProps('Sequence'))
    this.Init = vi.fn().mockResolvedValue(this)
    created.push(this)
  })
  ;(MockSequenceSoundContainerFn as any).ApiToSetupElements = vi.fn().mockReturnValue([])

  return {
    created,
    createContainerProps,
    MockNewSoundContainer,
    MockSequenceSoundContainer: MockSequenceSoundContainerFn
  }
})

vi.mock('@renderer/utils/soundContainer/util', () => ({
  NewSoundContainer: mockContainers.MockNewSoundContainer
}))

vi.mock('@renderer/utils/soundContainer/variants/sequence', () => ({
  SequenceSoundContainer: mockContainers.MockSequenceSoundContainer
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeGroupId(n: number): GroupID {
  return `grp-${n.toString().padStart(3, '0')}-000-000-000-000` as GroupID
}

const baseIcon = { type: 'svg' as const, name: 'moon', foregroundColor: '#ffffff' }

function makeSourceGroup(
  id: GroupID,
  variant: ISoundGroup['variant'] = 'Default'
): SoundGroupSource {
  return { type: 'source', id, name: 'Test', icon: baseIcon, variant, tags: [], effects: [] }
}

function makeSequenceGroup(id: GroupID): SoundGroupSequence {
  return {
    type: 'sequence',
    id,
    name: 'Seq',
    icon: baseIcon,
    variant: 'Sequence',
    tags: [],
    sequence: []
  }
}

// ---------------------------------------------------------------------------
// window.audio mock
// ---------------------------------------------------------------------------
type AudioMock = { Groups: Record<string, ReturnType<typeof vi.fn>> }
let mockAudio: AudioMock

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
  mockContainers.created.length = 0
  mockContainers.MockNewSoundContainer.mockClear()
  mockContainers.MockSequenceSoundContainer.mockClear()
  ;(mockContainers.MockSequenceSoundContainer as any).ApiToSetupElements.mockClear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ---------------------------------------------------------------------------
// Store creation
// ---------------------------------------------------------------------------
import { createGroupSlice, GroupSlice } from '../groupSlice'
import { createSoundSlice, SoundSlice } from '../soundSlice'

type TestStore = GroupSlice & SoundSlice

function createStore(groups: ISoundGroup[] = []) {
  mockAudio.Groups.GetAll.mockReturnValue({ groups })
  return create<TestStore>()((...a) => ({
    ...createGroupSlice(...a),
    ...createSoundSlice(...a)
  }))
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('SoundSlice', () => {
  describe('initial state', () => {
    it('activeSoundtrack starts as null', () => {
      const store = createStore()
      expect(store.getState().activeSoundtrack).toBeNull()
    })
  })

  describe('playGroup()', () => {
    it('adds groupID to playingGroups after playing a source group', async () => {
      const gid = makeGroupId(1)
      const group = makeSourceGroup(gid)
      const store = createStore([group])

      mockAudio.Groups.Get.mockReturnValue({ group })
      mockAudio.Groups.GetSounds.mockResolvedValue({ variant: 'Default', sounds: [] })

      await store.getState().playGroup(gid)

      expect(store.getState().playingGroups).toContain(gid)
    })

    it('calls Play() on the created sound container', async () => {
      const gid = makeGroupId(1)
      const group = makeSourceGroup(gid)
      const store = createStore([group])

      mockAudio.Groups.Get.mockReturnValue({ group })
      mockAudio.Groups.GetSounds.mockResolvedValue({ variant: 'Default', sounds: [] })

      await store.getState().playGroup(gid)

      expect(mockContainers.created[0].Play).toHaveBeenCalledTimes(1)
    })

    it('does nothing when group is not found', async () => {
      const store = createStore()
      mockAudio.Groups.Get.mockReturnValue({ group: undefined })

      await store.getState().playGroup(makeGroupId(99))

      expect(store.getState().playingGroups).toHaveLength(0)
    })

    it('handles a sequence group by using SequenceSoundContainer', async () => {
      const gid = makeGroupId(1)
      const group = makeSequenceGroup(gid)
      const store = createStore([group])

      mockAudio.Groups.Get.mockReturnValue({ group })
      ;(mockContainers.MockSequenceSoundContainer as any).ApiToSetupElements.mockReturnValue([])

      await store.getState().playGroup(gid)

      expect(mockContainers.MockSequenceSoundContainer).toHaveBeenCalledTimes(1)
      expect(store.getState().playingGroups).toContain(gid)
    })

    it('stops existing soundtracks when playing a new soundtrack', async () => {
      const gid1 = makeGroupId(1)
      const gid2 = makeGroupId(2)
      const soundtrack1 = makeSourceGroup(gid1, 'Soundtrack')
      const soundtrack2 = makeSourceGroup(gid2, 'Soundtrack')
      const store = createStore([soundtrack1, soundtrack2])

      // Use per-ID routing so getGroup(gid1) still returns soundtrack1 after gid2 is played
      mockAudio.Groups.Get.mockImplementation(({ groupID }: { groupID: GroupID }) => {
        if (groupID === gid1) return { group: soundtrack1 }
        if (groupID === gid2) return { group: soundtrack2 }
        return { group: undefined }
      })
      mockAudio.Groups.GetSounds.mockResolvedValue({ variant: 'Soundtrack', sounds: [] })

      await store.getState().playGroup(gid1)
      const container1 = mockContainers.created[0]

      await store.getState().playGroup(gid2)

      // First container should have been stopped when the second soundtrack started
      expect(container1.Stop).toHaveBeenCalled()
    })
  })

  describe('stopGroup()', () => {
    it('calls Stop() on all handles for the group', async () => {
      const gid = makeGroupId(1)
      const group = makeSourceGroup(gid)
      const store = createStore([group])

      mockAudio.Groups.Get.mockReturnValue({ group })
      mockAudio.Groups.GetSounds.mockResolvedValue({ variant: 'Default', sounds: [] })

      await store.getState().playGroup(gid)
      const container = mockContainers.created[0]

      store.getState().stopGroup(gid)

      expect(container.Stop).toHaveBeenCalled()
    })

    it('does nothing if the group has no active handles', () => {
      const store = createStore()
      expect(() => store.getState().stopGroup(makeGroupId(99))).not.toThrow()
    })
  })

  describe('setMusicVolume()', () => {
    it('calls ChangeVolume on all active soundtrack containers', async () => {
      const gid = makeGroupId(1)
      const group = makeSourceGroup(gid, 'Soundtrack')
      const store = createStore([group])

      mockAudio.Groups.Get.mockReturnValue({ group })
      mockAudio.Groups.GetSounds.mockResolvedValue({ variant: 'Soundtrack', sounds: [] })
      await store.getState().playGroup(gid)

      store.getState().setMusicVolume(150)

      expect(mockContainers.created[0].ChangeVolume).toHaveBeenCalledWith(150)
    })

    it('updates activeSoundtrack.volume when active', async () => {
      const store = createStore()
      store.setState({
        activeSoundtrack: {
          groupID: makeGroupId(1),
          icon: baseIcon,
          groupName: 'Test',
          effectName: 'Song',
          volume: 100
        }
      })

      store.getState().setMusicVolume(80)

      expect(store.getState().activeSoundtrack?.volume).toBe(80)
    })
  })

  describe('getSounds()', () => {
    it('calls window.audio.Groups.GetSounds with the groupID', async () => {
      const gid = makeGroupId(1)
      const store = createStore()
      mockAudio.Groups.GetSounds.mockResolvedValue({ variant: 'Default', sounds: [] })

      const result = await store.getState().getSounds(gid)

      expect(mockAudio.Groups.GetSounds).toHaveBeenCalledWith({ groupID: gid })
      expect(result.variant).toBe('Default')
    })
  })
})
