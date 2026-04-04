import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { SoundEffectWithPlayerDetails } from 'src/apis/audio/types/groups'
import type { EffectID } from 'src/apis/audio/types/effects'
import type { SequenceElementID, SoundGroupSequenceElement } from 'src/apis/audio/types/items'
import type { GroupID } from 'src/apis/audio/types/groups'

// ---------------------------------------------------------------------------
// Mock @renderer/rpgAudioEngine (needed by NewSoundContainer internally)
// ---------------------------------------------------------------------------
vi.mock('@renderer/rpgAudioEngine', () => ({
  RpgAudio: vi.fn().mockImplementation(function (this: any) {
    this.State = 0
    this.play = vi.fn().mockResolvedValue(undefined)
    this.stop = vi.fn().mockResolvedValue(undefined)
    this.fade = vi.fn()
    this.rate = vi.fn()
    this.pan = vi.fn()
    this.getDuration = vi.fn().mockResolvedValue(5000)
    this.setVolume = vi.fn()
    this.getVolume = vi.fn().mockReturnValue(100)
    this.on = vi.fn()
  }),
  Ctx: { Environmental: 0, Soundtrack: 1, Effectless: 2 },
  ListenerType: { Load: 0, Stop: 1, Play: 2 },
  RpgAudioState: { Loading: 0, Ready: 1, Playing: 2, Stopped: 3, Error: 4 }
}))

// ---------------------------------------------------------------------------
// Mock NewSoundContainer so Init() doesn't require real audio
// ---------------------------------------------------------------------------
const mockContainerFactory = vi.hoisted(() => {
  const containers: any[] = []

  const createMockContainer = (variant = 'Default') => {
    const c: any = {
      Variant: variant,
      Volume: 1,
      LoadedEffectID: undefined,
      Play: vi.fn(),
      Stop: vi.fn(),
      ChangeVolume: vi.fn(),
      Fade: vi.fn(),
      GetDuration: vi.fn().mockResolvedValue(5000)
    }
    containers.push(c)
    return c
  }

  const MockNewSoundContainer = vi.fn().mockImplementation(() => createMockContainer())

  return { MockNewSoundContainer, containers, createMockContainer }
})

vi.mock('@renderer/utils/soundContainer/util', () => ({
  NewSoundContainer: mockContainerFactory.MockNewSoundContainer
}))

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------
import { SequenceSoundContainer } from '../sequence'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeSeqId(n: number): SequenceElementID {
  return `seq-${n.toString().padStart(3, '0')}-000-000-000-000` as SequenceElementID
}

function makeGroupId(n: number): GroupID {
  return `grp-${n.toString().padStart(3, '0')}-000-000-000-000` as GroupID
}

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

beforeEach(() => {
  mockContainerFactory.containers.length = 0
  mockContainerFactory.MockNewSoundContainer.mockClear()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('SequenceSoundContainer', () => {
  describe('constructor', () => {
    it('has Variant = "Sequence"', () => {
      const sc = new SequenceSoundContainer({ effectGroups: [] }, 2)
      expect(sc.Variant).toBe('Sequence')
    })

    it('has Volume = 1', () => {
      const sc = new SequenceSoundContainer({ effectGroups: [] }, 2)
      expect(sc.Volume).toBe(1)
    })

    it('has LoadedEffectID = undefined', () => {
      const sc = new SequenceSoundContainer({ effectGroups: [] }, 2)
      expect(sc.LoadedEffectID).toBeUndefined()
    })
  })

  describe('Init()', () => {
    it('resolves and returns the container instance', async () => {
      const sc = new SequenceSoundContainer(
        {
          effectGroups: [
            {
              type: 'group',
              id: makeSeqId(1),
              groupID: makeGroupId(1),
              effects: [makeEffect()],
              variant: 'Default'
            }
          ]
        },
        2 // Ctx.Effectless
      )
      const result = await sc.Init()
      expect(result).toBe(sc)
    })

    it('creates one NewSoundContainer per group element', async () => {
      const sc = new SequenceSoundContainer(
        {
          effectGroups: [
            { type: 'group', id: makeSeqId(1), groupID: makeGroupId(1), effects: [makeEffect()], variant: 'Default' },
            { type: 'group', id: makeSeqId(2), groupID: makeGroupId(2), effects: [makeEffect()], variant: 'Default' }
          ]
        },
        2
      )
      await sc.Init()
      expect(mockContainerFactory.MockNewSoundContainer).toHaveBeenCalledTimes(2)
    })

    it('skips delay elements when creating containers', async () => {
      const sc = new SequenceSoundContainer(
        {
          effectGroups: [
            { type: 'delay', id: makeSeqId(1), delayInMs: 1000 },
            { type: 'group', id: makeSeqId(2), groupID: makeGroupId(1), effects: [makeEffect()], variant: 'Default' }
          ]
        },
        2
      )
      await sc.Init()
      expect(mockContainerFactory.MockNewSoundContainer).toHaveBeenCalledTimes(1)
    })

    it('populates durationMap for each group element', async () => {
      mockContainerFactory.MockNewSoundContainer.mockImplementation(() => {
        const c = mockContainerFactory.createMockContainer()
        c.GetDuration.mockResolvedValue(3000)
        return c
      })

      const id1 = makeSeqId(1)
      const sc = new SequenceSoundContainer(
        {
          effectGroups: [{ type: 'group', id: id1, groupID: makeGroupId(1), effects: [makeEffect()], variant: 'Default' }]
        },
        2
      )
      await sc.Init()
      expect(sc.durationMap.get(id1)).toBe(3000)
    })
  })

  describe('GetDuration()', () => {
    it('returns 0 for an empty sequence', async () => {
      const sc = new SequenceSoundContainer({ effectGroups: [] }, 2)
      await sc.Init()
      expect(await sc.GetDuration()).toBe(0)
    })

    it('sums durations from durationMap', async () => {
      mockContainerFactory.MockNewSoundContainer.mockImplementation(() => {
        const c = mockContainerFactory.createMockContainer()
        c.GetDuration.mockResolvedValue(4000)
        return c
      })

      const sc = new SequenceSoundContainer(
        {
          effectGroups: [
            { type: 'group', id: makeSeqId(1), groupID: makeGroupId(1), effects: [makeEffect()], variant: 'Default' },
            { type: 'group', id: makeSeqId(2), groupID: makeGroupId(2), effects: [makeEffect()], variant: 'Default' }
          ]
        },
        2
      )
      await sc.Init()
      expect(await sc.GetDuration()).toBe(8000)
    })
  })

  describe('Stop()', () => {
    it('calls Stop() on all child containers', async () => {
      const sc = new SequenceSoundContainer(
        {
          effectGroups: [
            { type: 'group', id: makeSeqId(1), groupID: makeGroupId(1), effects: [makeEffect()], variant: 'Default' },
            { type: 'group', id: makeSeqId(2), groupID: makeGroupId(2), effects: [makeEffect()], variant: 'Default' }
          ]
        },
        2
      )
      await sc.Init()
      sc.Stop()
      for (const c of mockContainerFactory.containers) {
        expect(c.Stop).toHaveBeenCalledTimes(1)
      }
    })

    it('calls the stoppedHandler when stopped', async () => {
      const stoppedHandler = vi.fn()
      const sc = new SequenceSoundContainer(
        {
          effectGroups: [],
          stoppedHandler: { id: 'grp-test-1', handler: stoppedHandler }
        },
        2
      )
      await sc.Init()
      sc.Stop()
      expect(stoppedHandler).toHaveBeenCalledWith('grp-test-1', sc)
    })
  })

  describe('ChangeVolume()', () => {
    it('forwards to all child containers', async () => {
      const sc = new SequenceSoundContainer(
        {
          effectGroups: [
            { type: 'group', id: makeSeqId(1), groupID: makeGroupId(1), effects: [makeEffect()], variant: 'Default' }
          ]
        },
        2
      )
      await sc.Init()
      sc.ChangeVolume(60)
      expect(mockContainerFactory.containers[0].ChangeVolume).toHaveBeenCalledWith(60)
    })
  })

  describe('Fade()', () => {
    it('forwards ratio and fadeTime to all child containers', async () => {
      const sc = new SequenceSoundContainer(
        {
          effectGroups: [
            { type: 'group', id: makeSeqId(1), groupID: makeGroupId(1), effects: [makeEffect()], variant: 'Default' }
          ]
        },
        2
      )
      await sc.Init()
      sc.Fade(0.5, 500)
      expect(mockContainerFactory.containers[0].Fade).toHaveBeenCalledWith(0.5, 500)
    })
  })

  describe('ApiToSetupElements()', () => {
    it('converts a delay element correctly', async () => {
      const elements: SoundGroupSequenceElement[] = [
        { type: 'delay', id: makeSeqId(1), msToDelay: 2000 }
      ]
      const getSounds = vi.fn()
      const results = await Promise.all(SequenceSoundContainer.ApiToSetupElements(elements, getSounds))
      expect(results[0]).toEqual({ type: 'delay', id: makeSeqId(1), delayInMs: 2000 })
      expect(getSounds).not.toHaveBeenCalled()
    })

    it('converts a string delay to a number', async () => {
      const elements: SoundGroupSequenceElement[] = [
        { type: 'delay', id: makeSeqId(1), msToDelay: '1500' as unknown as number }
      ]
      const getSounds = vi.fn()
      const results = await Promise.all(SequenceSoundContainer.ApiToSetupElements(elements, getSounds))
      expect((results[0] as any).delayInMs).toBe(1500)
    })

    it('converts an invalid string delay to 0', async () => {
      const elements: SoundGroupSequenceElement[] = [
        { type: 'delay', id: makeSeqId(1), msToDelay: 'bad' as unknown as number }
      ]
      const getSounds = vi.fn()
      const results = await Promise.all(SequenceSoundContainer.ApiToSetupElements(elements, getSounds))
      expect((results[0] as any).delayInMs).toBe(0)
    })

    it('calls getSounds and converts a group element', async () => {
      const gid = makeGroupId(1)
      const elements: SoundGroupSequenceElement[] = [{ type: 'group', id: makeSeqId(1), groupID: gid }]
      const getSounds = vi.fn().mockResolvedValue({ variant: 'Default', sounds: [makeEffect()] })

      const results = await Promise.all(SequenceSoundContainer.ApiToSetupElements(elements, getSounds))
      expect(getSounds).toHaveBeenCalledWith(gid)
      expect(results[0]).toMatchObject({ type: 'group', groupID: gid, variant: 'Default' })
    })
  })

  describe('Play()', () => {
    it('plays each child container after its scheduled delay', async () => {
      const id1 = makeSeqId(1)
      const id2 = makeSeqId(2)

      // Container 1: 2000ms duration, Container 2: 3000ms duration
      let callCount = 0
      mockContainerFactory.MockNewSoundContainer.mockImplementation(() => {
        const c = mockContainerFactory.createMockContainer()
        c.GetDuration.mockResolvedValue(callCount++ === 0 ? 2000 : 3000)
        return c
      })

      const sc = new SequenceSoundContainer(
        {
          effectGroups: [
            { type: 'group', id: id1, groupID: makeGroupId(1), effects: [makeEffect()], variant: 'Default' },
            { type: 'group', id: id2, groupID: makeGroupId(2), effects: [makeEffect()], variant: 'Default' }
          ]
        },
        2
      )
      await sc.Init()

      sc.Play()

      // First container plays immediately (delay = 0)
      await vi.runAllTimersAsync()

      const [c1, c2] = mockContainerFactory.containers
      expect(c1.Play).toHaveBeenCalledTimes(1)
      expect(c2.Play).toHaveBeenCalledTimes(1)
    })
  })
})
