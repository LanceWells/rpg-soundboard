import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { create } from 'zustand'
import type { ISoundGroup, SoundGroupSource, SoundGroupSequence } from 'src/apis/audio/types/items'
import type { GroupID } from 'src/apis/audio/types/groups'

// ---------------------------------------------------------------------------
// Mock @renderer/rpgAudioEngine — prevents real AudioContext instantiation
// ---------------------------------------------------------------------------
vi.mock('@renderer/rpgAudioEngine', () => ({
  RpgAudio: vi.fn(),
  Ctx: { Environmental: 0, Soundtrack: 1, Effectless: 2 },
  ListenerType: { Load: 0, Stop: 1, Play: 2 },
  RpgAudioState: { Loading: 0, Ready: 1, Playing: 2, Stopped: 3, Error: 4 }
}))

// ---------------------------------------------------------------------------
// Mock SoundscapeManager — soundSlice delegates all playback to it
// ---------------------------------------------------------------------------
const mockSoundscapeState = vi.hoisted(() => {
  let inst: any = null

  const MockSoundscapeManager = vi.fn().mockImplementation(function (this: any) {
    const listeners: Record<number, ((e: any) => void)[]> = {}
    this.play = vi.fn().mockResolvedValue(undefined)
    this.stop = vi.fn()
    this.playingGroups = vi.fn().mockReturnValue([])
    this.playNextSong = vi.fn()
    this.setMusicVolume = vi.fn()
    this.fade = vi.fn()
    this.on = vi.fn().mockImplementation((type: number, cb: (e: any) => void) => {
      listeners[type] = listeners[type] ?? []
      listeners[type].push(cb)
      return this // on() returns this for chaining
    })
    this._fire = (type: number) => {
      listeners[type]?.forEach((cb) => cb(this))
    }
    this._activeSoundtrack = null
    Object.defineProperty(this, 'ActiveSoundtrack', {
      get() {
        return this._activeSoundtrack
      },
      configurable: true
    })
    Object.defineProperty(this, 'ActiveSoundtrackID', {
      get() {
        return this._activeSoundtrack?.id ?? null
      },
      configurable: true
    })
    inst = this
  })

  return {
    MockSoundscapeManager,
    getInstance: () => inst,
    reset() {
      inst = null
      MockSoundscapeManager.mockClear()
    }
  }
})

vi.mock('@renderer/rpgAudioEngine/manager/soundscapeManager', () => ({
  SoundscapeManager: mockSoundscapeState.MockSoundscapeManager
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
  mockSoundscapeState.reset()

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
    it('delegates to soundscape.play() with the groupID', async () => {
      const gid = makeGroupId(1)
      const store = createStore()
      await store.getState().playGroup(gid)
      expect(mockSoundscapeState.getInstance().play).toHaveBeenCalledWith(gid)
    })

    it('updates playingGroups when the soundscape fires AnySoundsStarted', () => {
      const gid = makeGroupId(1)
      const store = createStore()
      const soundscape = mockSoundscapeState.getInstance()
      soundscape.playingGroups.mockReturnValue([gid])
      soundscape._fire(ManagerListenerType.AnySoundsStarted)
      expect(store.getState().playingGroups).toContain(gid)
    })

    it('does nothing when group is not found', async () => {
      const store = createStore()
      mockAudio.Groups.Get.mockReturnValue({ group: undefined })
      await store.getState().playGroup(makeGroupId(99))
      // soundscape.play() is still called — routing/guard is inside SoundscapeManager
      expect(store.getState().playingGroups).toHaveLength(0)
    })

    it('delegates play to soundscape for sequence groups', async () => {
      const gid = makeGroupId(1)
      const group = makeSequenceGroup(gid)
      const store = createStore([group])
      await store.getState().playGroup(gid)
      expect(mockSoundscapeState.getInstance().play).toHaveBeenCalledWith(gid)
    })

    it('delegates play to soundscape for soundtrack groups', async () => {
      const gid = makeGroupId(1)
      const group = makeSourceGroup(gid, 'Soundtrack')
      const store = createStore([group])
      await store.getState().playGroup(gid)
      expect(mockSoundscapeState.getInstance().play).toHaveBeenCalledWith(gid)
    })
  })

  describe('stopGroup()', () => {
    it('delegates to soundscape.stop() with the groupID', () => {
      const gid = makeGroupId(1)
      const store = createStore()
      store.getState().stopGroup(gid)
      expect(mockSoundscapeState.getInstance().stop).toHaveBeenCalledWith(gid)
    })

    it('updates playingGroups when the soundscape fires AnySoundsStopped', () => {
      const gid = makeGroupId(1)
      const store = createStore()
      const soundscape = mockSoundscapeState.getInstance()
      soundscape.playingGroups.mockReturnValue([gid])
      soundscape._fire(ManagerListenerType.AnySoundsStarted)
      soundscape.playingGroups.mockReturnValue([])
      soundscape._fire(ManagerListenerType.AnySoundsStopped)
      expect(store.getState().playingGroups).toHaveLength(0)
    })
  })

  describe('setMusicVolume()', () => {
    it('delegates to soundscape.setMusicVolume()', () => {
      const store = createStore()
      store.getState().setMusicVolume(75)
      expect(mockSoundscapeState.getInstance().setMusicVolume).toHaveBeenCalledWith(75)
    })

    it('updates activeSoundtrack when EffectUpdated fires with an active soundtrack', () => {
      const gid = makeGroupId(1)
      const group = makeSourceGroup(gid, 'Soundtrack')
      const store = createStore([group])
      const soundscape = mockSoundscapeState.getInstance()

      mockAudio.Groups.Get.mockReturnValue({ group })
      soundscape._activeSoundtrack = {
        id: gid,
        getActiveSong: vi.fn().mockReturnValue({ name: 'Test Song', targetVolume: 80, audio: {} }),
        Volume: 80
      }

      soundscape._fire(ManagerListenerType.EffectUpdated)

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

// ---------------------------------------------------------------------------
// Import ManagerListenerType after mocks so the enum is available in tests
// ---------------------------------------------------------------------------
import { ManagerListenerType } from '@renderer/rpgAudioEngine/manager/abstractSoundManager'
