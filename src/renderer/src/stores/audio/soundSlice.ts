import { NewSoundContainer } from '@renderer/utils/soundContainer/util'
import { EffectID } from 'src/apis/audio/types/effects'
import { GetSoundsResponse, GroupID } from 'src/apis/audio/types/groups'
import { StateCreator, StoreApi } from 'zustand'
import { GroupSlice } from './groupSlice'
import { ISoundContainer } from '@renderer/utils/soundContainer/interface'

export interface SoundSlice {
  playGroup: (groupID: GroupID) => Promise<GetSoundsResponse>
  stopGroup: (groupID: GroupID) => void
}

const GroupHandles: Map<GroupID, Array<ISoundContainer>> = new Map()

const RepeatSoundIDs: Map<GroupID, EffectID> = new Map()

export const createSoundSlice: StateCreator<SoundSlice & GroupSlice, [], [], SoundSlice> = (
  set,
  get
) => ({
  async playGroup(groupID) {
    // let soundsToAvoid: EffectID[] = []

    // // If this is a repeat sound effect, then avoid playing the same sound that we last played.
    // if (RepeatSoundIDs.has(groupID)) {
    //   soundsToAvoid = [RepeatSoundIDs.get(groupID)!]
    // }

    // const audio = await window.audio.Groups.GetSound({
    //   groupID: groupID,
    //   idsToSkip: soundsToAvoid
    // })

    const audio = await window.audio.Groups.GetSounds({
      groupID
    })

    const playingSoundTracks = get()
      .playingGroups.map((g) => get().getGroup(g))
      .filter((g) => g?.variant === 'Soundtrack')

    // RepeatSoundIDs.set(groupID, audio.effectID)

    if (audio.variant === 'Soundtrack') {
      // If this is a soundtrack, and we already have one playing, then fade out the old soundtrack
      // and fade in the new soundtrack.
      playingSoundTracks.forEach((g) => get().stopGroup(g?.id as GroupID))
    } else {
      const remainingEffectsCount = get()
        .playingGroups.map((g) => get().getGroup(g))
        .filter((g) => ['Default', 'Rapid'].includes(g.variant))
        .flatMap((g) => g).length

      if (remainingEffectsCount === 0) {
        playingSoundTracks
          .flatMap((g) => GroupHandles.get(g.id))
          .filter((g) => !!g)
          .forEach((s) => s.Fade(0.2))
      }
    }

    // const sound = NewSoundContainer(audio.variant, RepeatSoundIDs.get(groupID), {
    //   format: audio.format,
    //   stopHandler: {
    //     id: groupID,
    //     handler: (groupID: GroupID) => handleHowlStop(groupID, set, get)
    //   },
    //   src: audio.soundB64,
    //   volume: audio.volume,
    //   useHtml5: audio.useHtml5
    // })

    const sound = NewSoundContainer(audio.variant, RepeatSoundIDs.get(groupID), {
      effects: audio.sounds,
      stopHandler: {
        id: groupID,
        handler: (groupID: GroupID) => handleHowlStop(groupID, set, get)
      }
    })

    RepeatSoundIDs.set(groupID, sound.LoadedEffectID)

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

    return audio
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
