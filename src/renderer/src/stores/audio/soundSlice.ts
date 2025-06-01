import { NewSoundContainer } from '@renderer/utils/soundContainer/util'
import { EffectID } from 'src/apis/audio/types/effects'
import { GetSoundsResponse, GroupID } from 'src/apis/audio/types/groups'
import { StateCreator, StoreApi } from 'zustand'
import { GroupSlice } from './groupSlice'
import { ISoundContainer } from '@renderer/utils/soundContainer/interface'
import { SequenceSoundContainer } from '@renderer/utils/soundContainer/variants/sequence'

export interface SoundSlice {
  playGroup: (groupID: GroupID) => Promise<void>
  stopGroup: (groupID: GroupID) => void
  getSounds: (groupID: GroupID) => Promise<GetSoundsResponse>
}

const GroupHandles: Map<GroupID, Array<ISoundContainer>> = new Map()

const RepeatSoundIDs: Map<GroupID, EffectID> = new Map()

export const createSoundSlice: StateCreator<SoundSlice & GroupSlice, [], [], SoundSlice> = (
  set,
  get
) => ({
  async getSounds(groupID) {
    return await window.audio.Groups.GetSounds({
      groupID
    })
  },
  async playGroup(groupID) {
    const group = window.audio.Groups.Get({
      groupID
    })

    let sound: ISoundContainer
    if (group.group?.type === 'sequence') {
      const effectGroupPromises = SequenceSoundContainer.ApiToSetupElements(
        group.group.sequence,
        get().getSounds
      )

      const effectGroups = await Promise.all(effectGroupPromises)
      sound = await new SequenceSoundContainer({
        effectGroups,
        stoppedHandler: {
          id: groupID,
          handler: (groupID: string) => handleHowlStop(groupID as GroupID, set, get)
        }
      }).Init()
    } else {
      const audio = await window.audio.Groups.GetSounds({
        groupID
      })

      sound = NewSoundContainer(audio.variant, RepeatSoundIDs.get(groupID), {
        effects: audio.sounds,
        stopHandler: {
          id: groupID,
          handler: (groupID: string) => handleHowlStop(groupID as GroupID, set, get)
        }
      })
    }

    const playingSoundTracks = get()
      .playingGroups.map((g) => get().getGroup(g))
      .filter((g) => g.type !== 'sequence' && g.variant === 'Soundtrack')

    if (group.group?.type !== 'sequence' && group.group?.variant === 'Soundtrack') {
      // If this is a soundtrack, and we already have one playing, then fade out the old soundtrack
      // and fade in the new soundtrack.
      playingSoundTracks.forEach((g) => get().stopGroup(g?.id as GroupID))
    } else {
      const remainingEffectsCount = get()
        .playingGroups.map((g) => get().getGroup(g))
        .filter((g) => g.type === 'sequence' || ['Default', 'Rapid'].includes(g.variant))
        .flatMap((g) => g).length

      if (remainingEffectsCount === 0) {
        playingSoundTracks
          .flatMap((g) => GroupHandles.get(g.id))
          .filter((g) => !!g)
          .forEach((s) => s.Fade(0.2))
      }
    }

    if (sound.LoadedEffectID) {
      RepeatSoundIDs.set(groupID, sound.LoadedEffectID)
    }

    if (!GroupHandles.has(groupID)) {
      GroupHandles.set(groupID, [])
    }

    GroupHandles.get(groupID)?.push(sound)

    set((state) => {
      return {
        playingGroups: [...state.playingGroups, groupID]
      }
    })

    sound.Play()
  },
  stopGroup(groupID) {
    if (GroupHandles.has(groupID)) {
      GroupHandles.get(groupID)?.forEach((handle) => handle.Stop())
    }
  }
})

function handleHowlStop(
  groupID: GroupID,
  set: StoreApi<SoundSlice & GroupSlice>['setState'],
  get: StoreApi<SoundSlice & GroupSlice>['getState']
) {
  if (GroupHandles.has(groupID)) {
    const handles = GroupHandles.get(groupID)!

    if (handles.length > 1) {
      handles.splice(0, 1)
    } else {
      GroupHandles.delete(groupID)
    }

    const remainingEffectsCount = [...GroupHandles.values()]
      .flatMap((g) => g)
      .filter((g) => ['Default', 'Rapid'].includes(g.Variant)).length

    if (remainingEffectsCount === 0) {
      get()
        .playingGroups.map((g) => get().getGroup(g))
        .filter((g) => g?.variant === 'Soundtrack')
        .flatMap((g) => GroupHandles.get(g.id))
        .filter((g) => !!g)
        .forEach((s) => s.Fade(1))
    }
  }

  set(() => {
    const newGroups = [...GroupHandles.keys()]
    return {
      playingGroups: newGroups
    }
  })
}
