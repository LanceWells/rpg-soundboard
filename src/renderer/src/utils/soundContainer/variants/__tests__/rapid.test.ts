import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { SoundEffectWithPlayerDetails } from 'src/apis/audio/types/groups'
import type { EffectID } from 'src/apis/audio/types/effects'

const mockState = vi.hoisted(() => {
  const instances: any[] = []

  const MockRpgAudio = vi.fn().mockImplementation(function (this: any) {
    this.State = 0
    this.play = vi.fn().mockResolvedValue(undefined)
    this.stop = vi.fn().mockResolvedValue(undefined)
    this.fade = vi.fn()
    this.rate = vi.fn()
    this.pan = vi.fn()
    this.getDuration = vi.fn().mockResolvedValue(5)
    this.setVolume = vi.fn()
    this.getVolume = vi.fn().mockReturnValue(100)
    this.on = vi.fn()
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

import { RapidSoundContainer } from '../rapid'

function makeEffect(
  id: EffectID = 'eff-aaa-bbb-ccc-ddd-eee' as EffectID,
  overrides: Partial<SoundEffectWithPlayerDetails> = {}
): SoundEffectWithPlayerDetails {
  return {
    id,
    path: `aud://board-data/grp-111/${id}.mp3`,
    format: '.mp3',
    volume: 100,
    name: `Effect ${id}`,
    useHtml5: false,
    ...overrides
  }
}

beforeEach(() => {
  mockState.instances.length = 0
  mockState.MockRpgAudio.mockClear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('RapidSoundContainer', () => {
  it('has Variant = "Rapid"', () => {
    const container = new RapidSoundContainer({ effects: [makeEffect()] }, undefined)
    expect(container.Variant).toBe('Rapid')
  })

  it('passes loop=false', () => {
    new RapidSoundContainer({ effects: [makeEffect()] }, undefined)
    const config = mockState.MockRpgAudio.mock.calls[0][0]
    expect(config.loop).toBe(false)
  })

  it('Play() calls super.Play(), Rate(), and Pan()', () => {
    const container = new RapidSoundContainer({ effects: [makeEffect()] }, undefined)
    container.Play()
    const audio = mockState.instances[0]
    expect(audio.play).toHaveBeenCalledTimes(1)
    expect(audio.rate).toHaveBeenCalledTimes(1)
    expect(audio.pan).toHaveBeenCalledTimes(1)
  })

  it('Play() applies a pan value in [-0.2, 0.2]', () => {
    const container = new RapidSoundContainer({ effects: [makeEffect()] }, undefined)
    container.Play()
    const panValue = mockState.instances[0].pan.mock.calls[0][0]
    expect(panValue).toBeGreaterThanOrEqual(-0.2)
    expect(panValue).toBeLessThanOrEqual(0.2)
  })

  it('Play() applies a rate value in [0.8, 1.2]', () => {
    const container = new RapidSoundContainer({ effects: [makeEffect()] }, undefined)
    container.Play()
    const rateValue = mockState.instances[0].rate.mock.calls[0][0]
    expect(rateValue).toBeGreaterThanOrEqual(0.8)
    expect(rateValue).toBeLessThanOrEqual(1.2)
  })

  it('SelectEffect with 2 or fewer effects returns one of the provided effects', () => {
    const e1 = makeEffect('eff-111-000-000-000-000' as EffectID)
    const e2 = makeEffect('eff-222-000-000-000-000' as EffectID)
    const container = new RapidSoundContainer({ effects: [e1, e2] }, e1.id)
    expect([e1.id, e2.id]).toContain(container.LoadedEffectID)
  })

  it('SelectEffect with 3+ effects avoids the lastEffectID', () => {
    const e1 = makeEffect('eff-111-000-000-000-000' as EffectID)
    const e2 = makeEffect('eff-222-000-000-000-000' as EffectID)
    const e3 = makeEffect('eff-333-000-000-000-000' as EffectID)
    const effects = [e1, e2, e3]

    for (let i = 0; i < 30; i++) {
      mockState.instances.length = 0
      mockState.MockRpgAudio.mockClear()
      const c = new RapidSoundContainer({ effects }, e1.id)
      expect(c.LoadedEffectID).not.toBe(e1.id)
    }
  })

  it('SelectEffect with 3+ effects and no lastEffectID can pick any effect', () => {
    const effects = [
      makeEffect('eff-111-000-000-000-000' as EffectID),
      makeEffect('eff-222-000-000-000-000' as EffectID),
      makeEffect('eff-333-000-000-000-000' as EffectID)
    ]
    const picked = new Set<string>()
    for (let i = 0; i < 30; i++) {
      mockState.instances.length = 0
      mockState.MockRpgAudio.mockClear()
      const c = new RapidSoundContainer({ effects }, undefined)
      picked.add(c.LoadedEffectID!)
    }
    expect(picked.size).toBeGreaterThan(1)
  })

  it('Stop() calls rpgAudio.stop()', () => {
    const container = new RapidSoundContainer({ effects: [makeEffect()] }, undefined)
    container.Stop()
    expect(mockState.instances[0].stop).toHaveBeenCalledTimes(1)
  })

  it('ChangeVolume() calls rpgAudio.setVolume()', () => {
    const container = new RapidSoundContainer({ effects: [makeEffect()] }, undefined)
    container.ChangeVolume(70)
    expect(mockState.instances[0].setVolume).toHaveBeenCalledWith(70)
  })

  it('LoadedEffectID returns the selected effect id', () => {
    const effect = makeEffect('eff-abc-def-ghi-jkl-mno' as EffectID)
    const container = new RapidSoundContainer({ effects: [effect] }, undefined)
    expect(container.LoadedEffectID).toBe('eff-abc-def-ghi-jkl-mno')
  })
})
