import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SoundEffectWithPlayerDetails } from 'src/apis/audio/types/groups'
import type { EffectID } from 'src/apis/audio/types/effects'

// ---------------------------------------------------------------------------
// Mock @renderer/rpgAudioEngine — uses regular `function` so `new` works
// ---------------------------------------------------------------------------
const mockState = vi.hoisted(() => {
  const instances: any[] = []

  const MockRpgAudio = vi.fn().mockImplementation(function (this: any, config: any) {
    const listeners: Record<number, ((a: any) => void)[]> = {}
    this.State = 0
    this.play = vi.fn().mockResolvedValue(undefined)
    this.stop = vi.fn().mockResolvedValue(undefined)
    this.fade = vi.fn()
    this.rate = vi.fn()
    this.pan = vi.fn()
    this.getDuration = vi.fn().mockResolvedValue(30)
    this.setVolume = vi.fn()
    this.getVolume = vi.fn().mockReturnValue(100)
    this.on = vi.fn().mockImplementation(function (type: number, cb: (a: any) => void) {
      listeners[type] = listeners[type] ?? []
      listeners[type].push(cb)
    })
    // Mirror real RpgAudio: register config callbacks via on()
    if (config?.onLoad) this.on(0, config.onLoad) // ListenerType.Load = 0
    if (config?.onStop) this.on(1, config.onStop) // ListenerType.Stop = 1
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

import { DefaultSoundContainer } from '../default'

function makeEffect(overrides: Partial<SoundEffectWithPlayerDetails> = {}): SoundEffectWithPlayerDetails {
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

beforeEach(() => {
  mockState.instances.length = 0
  mockState.MockRpgAudio.mockClear()
})

describe('DefaultSoundContainer', () => {
  it('has Variant = "Default"', () => {
    const container = new DefaultSoundContainer({ effects: [makeEffect()] })
    expect(container.Variant).toBe('Default')
  })

  it('constructs with RpgAudio called once', () => {
    new DefaultSoundContainer({ effects: [makeEffect()] })
    expect(mockState.MockRpgAudio).toHaveBeenCalledTimes(1)
  })

  it('passes loop=false to RpgAudio', () => {
    new DefaultSoundContainer({ effects: [makeEffect()] })
    const config = mockState.MockRpgAudio.mock.calls[0][0]
    expect(config.loop).toBe(false)
  })

  it('passes the effect path and volume to RpgAudio', () => {
    const effect = makeEffect({ path: 'aud://board-data/grp-abc/2.mp3', volume: 60 })
    new DefaultSoundContainer({ effects: [effect] })
    const config = mockState.MockRpgAudio.mock.calls[0][0]
    expect(config.path).toBe('aud://board-data/grp-abc/2.mp3')
    expect(config.volume).toBe(60)
  })

  it('Volume getter returns the effect volume', () => {
    const container = new DefaultSoundContainer({ effects: [makeEffect({ volume: 75 })] })
    expect(container.Volume).toBe(75)
  })

  it('LoadedEffectID returns the selected effect id', () => {
    const effect = makeEffect({ id: 'eff-111-222-333-444-555' as EffectID })
    const container = new DefaultSoundContainer({ effects: [effect] })
    expect(container.LoadedEffectID).toBe('eff-111-222-333-444-555')
  })

  it('Play() calls rpgAudio.play()', () => {
    const container = new DefaultSoundContainer({ effects: [makeEffect()] })
    container.Play()
    expect(mockState.instances[0].play).toHaveBeenCalledTimes(1)
  })

  it('Stop() calls rpgAudio.stop()', () => {
    const container = new DefaultSoundContainer({ effects: [makeEffect()] })
    container.Stop()
    expect(mockState.instances[0].stop).toHaveBeenCalledTimes(1)
  })

  it('ChangeVolume() calls rpgAudio.setVolume()', () => {
    const container = new DefaultSoundContainer({ effects: [makeEffect()] })
    container.ChangeVolume(50)
    expect(mockState.instances[0].setVolume).toHaveBeenCalledWith(50)
  })

  it('Fade() calls rpgAudio.fade() with targetVolume * ratio and default fadeTime', () => {
    const container = new DefaultSoundContainer({ effects: [makeEffect({ volume: 100 })] })
    container.Fade(0.5)
    expect(mockState.instances[0].fade).toHaveBeenCalledWith(50, 250)
  })

  it('Fade() uses custom fadeTime when provided', () => {
    const container = new DefaultSoundContainer({ effects: [makeEffect({ volume: 100 })] })
    container.Fade(0.5, 1000)
    expect(mockState.instances[0].fade).toHaveBeenCalledWith(50, 1000)
  })

  it('GetDuration() delegates to rpgAudio.getDuration()', async () => {
    const container = new DefaultSoundContainer({ effects: [makeEffect()] })
    const audio = mockState.instances[mockState.instances.length - 1]
    audio.getDuration.mockResolvedValue(45)
    expect(await container.GetDuration()).toBe(45)
  })

  it('calls loadedHandler when the audio load event fires', () => {
    const loadedHandler = vi.fn()
    new DefaultSoundContainer({
      effects: [makeEffect()],
      loadedHandler: { id: 'grp-test-1', handler: loadedHandler }
    })
    mockState.instances[0]._triggerLoad()
    expect(loadedHandler).toHaveBeenCalledWith('grp-test-1', expect.any(Object))
  })

  it('calls stopHandler when the audio stop event fires', () => {
    const stopHandler = vi.fn()
    new DefaultSoundContainer({
      effects: [makeEffect()],
      stopHandler: { id: 'grp-test-2', handler: stopHandler }
    })
    mockState.instances[0]._triggerStop()
    expect(stopHandler).toHaveBeenCalledWith('grp-test-2', expect.any(Object))
  })

  it('uses Ctx.Effectless (2) by default', () => {
    new DefaultSoundContainer({ effects: [makeEffect()] })
    const config = mockState.MockRpgAudio.mock.calls[0][0]
    expect(config.ctx).toBe(2)
  })

  it('uses provided Ctx when given', () => {
    new DefaultSoundContainer({ effects: [makeEffect()] }, 0) // Ctx.Environmental = 0
    const config = mockState.MockRpgAudio.mock.calls[0][0]
    expect(config.ctx).toBe(0)
  })

  it('selects from multiple effects — picked id is always one of the provided', () => {
    const effects = [
      makeEffect({ id: 'eff-111-000-000-000-000' as EffectID }),
      makeEffect({ id: 'eff-222-000-000-000-000' as EffectID }),
      makeEffect({ id: 'eff-333-000-000-000-000' as EffectID })
    ]
    const validIds = new Set(effects.map((e) => e.id))
    for (let i = 0; i < 20; i++) {
      mockState.instances.length = 0
      mockState.MockRpgAudio.mockClear()
      const c = new DefaultSoundContainer({ effects })
      expect(validIds.has(c.LoadedEffectID!)).toBe(true)
    }
  })
})
