import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { GroupID } from 'src/apis/audio/types/groups'
import type { EffectID } from 'src/apis/audio/types/effects'
import type { SoundEffectWithPlayerDetails } from 'src/apis/audio/types/groups'

// ---------------------------------------------------------------------------
// Hoisted mock state
// ---------------------------------------------------------------------------

const mockContainerState = vi.hoisted(() => {
  const instances: any[] = []

  const createContainer = (variant = 'Default') => {
    const c: any = {
      Variant: variant,
      Volume: 100,
      LoadedEffectID: 'eff-loaded-id' as EffectID,
      Play: vi.fn(),
      Stop: vi.fn(),
      ChangeVolume: vi.fn(),
      Fade: vi.fn(),
      GetDuration: vi.fn().mockResolvedValue(1000)
    }
    instances.push(c)
    return c
  }

  const MockNewSoundContainer = vi.fn().mockImplementation((variant: string) =>
    createContainer(variant)
  )

  return { MockNewSoundContainer, instances, createContainer }
})

const mockSequenceState = vi.hoisted(() => {
  const instances: any[] = []

  const MockSequenceSoundContainer: any = vi.fn().mockImplementation(function (this: any) {
    this.Variant = 'Sequence'
    this.Volume = 1
    this.LoadedEffectID = undefined
    this.Play = vi.fn()
    this.Stop = vi.fn()
    this.ChangeVolume = vi.fn()
    this.Fade = vi.fn()
    this.GetDuration = vi.fn().mockResolvedValue(1000)
    this.Init = vi.fn().mockResolvedValue(this)
    instances.push(this)
  })

  MockSequenceSoundContainer.ApiToSetupElements = vi.fn().mockReturnValue([
    Promise.resolve({ type: 'group', id: 'seq-000-000-000-000-000', groupID: 'grp-sub' })
  ])

  return { MockSequenceSoundContainer, instances }
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

vi.mock('@renderer/utils/soundContainer/util', () => ({
  NewSoundContainer: mockContainerState.MockNewSoundContainer
}))

vi.mock('@renderer/utils/soundContainer/variants/sequence', () => ({
  SequenceSoundContainer: mockSequenceState.MockSequenceSoundContainer
}))

// ---------------------------------------------------------------------------
// Import under test (after mocks)
// ---------------------------------------------------------------------------

import { SoundEffectManager } from '../soundEffectManager'

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

function makeSourceGroup(id: GroupID, variant = 'Default') {
  return { id, type: 'source' as const, variant, name: 'Test Group' }
}

function makeSequenceGroup(id: GroupID) {
  return { id, type: 'sequence' as const, variant: 'Sequence', name: 'Test Seq', sequence: [] }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SoundEffectManager', () => {
  let mgr: SoundEffectManager
  let mockAudio: any

  beforeEach(() => {
    mockContainerState.instances.length = 0
    mockContainerState.MockNewSoundContainer.mockClear()
    mockSequenceState.instances.length = 0
    mockSequenceState.MockSequenceSoundContainer.mockClear()
    mockSequenceState.MockSequenceSoundContainer.ApiToSetupElements.mockClear()

    mockAudio = {
      Groups: {
        Get: vi.fn().mockReturnValue({ group: undefined }),
        GetSounds: vi.fn().mockResolvedValue({ variant: 'Default', sounds: [makeEffect()] })
      }
    }
    vi.stubGlobal('audio', mockAudio)

    mgr = new SoundEffectManager()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('warns and returns when the group is not found', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await mgr.play(GRP_A)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining(GRP_A))
    expect(mgr.playingGroups()).toHaveLength(0)
    warn.mockRestore()
  })

  describe('source groups', () => {
    it('fetches sounds for the group', async () => {
      mockAudio.Groups.Get.mockReturnValue({ group: makeSourceGroup(GRP_A) })
      await mgr.play(GRP_A)
      expect(mockAudio.Groups.GetSounds).toHaveBeenCalledWith({ groupID: GRP_A })
    })

    it('creates a container via NewSoundContainer', async () => {
      mockAudio.Groups.Get.mockReturnValue({ group: makeSourceGroup(GRP_A) })
      await mgr.play(GRP_A)
      expect(mockContainerState.MockNewSoundContainer).toHaveBeenCalledTimes(1)
    })

    it('passes the variant from GetSounds to NewSoundContainer', async () => {
      mockAudio.Groups.Get.mockReturnValue({ group: makeSourceGroup(GRP_A, 'Rapid') })
      mockAudio.Groups.GetSounds.mockResolvedValue({ variant: 'Rapid', sounds: [makeEffect()] })
      await mgr.play(GRP_A)
      expect(mockContainerState.MockNewSoundContainer.mock.calls[0][0]).toBe('Rapid')
    })

    it('registers the group in playingGroups', async () => {
      mockAudio.Groups.Get.mockReturnValue({ group: makeSourceGroup(GRP_A) })
      await mgr.play(GRP_A)
      expect(mgr.playingGroups()).toContain(GRP_A)
    })

    it('calls Play() on the container', async () => {
      mockAudio.Groups.Get.mockReturnValue({ group: makeSourceGroup(GRP_A) })
      await mgr.play(GRP_A)
      expect(mockContainerState.instances[0].Play).toHaveBeenCalledTimes(1)
    })

    it('passes lastEffectID to NewSoundContainer on subsequent plays', async () => {
      const firstEffectID = 'eff-first-bbb-ccc-ddd-eee' as EffectID
      mockContainerState.MockNewSoundContainer.mockReturnValueOnce({
        ...mockContainerState.createContainer('Rapid'),
        LoadedEffectID: firstEffectID
      })
      mockAudio.Groups.Get.mockReturnValue({ group: makeSourceGroup(GRP_A, 'Rapid') })
      mockAudio.Groups.GetSounds.mockResolvedValue({ variant: 'Rapid', sounds: [makeEffect()] })

      await mgr.play(GRP_A)
      await mgr.play(GRP_A)

      const secondCallLastEffectArg = mockContainerState.MockNewSoundContainer.mock.calls[1][1]
      expect(secondCallLastEffectArg).toBe(firstEffectID)
    })
  })

  describe('sequence groups', () => {
    it('calls ApiToSetupElements with the sequence elements', async () => {
      const seqGroup = makeSequenceGroup(GRP_A)
      mockAudio.Groups.Get.mockReturnValue({ group: seqGroup })
      await mgr.play(GRP_A)
      expect(mockSequenceState.MockSequenceSoundContainer.ApiToSetupElements).toHaveBeenCalledWith(
        seqGroup.sequence
      )
    })

    it('creates a SequenceSoundContainer', async () => {
      mockAudio.Groups.Get.mockReturnValue({ group: makeSequenceGroup(GRP_A) })
      await mgr.play(GRP_A)
      expect(mockSequenceState.MockSequenceSoundContainer).toHaveBeenCalledTimes(1)
    })

    it('calls Init() on the SequenceSoundContainer', async () => {
      mockAudio.Groups.Get.mockReturnValue({ group: makeSequenceGroup(GRP_A) })
      await mgr.play(GRP_A)
      expect(mockSequenceState.instances[0].Init).toHaveBeenCalledTimes(1)
    })

    it('registers the group in playingGroups', async () => {
      mockAudio.Groups.Get.mockReturnValue({ group: makeSequenceGroup(GRP_A) })
      await mgr.play(GRP_A)
      expect(mgr.playingGroups()).toContain(GRP_A)
    })
  })
})
