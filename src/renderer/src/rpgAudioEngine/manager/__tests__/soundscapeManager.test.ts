import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { GroupID } from 'src/apis/audio/types/groups'

// ---------------------------------------------------------------------------
// Hoisted mock state — sub-manager instances are captured at construction time
// ---------------------------------------------------------------------------

const mockManagerState = vi.hoisted(() => {
  let soundtrackInst: any = null
  let effectInst: any = null

  const MockSoundtrackManager = vi.fn().mockImplementation(function (this: any) {
    const listeners: Record<number, ((e: any) => void)[]> = {}
    this.play = vi.fn().mockResolvedValue(undefined)
    this.stop = vi.fn()
    this.playingGroups = vi.fn().mockReturnValue([])
    this.on = vi.fn().mockImplementation((type: number, cb: (e: any) => void) => {
      listeners[type] = listeners[type] ?? []
      listeners[type].push(cb)
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
    soundtrackInst = this
  })

  const MockSoundEffectManager = vi.fn().mockImplementation(function (this: any) {
    const listeners: Record<number, ((e: any) => void)[]> = {}
    this.play = vi.fn().mockResolvedValue(undefined)
    this.stop = vi.fn()
    this.playingGroups = vi.fn().mockReturnValue([])
    this.on = vi.fn().mockImplementation((type: number, cb: (e: any) => void) => {
      listeners[type] = listeners[type] ?? []
      listeners[type].push(cb)
    })
    this._fire = (type: number) => {
      listeners[type]?.forEach((cb) => cb(this))
    }
    effectInst = this
  })

  return {
    MockSoundtrackManager,
    MockSoundEffectManager,
    getSoundtrack: () => soundtrackInst,
    getEffects: () => effectInst,
    reset() {
      soundtrackInst = null
      effectInst = null
      MockSoundtrackManager.mockClear()
      MockSoundEffectManager.mockClear()
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

vi.mock('../soundtrackManager', () => ({
  SoundtrackManager: mockManagerState.MockSoundtrackManager
}))

vi.mock('../soundEffectManager', () => ({
  SoundEffectManager: mockManagerState.MockSoundEffectManager
}))

// ---------------------------------------------------------------------------
// Import under test (after mocks)
// ---------------------------------------------------------------------------

import { SoundscapeManager } from '../soundscapeManager'
import { ManagerListenerType } from '../abstractSoundManager'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GRP_SOUNDTRACK = 'grp-snd-0000-0000-0000-0000' as GroupID
const GRP_EFFECT = 'grp-eff-0000-0000-0000-0000' as GroupID

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SoundscapeManager', () => {
  let mgr: SoundscapeManager
  let mockAudio: any
  let soundtrack: any
  let effects: any

  beforeEach(() => {
    mockManagerState.reset()

    mockAudio = {
      Groups: {
        Get: vi.fn()
      }
    }
    vi.stubGlobal('audio', mockAudio)

    // SoundscapeManager constructor creates the sub-managers; capture them after.
    mgr = new SoundscapeManager()
    soundtrack = mockManagerState.getSoundtrack()
    effects = mockManagerState.getEffects()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // ------ playingGroups ------

  describe('playingGroups', () => {
    it('returns empty when both sub-managers are idle', () => {
      expect(mgr.playingGroups()).toEqual([])
    })

    it('combines IDs from effects and soundtracks (effects first)', () => {
      effects.playingGroups.mockReturnValue([GRP_EFFECT])
      soundtrack.playingGroups.mockReturnValue([GRP_SOUNDTRACK])
      expect(mgr.playingGroups()).toEqual([GRP_EFFECT, GRP_SOUNDTRACK])
    })
  })

  // ------ play ------

  describe('play', () => {
    it('warns and returns when the group is not found', async () => {
      mockAudio.Groups.Get.mockReturnValue({ group: undefined })
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      await mgr.play(GRP_EFFECT)
      expect(warn).toHaveBeenCalled()
      warn.mockRestore()
    })

    it('routes a Soundtrack group to the soundtrack manager', async () => {
      mockAudio.Groups.Get.mockReturnValue({ group: { id: GRP_SOUNDTRACK, variant: 'Soundtrack' } })
      await mgr.play(GRP_SOUNDTRACK)
      expect(soundtrack.play).toHaveBeenCalledWith(GRP_SOUNDTRACK)
      expect(effects.play).not.toHaveBeenCalled()
    })

    it('routes a non-Soundtrack group to the effects manager', async () => {
      mockAudio.Groups.Get.mockReturnValue({ group: { id: GRP_EFFECT, variant: 'Default' } })
      await mgr.play(GRP_EFFECT)
      expect(effects.play).toHaveBeenCalledWith(GRP_EFFECT)
      expect(soundtrack.play).not.toHaveBeenCalled()
    })

    it('fades the active soundtrack down when an effect plays', async () => {
      const mockActive = { Fade: vi.fn() }
      soundtrack._activeSoundtrack = mockActive
      mockAudio.Groups.Get.mockReturnValue({ group: { id: GRP_EFFECT, variant: 'Default' } })
      await mgr.play(GRP_EFFECT)
      expect(mockActive.Fade).toHaveBeenCalledWith(0.15, 50)
    })

    it('fires AnySoundsStarted listeners for any play', async () => {
      mockAudio.Groups.Get.mockReturnValue({ group: { id: GRP_EFFECT, variant: 'Default' } })
      const spy = vi.fn()
      mgr.on(ManagerListenerType.AnySoundsStarted, spy)
      await mgr.play(GRP_EFFECT)
      expect(spy).toHaveBeenCalledWith(mgr)
    })
  })

  // ------ stop ------

  describe('stop', () => {
    it('warns and returns when the group is not found', () => {
      mockAudio.Groups.Get.mockReturnValue({ group: undefined })
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mgr.stop(GRP_EFFECT)
      expect(warn).toHaveBeenCalled()
      warn.mockRestore()
    })

    it('routes a Soundtrack group to the soundtrack manager', () => {
      mockAudio.Groups.Get.mockReturnValue({ group: { id: GRP_SOUNDTRACK, variant: 'Soundtrack' } })
      mgr.stop(GRP_SOUNDTRACK)
      expect(soundtrack.stop).toHaveBeenCalledWith(GRP_SOUNDTRACK)
      expect(effects.stop).not.toHaveBeenCalled()
    })

    it('routes a non-Soundtrack group to the effects manager', () => {
      mockAudio.Groups.Get.mockReturnValue({ group: { id: GRP_EFFECT, variant: 'Default' } })
      mgr.stop(GRP_EFFECT)
      expect(effects.stop).toHaveBeenCalledWith(GRP_EFFECT)
      expect(soundtrack.stop).not.toHaveBeenCalled()
    })
  })

  // ------ setMusicVolume ------

  describe('setMusicVolume', () => {
    it('is a no-op when there is no active soundtrack', () => {
      expect(() => mgr.setMusicVolume(50)).not.toThrow()
    })

    it('calls ChangeVolume on the active soundtrack', () => {
      const mockActive = { ChangeVolume: vi.fn(), Fade: vi.fn() }
      soundtrack._activeSoundtrack = mockActive
      mgr.setMusicVolume(75)
      expect(mockActive.ChangeVolume).toHaveBeenCalledWith(75)
    })

    it('fires EffectUpdated listeners', () => {
      const mockActive = { ChangeVolume: vi.fn(), Fade: vi.fn() }
      soundtrack._activeSoundtrack = mockActive
      const spy = vi.fn()
      mgr.on(ManagerListenerType.EffectUpdated, spy)
      mgr.setMusicVolume(50)
      expect(spy).toHaveBeenCalledWith(mgr)
    })
  })

  // ------ fade ------

  describe('fade', () => {
    it('is a no-op when there is no active soundtrack', () => {
      expect(() => mgr.fade(0.5, 500)).not.toThrow()
    })

    it('calls Fade on the active soundtrack', () => {
      const mockActive = { Fade: vi.fn() }
      soundtrack._activeSoundtrack = mockActive
      mgr.fade(0.5, 500)
      expect(mockActive.Fade).toHaveBeenCalledWith(0.5, 500)
    })
  })

  // ------ playNextSong ------

  describe('playNextSong', () => {
    it('is a no-op when there is no active soundtrack', () => {
      expect(() => mgr.playNextSong()).not.toThrow()
    })

    it('delegates to the active soundtrack', () => {
      const mockActive = { playNextSong: vi.fn().mockResolvedValue(undefined) }
      soundtrack._activeSoundtrack = mockActive
      mgr.playNextSong()
      expect(mockActive.playNextSong).toHaveBeenCalledTimes(1)
    })
  })

  // ------ event propagation ------

  describe('event propagation', () => {
    it('fades the soundtrack back to 1.0 over 3500ms when all effects finish', () => {
      const mockActive = { Fade: vi.fn() }
      soundtrack._activeSoundtrack = mockActive
      effects._fire(ManagerListenerType.AllSoundsStopped)
      expect(mockActive.Fade).toHaveBeenCalledWith(1, 3500)
    })

    it('propagates AnySoundsStarted from effects to outer listeners', () => {
      const spy = vi.fn()
      mgr.on(ManagerListenerType.AnySoundsStarted, spy)
      effects._fire(ManagerListenerType.AnySoundsStarted)
      expect(spy).toHaveBeenCalledWith(mgr)
    })

    it('propagates AnySoundsStarted from soundtracks to outer listeners', () => {
      const spy = vi.fn()
      mgr.on(ManagerListenerType.AnySoundsStarted, spy)
      soundtrack._fire(ManagerListenerType.AnySoundsStarted)
      expect(spy).toHaveBeenCalledWith(mgr)
    })

    it('propagates AnySoundsStopped from effects to outer listeners', () => {
      const spy = vi.fn()
      mgr.on(ManagerListenerType.AnySoundsStopped, spy)
      effects._fire(ManagerListenerType.AnySoundsStopped)
      expect(spy).toHaveBeenCalledWith(mgr)
    })

    it('propagates AnySoundsStopped from soundtracks to outer listeners', () => {
      const spy = vi.fn()
      mgr.on(ManagerListenerType.AnySoundsStopped, spy)
      soundtrack._fire(ManagerListenerType.AnySoundsStopped)
      expect(spy).toHaveBeenCalledWith(mgr)
    })

    it('propagates PlayNext from soundtracks to outer listeners', () => {
      const spy = vi.fn()
      mgr.on(ManagerListenerType.PlayNext, spy)
      soundtrack._fire(ManagerListenerType.PlayNext)
      expect(spy).toHaveBeenCalledWith(mgr)
    })
  })

  // ------ delegation ------

  describe('ActiveSoundtrack / ActiveSoundtrackID', () => {
    it('delegates ActiveSoundtrack to the soundtrack sub-manager', () => {
      const mockActive = { Fade: vi.fn() }
      soundtrack._activeSoundtrack = mockActive
      expect(mgr.ActiveSoundtrack).toBe(mockActive)
    })

    it('returns null for ActiveSoundtrackID when no soundtrack is active', () => {
      expect(mgr.ActiveSoundtrackID).toBeNull()
    })
  })
})
