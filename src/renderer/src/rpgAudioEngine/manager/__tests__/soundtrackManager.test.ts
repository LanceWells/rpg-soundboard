import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { GroupID } from 'src/apis/audio/types/groups'
import type { EffectID } from 'src/apis/audio/types/effects'
import type { SoundEffectWithPlayerDetails } from 'src/apis/audio/types/groups'

// ---------------------------------------------------------------------------
// Hoisted mock state
// ---------------------------------------------------------------------------

const mockSoundtrackState = vi.hoisted(() => {
  const instances: any[] = []
  // Captures the handler passed to container.on('playNext', ...)
  let capturedPlayNextHandler: ((id: GroupID, container: any) => void) | null = null

  const MockSoundtrackSoundContainerV2: any = vi.fn().mockImplementation(function (this: any) {
    this.Variant = 'Soundtrack'
    this.Volume = 100
    this.LoadedEffectID = undefined
    this.Play = vi.fn()
    this.Stop = vi.fn()
    this.ChangeVolume = vi.fn()
    this.Fade = vi.fn()
    this.GetDuration = vi.fn().mockResolvedValue(60000)
    this.playNextSong = vi.fn().mockResolvedValue(undefined)
    this.getActiveSong = vi.fn().mockReturnValue(undefined)
    this.on = vi.fn().mockImplementation((_event: string, handler: any) => {
      capturedPlayNextHandler = handler.handler
    })
    instances.push(this)
  })

  return {
    MockSoundtrackSoundContainerV2,
    instances,
    firePlayed(groupID: GroupID, container: any) {
      capturedPlayNextHandler?.(groupID, container)
    }
  }
})

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@renderer/rpgAudioEngine', () => ({
  Ctx: { Environmental: 0, Soundtrack: 1, Effectless: 2 },
  RpgAudio: vi.fn(),
  ListenerType: { Load: 0, Stop: 1, Play: 2 },
  RpgAudioState: { Loading: 0, Ready: 1, Playing: 2, Stopped: 3, Error: 4 }
}))

vi.mock('@renderer/utils/soundContainer/variants/soundtrackV2', () => ({
  SoundtrackSoundContainerV2: mockSoundtrackState.MockSoundtrackSoundContainerV2
}))

// ---------------------------------------------------------------------------
// Import under test (after mocks)
// ---------------------------------------------------------------------------

import { SoundtrackManager } from '../soundtrackManager'
import { ManagerListenerType } from '../abstractSoundManager'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEffect(
  overrides: Partial<SoundEffectWithPlayerDetails> = {}
): SoundEffectWithPlayerDetails {
  return {
    id: 'eff-aaa-bbb-ccc-ddd-eee' as EffectID,
    path: 'aud://board-data/grp-111/1.mp3',
    format: '.mp3',
    volume: 80,
    name: 'Test Effect',
    useHtml5: false,
    ...overrides
  }
}

const GRP_A = 'grp-aaaa-0000-0000-0000-0000' as GroupID
const GRP_B = 'grp-bbbb-0000-0000-0000-0000' as GroupID

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SoundtrackManager', () => {
  let mgr: SoundtrackManager
  let mockAudio: any

  beforeEach(() => {
    mockSoundtrackState.instances.length = 0
    mockSoundtrackState.MockSoundtrackSoundContainerV2.mockClear()

    mockAudio = {
      Groups: {
        Get: vi.fn().mockReturnValue({
          group: { id: GRP_A, type: 'source', variant: 'Soundtrack', name: 'Track A' }
        }),
        GetSounds: vi.fn().mockResolvedValue({ variant: 'Soundtrack', sounds: [makeEffect()] })
      }
    }
    vi.stubGlobal('audio', mockAudio)

    mgr = new SoundtrackManager()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('initial state', () => {
    it('ActiveSoundtrack is null before any plays', () => {
      expect(mgr.ActiveSoundtrack).toBeNull()
    })

    it('ActiveSoundtrackID is null before any plays', () => {
      expect(mgr.ActiveSoundtrackID).toBeNull()
    })
  })

  describe('play', () => {
    it('warns and returns when the group is not found', async () => {
      mockAudio.Groups.Get.mockReturnValue({ group: undefined })
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      await mgr.play(GRP_A)
      expect(warn).toHaveBeenCalled()
      warn.mockRestore()
    })

    it('calls GetSounds with the group ID', async () => {
      await mgr.play(GRP_A)
      expect(mockAudio.Groups.GetSounds).toHaveBeenCalledWith({ groupID: GRP_A })
    })

    it('creates a SoundtrackSoundContainerV2', async () => {
      await mgr.play(GRP_A)
      expect(mockSoundtrackState.MockSoundtrackSoundContainerV2).toHaveBeenCalledTimes(1)
    })

    it('registers the group in playingGroups', async () => {
      await mgr.play(GRP_A)
      expect(mgr.playingGroups()).toContain(GRP_A)
    })

    it('registers a playNext listener on the new container', async () => {
      await mgr.play(GRP_A)
      expect(mockSoundtrackState.instances[0].on).toHaveBeenCalledWith(
        'playNext',
        expect.objectContaining({ handler: expect.any(Function) })
      )
    })

    it('stops all currently playing soundtracks before starting a new one', async () => {
      await mgr.play(GRP_A)
      const firstContainer = mockSoundtrackState.instances[0]

      mockAudio.Groups.Get.mockReturnValue({
        group: { id: GRP_B, type: 'source', variant: 'Soundtrack', name: 'Track B' }
      })
      await mgr.play(GRP_B)

      expect(firstContainer.Stop).toHaveBeenCalledTimes(1)
    })
  })

  describe('handlePlayNext', () => {
    it('sets ActiveSoundtrackID when playNext fires', async () => {
      await mgr.play(GRP_A)
      mockSoundtrackState.firePlayed(GRP_A, mockSoundtrackState.instances[0])
      expect(mgr.ActiveSoundtrackID).toBe(GRP_A)
    })

    it('fires all PlayNext listeners when playNext fires', async () => {
      const spy = vi.fn()
      mgr.on(ManagerListenerType.PlayNext, spy)
      await mgr.play(GRP_A)
      mockSoundtrackState.firePlayed(GRP_A, mockSoundtrackState.instances[0])
      expect(spy).toHaveBeenCalledWith(mgr)
    })
  })

  describe('ActiveSoundtrack', () => {
    it('returns null before playNext has fired', async () => {
      await mgr.play(GRP_A)
      // _activeSoundtrackID is still null until handlePlayNext fires
      expect(mgr.ActiveSoundtrack).toBeNull()
    })

    it('returns the container after playNext fires', async () => {
      await mgr.play(GRP_A)
      const container = mockSoundtrackState.instances[0]
      mockSoundtrackState.firePlayed(GRP_A, container)
      expect(mgr.ActiveSoundtrack).toBe(container)
    })
  })

  describe('stop', () => {
    it('clears ActiveSoundtrackID', async () => {
      await mgr.play(GRP_A)
      mockSoundtrackState.firePlayed(GRP_A, mockSoundtrackState.instances[0])
      mgr.stop(GRP_A)
      expect(mgr.ActiveSoundtrackID).toBeNull()
    })

    it('calls Stop() on the container', async () => {
      await mgr.play(GRP_A)
      const container = mockSoundtrackState.instances[0]
      mgr.stop(GRP_A)
      expect(container.Stop).toHaveBeenCalledTimes(1)
    })
  })
})
