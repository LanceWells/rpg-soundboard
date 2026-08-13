import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GroupID } from 'src/apis/audio/types/groups'

vi.mock('@renderer/rpgAudioEngine', () => ({
  Ctx: { Environmental: 0, Soundtrack: 1, Effectless: 2 },
  RpgAudio: vi.fn(),
  ListenerType: { Load: 0, Stop: 1, Play: 2 },
  RpgAudioState: { Loading: 0, Ready: 1, Playing: 2, Stopped: 3, Error: 4 }
}))

import { AbstractSoundManager, ManagerListenerType } from '../abstractSoundManager'

function makeContainer() {
  return {
    Variant: 'Default' as const,
    Volume: 100,
    Play: vi.fn(),
    Stop: vi.fn(),
    ChangeVolume: vi.fn(),
    Fade: vi.fn(),
    GetDuration: vi.fn().mockResolvedValue(1000),
    LoadedEffectID: undefined as any
  }
}

// Concrete subclass that exposes protected methods for testing
class TestManager extends AbstractSoundManager<ReturnType<typeof makeContainer>> {
  async play(_id: GroupID): Promise<void> {}

  expose_playInternal(id: GroupID, container: ReturnType<typeof makeContainer>) {
    return this.playInternal(id, container)
  }

  expose_onSoundEnd(id: GroupID) {
    this.onSoundEnd(id)
  }
}

const GRP_A = 'grp-aaaa-0000-0000-0000-0000' as GroupID
const GRP_B = 'grp-bbbb-0000-0000-0000-0000' as GroupID

describe('AbstractSoundManager', () => {
  let mgr: TestManager

  beforeEach(() => {
    mgr = new TestManager()
  })

  describe('playingGroups', () => {
    it('returns empty array before any sounds are played', () => {
      expect(mgr.playingGroups()).toEqual([])
    })

    it('includes a group after playInternal', async () => {
      await mgr.expose_playInternal(GRP_A, makeContainer())
      expect(mgr.playingGroups()).toContain(GRP_A)
    })

    it('lists the same group only once when multiple containers are queued', async () => {
      await mgr.expose_playInternal(GRP_A, makeContainer())
      await mgr.expose_playInternal(GRP_A, makeContainer())
      expect(mgr.playingGroups()).toHaveLength(1)
    })
  })

  describe('playInternal', () => {
    it('calls Play() on the container', async () => {
      const c = makeContainer()
      await mgr.expose_playInternal(GRP_A, c)
      expect(c.Play).toHaveBeenCalledTimes(1)
    })

    it('fires all AnySoundsStarted listeners', async () => {
      const l1 = vi.fn()
      const l2 = vi.fn()
      mgr.on(ManagerListenerType.AnySoundsStarted, l1)
      mgr.on(ManagerListenerType.AnySoundsStarted, l2)
      await mgr.expose_playInternal(GRP_A, makeContainer())
      expect(l1).toHaveBeenCalledWith(mgr)
      expect(l2).toHaveBeenCalledWith(mgr)
    })
  })

  describe('stop', () => {
    it('calls Stop() on every queued container for the group', async () => {
      const c1 = makeContainer()
      const c2 = makeContainer()
      await mgr.expose_playInternal(GRP_A, c1)
      await mgr.expose_playInternal(GRP_A, c2)
      mgr.stop(GRP_A)
      expect(c1.Stop).toHaveBeenCalledTimes(1)
      expect(c2.Stop).toHaveBeenCalledTimes(1)
    })

    it('warns and does nothing when the group has no active sounds', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mgr.stop(GRP_A)
      expect(warn).toHaveBeenCalledWith(expect.stringContaining(GRP_A))
      warn.mockRestore()
    })
  })

  describe('on — listener registration', () => {
    it.each([
      ['AllSoundsStopped', ManagerListenerType.AllSoundsStopped],
      ['AnySoundsStopped', ManagerListenerType.AnySoundsStopped],
      ['AnySoundsStarted', ManagerListenerType.AnySoundsStarted],
      ['PlayNext', ManagerListenerType.PlayNext],
      ['EffectUpdated', ManagerListenerType.EffectUpdated]
    ])('registers a %s listener without error', (_name, type) => {
      expect(() => mgr.on(type, vi.fn())).not.toThrow()
    })
  })

  describe('onSoundEnd', () => {
    it('is a no-op when the group is not in active sounds', () => {
      expect(() => mgr.expose_onSoundEnd(GRP_A)).not.toThrow()
    })

    it('removes the group from active sounds when its last container ends', async () => {
      await mgr.expose_playInternal(GRP_A, makeContainer())
      mgr.expose_onSoundEnd(GRP_A)
      expect(mgr.playingGroups()).not.toContain(GRP_A)
    })

    it('fires AnySoundsStopped when the group is fully done', async () => {
      const spy = vi.fn()
      mgr.on(ManagerListenerType.AnySoundsStopped, spy)
      await mgr.expose_playInternal(GRP_A, makeContainer())
      mgr.expose_onSoundEnd(GRP_A)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(mgr)
    })

    it('fires AllSoundsStopped when no active sounds remain', async () => {
      const spy = vi.fn()
      mgr.on(ManagerListenerType.AllSoundsStopped, spy)
      await mgr.expose_playInternal(GRP_A, makeContainer())
      mgr.expose_onSoundEnd(GRP_A)
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('dequeues (not removes) the group when multiple containers are queued', async () => {
      const anyDone = vi.fn()
      mgr.on(ManagerListenerType.AnySoundsStopped, anyDone)
      await mgr.expose_playInternal(GRP_A, makeContainer())
      await mgr.expose_playInternal(GRP_A, makeContainer())
      mgr.expose_onSoundEnd(GRP_A)
      expect(mgr.playingGroups()).toContain(GRP_A)
      expect(anyDone).not.toHaveBeenCalled()
    })

    it('does not fire AllSoundsStopped while other groups are still active', async () => {
      const allDone = vi.fn()
      mgr.on(ManagerListenerType.AllSoundsStopped, allDone)
      await mgr.expose_playInternal(GRP_A, makeContainer())
      await mgr.expose_playInternal(GRP_B, makeContainer())
      mgr.expose_onSoundEnd(GRP_A)
      expect(allDone).not.toHaveBeenCalled()
    })

    it('fires AllSoundsStopped once the final group ends', async () => {
      const allDone = vi.fn()
      mgr.on(ManagerListenerType.AllSoundsStopped, allDone)
      await mgr.expose_playInternal(GRP_A, makeContainer())
      await mgr.expose_playInternal(GRP_B, makeContainer())
      mgr.expose_onSoundEnd(GRP_A)
      mgr.expose_onSoundEnd(GRP_B)
      expect(allDone).toHaveBeenCalledTimes(1)
    })
  })
})
