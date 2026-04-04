import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SoundEffectWithPlayerDetails } from 'src/apis/audio/types/groups'
import type { EffectID } from 'src/apis/audio/types/effects'

// Mock @renderer/rpgAudioEngine with a constructable function mock
vi.mock('@renderer/rpgAudioEngine', () => ({
  RpgAudio: vi.fn().mockImplementation(function (this: any) {
    this.State = 0
    this.play = vi.fn().mockResolvedValue(undefined)
    this.stop = vi.fn().mockResolvedValue(undefined)
    this.fade = vi.fn()
    this.rate = vi.fn()
    this.pan = vi.fn()
    this.getDuration = vi.fn().mockResolvedValue(30)
    this.setVolume = vi.fn()
    this.getVolume = vi.fn().mockReturnValue(100)
    this.on = vi.fn()
  }),
  Ctx: { Environmental: 0, Soundtrack: 1, Effectless: 2 },
  ListenerType: { Load: 0, Stop: 1, Play: 2 },
  RpgAudioState: { Loading: 0, Ready: 1, Playing: 2, Stopped: 3, Error: 4 }
}))

import { NewSoundContainer } from '../util'

function makeEffect(): SoundEffectWithPlayerDetails {
  return {
    id: 'eff-aaa-bbb-ccc-ddd-eee' as EffectID,
    path: 'aud://board-data/grp-111/1.mp3',
    format: '.mp3',
    volume: 100,
    name: 'Test Effect',
    useHtml5: false
  }
}

describe('NewSoundContainer', () => {
  const setup = () => ({ effects: [makeEffect()] })

  it('returns a DefaultSoundContainer for variant "Default"', () => {
    const c = NewSoundContainer('Default', undefined, setup())
    expect(c.Variant).toBe('Default')
  })

  it('returns a LoopingSoundContainer for variant "Looping"', () => {
    const c = NewSoundContainer('Looping', undefined, setup())
    expect(c.Variant).toBe('Looping')
  })

  it('returns a RapidSoundContainer for variant "Rapid"', () => {
    const c = NewSoundContainer('Rapid', undefined, setup())
    expect(c.Variant).toBe('Rapid')
  })

  it('returns a SoundtrackSoundContainerV2 for variant "Soundtrack"', () => {
    const c = NewSoundContainer('Soundtrack', undefined, setup())
    expect(c.Variant).toBe('Soundtrack')
  })

  it('passes lastEffectID — Rapid avoids repeating the given ID when 3+ effects exist', () => {
    const lastId = 'eff-aaa-bbb-ccc-ddd-eee' as EffectID
    const effects = [
      makeEffect(),
      { ...makeEffect(), id: 'eff-111-000-000-000-000' as EffectID },
      { ...makeEffect(), id: 'eff-222-000-000-000-000' as EffectID }
    ]
    const c = NewSoundContainer('Rapid', lastId, { effects })
    expect(c.Variant).toBe('Rapid')
    expect(c.LoadedEffectID).not.toBe(lastId)
  })

  it('passes enableLoops to LoopingSoundContainer (false disables looping)', () => {
    const c = NewSoundContainer('Looping', undefined, setup(), false)
    expect(c.Variant).toBe('Looping')
  })

  it('all returned containers expose the ISoundContainer interface', () => {
    const variants = ['Default', 'Looping', 'Rapid', 'Soundtrack'] as const
    for (const v of variants) {
      const c = NewSoundContainer(v, undefined, setup())
      expect(typeof c.Play).toBe('function')
      expect(typeof c.Stop).toBe('function')
      expect(typeof c.ChangeVolume).toBe('function')
      expect(typeof c.Fade).toBe('function')
      expect(typeof c.GetDuration).toBe('function')
    }
  })
})
