import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { SoundEffectWithPlayerDetails } from 'src/apis/audio/types/groups'
import type { EffectID } from 'src/apis/audio/types/effects'

// ---------------------------------------------------------------------------
// Mock @renderer/rpgAudioEngine — uses regular `function` so `new` works
// ---------------------------------------------------------------------------
const mockState = vi.hoisted(() => {
  const instances: any[] = []

  const MockRpgAudio = vi.fn().mockImplementation(function (this: any) {
    const listeners: Record<number, ((a: any) => void)[]> = {}
    this.State = 2 // Playing by default so Stop() triggers fade
    this.play = vi.fn().mockResolvedValue(undefined)
    this.stop = vi.fn()
    this.fade = vi.fn()
    this.rate = vi.fn()
    this.pan = vi.fn()
    this.getDuration = vi.fn().mockResolvedValue(60)
    this.setVolume = vi.fn()
    this.getVolume = vi.fn().mockReturnValue(100)
    this.on = vi.fn().mockImplementation(function (type: number, cb: (a: any) => void) {
      listeners[type] = listeners[type] ?? []
      listeners[type].push(cb)
    })
    const self = this
    this._triggerLoad = function () {
      self.State = 1
      ;(listeners[0] ?? []).forEach((cb) => cb(self))
    }
    this._triggerStop = function () {
      self.State = 3
      ;(listeners[1] ?? []).forEach((cb) => cb(self))
    }
    instances.push(this)
  })

  return { MockRpgAudio, instances }
})

vi.mock('@renderer/rpgAudioEngine', () => ({
  RpgAudio: mockState.MockRpgAudio,
  Ctx: { Environmental: 0, Soundtrack: 1, Effectless: 2 },
  ListenerType: { Load: 0, Stop: 1, Play: 2 },
  RpgAudioState: { Loading: 0, Ready: 1, Playing: 2, Stopped: 3, Error: 4 }
}))

import { SoundtrackSoundContainerV2 } from '../soundtrackV2'

function makeEffect(n = 1, overrides: Partial<SoundEffectWithPlayerDetails> = {}): SoundEffectWithPlayerDetails {
  return {
    id: `eff-${n.toString().padStart(3, '0')}-000-000-000-000` as EffectID,
    path: `aud://board-data/grp-111/${n}.mp3`,
    format: '.mp3',
    volume: 100,
    name: `Track ${n}`,
    useHtml5: false,
    ...overrides
  }
}

beforeEach(() => {
  mockState.instances.length = 0
  mockState.MockRpgAudio.mockClear()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('SoundtrackSoundContainerV2', () => {
  describe('constructor', () => {
    it('has Variant = "Soundtrack"', () => {
      const c = new SoundtrackSoundContainerV2({ effects: [makeEffect()] })
      expect(c.Variant).toBe('Soundtrack')
    })

    it('creates an initial RpgAudio instance', () => {
      new SoundtrackSoundContainerV2({ effects: [makeEffect()] })
      expect(mockState.MockRpgAudio).toHaveBeenCalledTimes(1)
    })

    it('Volume starts at 100', () => {
      const c = new SoundtrackSoundContainerV2({ effects: [makeEffect()] })
      expect(c.Volume).toBe(100)
    })

    it('calls loadedHandler when initial audio fires Load event', () => {
      const loadedHandler = vi.fn()
      new SoundtrackSoundContainerV2({
        effects: [makeEffect()],
        loadedHandler: { id: 'grp-test-1', handler: loadedHandler }
      })
      mockState.instances[0]._triggerLoad()
      expect(loadedHandler).toHaveBeenCalledWith('grp-test-1', expect.any(Object))
    })
  })

  describe('getActiveSong()', () => {
    it('returns the first audio in the queue with the correct name', () => {
      const c = new SoundtrackSoundContainerV2({ effects: [makeEffect(1), makeEffect(2)] })
      const active = c.getActiveSong()
      expect(active).toBeDefined()
      expect(active?.audio).toBe(mockState.instances[0])
    })
  })

  describe('on()', () => {
    it('registers a playNext handler without error', () => {
      const c = new SoundtrackSoundContainerV2({ effects: [makeEffect()] })
      const handler = vi.fn()
      expect(() => c.on('playNext', { id: 'grp-123', handler })).not.toThrow()
    })
  })

  describe('ChangeVolume()', () => {
    it('updates the container volume property', () => {
      const c = new SoundtrackSoundContainerV2({ effects: [makeEffect({ volume: 100 })] })
      c.ChangeVolume(50)
      expect(c.Volume).toBe(50)
    })

    it('calls setVolume on the active audio with VolumeManager calculation (0.25 modifier)', () => {
      const c = new SoundtrackSoundContainerV2({ effects: [makeEffect({ volume: 100 })] })
      c.ChangeVolume(100)
      // VolumeManager(0.25): (100/100) * 100 * 0.25 = 25
      expect(mockState.instances[0].setVolume).toHaveBeenCalledWith(25)
    })

    it('does nothing when the queue is empty', () => {
      const c = new SoundtrackSoundContainerV2({ effects: [makeEffect()] })
      vi.spyOn(c, 'getActiveSong').mockReturnValue(undefined)
      expect(() => c.ChangeVolume(50)).not.toThrow()
    })
  })

  describe('Fade()', () => {
    it('fades the active audio to the correct computed volume', () => {
      const c = new SoundtrackSoundContainerV2({ effects: [makeEffect({ volume: 100 })] })
      c.Fade(0.5)
      // VolumeManager: (100/100)*100*0.25 = 25, then *0.5 = 12.5
      expect(mockState.instances[0].fade).toHaveBeenCalledWith(12.5, 2500)
    })

    it('uses custom fadeTime when provided', () => {
      const c = new SoundtrackSoundContainerV2({ effects: [makeEffect({ volume: 100 })] })
      c.Fade(1, 1000)
      expect(mockState.instances[0].fade).toHaveBeenCalledWith(25, 1000)
    })

    it('does nothing when no active song', () => {
      const c = new SoundtrackSoundContainerV2({ effects: [makeEffect()] })
      vi.spyOn(c, 'getActiveSong').mockReturnValue(undefined)
      expect(() => c.Fade(0.5)).not.toThrow()
    })
  })

  describe('Stop()', () => {
    it('fades out the active audio', () => {
      const c = new SoundtrackSoundContainerV2({ effects: [makeEffect()] })
      c.Stop()
      expect(mockState.instances[0].fade).toHaveBeenCalledWith(0, 2500)
    })

    it('calls the stopHandler', () => {
      const stopHandler = vi.fn()
      const c = new SoundtrackSoundContainerV2({
        effects: [makeEffect()],
        stopHandler: { id: 'grp-abc', handler: stopHandler }
      })
      c.Stop()
      expect(stopHandler).toHaveBeenCalledWith('grp-abc', c)
    })

    it('can be called multiple times without throwing', () => {
      const c = new SoundtrackSoundContainerV2({ effects: [makeEffect()] })
      c.Stop()
      expect(() => c.Stop()).not.toThrow()
    })
  })

  describe('GetDuration()', () => {
    it('delegates to the active audio getDuration', async () => {
      const c = new SoundtrackSoundContainerV2({ effects: [makeEffect()] })
      mockState.instances[0].getDuration.mockResolvedValue(120)
      expect(await c.GetDuration()).toBe(120)
    })
  })

  describe('shuffle behaviour', () => {
    it('varies the first picked effect over many runs with 5+ effects', () => {
      const effects = [1, 2, 3, 4, 5].map((n) => makeEffect(n))
      const firstPicked = new Set<string>()

      for (let i = 0; i < 30; i++) {
        mockState.instances.length = 0
        mockState.MockRpgAudio.mockClear()
        const c = new SoundtrackSoundContainerV2({ effects })
        const active = c.getActiveSong()
        if (active) firstPicked.add(active.name)
      }

      expect(firstPicked.size).toBeGreaterThan(1)
    })
  })
})
