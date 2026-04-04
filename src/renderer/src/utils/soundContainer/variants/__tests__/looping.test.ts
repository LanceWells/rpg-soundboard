import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { SoundEffectWithPlayerDetails } from 'src/apis/audio/types/groups'
import type { EffectID } from 'src/apis/audio/types/effects'

const mockState = vi.hoisted(() => {
  const instances: any[] = []

  const MockRpgAudio = vi.fn().mockImplementation(function (this: any) {
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
    const self = this
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

import { LoopingSoundContainer } from '../looping'

function makeEffect(overrides: Partial<SoundEffectWithPlayerDetails> = {}): SoundEffectWithPlayerDetails {
  return {
    id: 'eff-aaa-bbb-ccc-ddd-eee' as EffectID,
    path: 'aud://board-data/grp-111/1.mp3',
    format: '.mp3',
    volume: 100,
    name: 'Loop Effect',
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
})

describe('LoopingSoundContainer', () => {
  it('has Variant = "Looping"', () => {
    const container = new LoopingSoundContainer({ effects: [makeEffect()] })
    expect(container.Variant).toBe('Looping')
  })

  it('passes loop=true by default', () => {
    new LoopingSoundContainer({ effects: [makeEffect()] })
    const config = mockState.MockRpgAudio.mock.calls[0][0]
    expect(config.loop).toBe(true)
  })

  it('passes loop=false when enableLoops is false', () => {
    new LoopingSoundContainer({ effects: [makeEffect()] }, false)
    const config = mockState.MockRpgAudio.mock.calls[0][0]
    expect(config.loop).toBe(false)
  })

  it('Play() calls rpgAudio.play()', () => {
    const container = new LoopingSoundContainer({ effects: [makeEffect()] })
    container.Play()
    expect(mockState.instances[0].play).toHaveBeenCalledTimes(1)
  })

  it('Stop() calls rpgAudio.fade(0, fadeTime) immediately', () => {
    const container = new LoopingSoundContainer({ effects: [makeEffect()] })
    container.Stop()
    expect(mockState.instances[0].fade).toHaveBeenCalledWith(0, 250)
    // stop not yet called (it's in a setTimeout)
    expect(mockState.instances[0].stop).not.toHaveBeenCalled()
  })

  it('Stop() calls rpgAudio.stop() after the fadeTime elapses', () => {
    const container = new LoopingSoundContainer({ effects: [makeEffect()] })
    container.Stop()
    vi.advanceTimersByTime(250)
    expect(mockState.instances[0].stop).toHaveBeenCalledTimes(1)
  })

  it('Stop() does not call stop() before fadeTime elapses', () => {
    const container = new LoopingSoundContainer({ effects: [makeEffect()] })
    container.Stop()
    vi.advanceTimersByTime(100)
    expect(mockState.instances[0].stop).not.toHaveBeenCalled()
  })

  it('Volume getter returns the effect volume', () => {
    const container = new LoopingSoundContainer({ effects: [makeEffect({ volume: 90 })] })
    expect(container.Volume).toBe(90)
  })

  it('ChangeVolume() calls rpgAudio.setVolume()', () => {
    const container = new LoopingSoundContainer({ effects: [makeEffect()] })
    container.ChangeVolume(60)
    expect(mockState.instances[0].setVolume).toHaveBeenCalledWith(60)
  })

  it('Fade() calls rpgAudio.fade() with the correct computed volume', () => {
    const container = new LoopingSoundContainer({ effects: [makeEffect({ volume: 100 })] })
    container.Fade(0.3)
    expect(mockState.instances[0].fade).toHaveBeenCalledWith(30, 250)
  })

  it('uses provided Ctx when given', () => {
    new LoopingSoundContainer({ effects: [makeEffect()] }, true, 0) // Ctx.Environmental = 0
    const config = mockState.MockRpgAudio.mock.calls[0][0]
    expect(config.ctx).toBe(0)
  })

  it('LoadedEffectID returns the selected effect id', () => {
    const effect = makeEffect({ id: 'eff-xyz-000-000-000-000' as EffectID })
    const container = new LoopingSoundContainer({ effects: [effect] })
    expect(container.LoadedEffectID).toBe('eff-xyz-000-000-000-000')
  })
})
