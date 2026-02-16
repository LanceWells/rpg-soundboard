import { NewSoundContainer } from '@renderer/utils/soundContainer/util'
import { EffectID } from 'src/apis/audio/types/effects'
import { GetSoundsResponse, GroupID } from 'src/apis/audio/types/groups'
import { StateCreator, StoreApi } from 'zustand'
import { GroupSlice } from './groupSlice'
import { ISoundContainer } from '@renderer/utils/soundContainer/interface'
import { SequenceSoundContainer } from '@renderer/utils/soundContainer/variants/sequence'
import { isSequenceGroup } from '@renderer/utils/typePredicates'
import { ISoundGroup, SoundGroupSequence } from 'src/apis/audio/types/items'
import { Ctx } from '@renderer/rpgAudioEngine'

export interface SoundSlice {
  playGroup: (groupID: GroupID) => Promise<void>
  stopGroup: (groupID: GroupID) => void
  getSounds: (groupID: GroupID) => Promise<GetSoundsResponse>
  toggleInCave: () => void
  soundCtx(): Ctx
  isInCave: boolean
}

const GroupHandles: Map<GroupID, Array<ISoundContainer>> = new Map()

const RepeatSoundIDs: Map<GroupID, EffectID> = new Map()

export const createSoundSlice: StateCreator<SoundSlice & GroupSlice, [], [], SoundSlice> = (
  set,
  get
) => ({
  isInCave: false,
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
    if (isSequenceGroup(group.group)) {
      const effectGroupPromises = SequenceSoundContainer.ApiToSetupElements(
        group.group.sequence,
        get().getSounds
      )

      const effectGroups = await Promise.all(effectGroupPromises)
      sound = await new SequenceSoundContainer(
        {
          effectGroups,
          stoppedHandler: {
            id: groupID,
            handler: (groupID: string) => handleHowlStop(groupID as GroupID, set, get)
          }
        },
        get().soundCtx()
      ).Init()
    } else {
      const audio = await window.audio.Groups.GetSounds({
        groupID
      })

      sound = NewSoundContainer(
        audio.variant,
        RepeatSoundIDs.get(groupID),
        {
          effects: audio.sounds,
          stopHandler: {
            id: groupID,
            handler: (groupID: string) => handleHowlStop(groupID as GroupID, set, get)
          }
        },
        undefined,
        get().soundCtx()
      )
    }

    const playingSoundTracks = get()
      .playingGroups.map((g) => get().getGroup(g))
      .filter((g) => isSoundtrack(g, get))

    if (isSoundtrack(group.group, get)) {
      // If this is a soundtrack, and we already have one playing, then fade out the old soundtrack
      // and fade in the new soundtrack.
      playingSoundTracks.forEach((g) => get().stopGroup(g?.id as GroupID))
    } else {
      const remainingEffectsCount = get()
        .playingGroups.map((g) => get().getGroup(g))
        // .filter((g) => g.type === 'sequence' || ['Default', 'Rapid'].includes(g.variant))
        .filter((g) => !isSoundtrack(g, get))
        .flatMap((g) => g).length

      if (remainingEffectsCount === 0) {
        playingSoundTracks
          .flatMap((g) => GroupHandles.get(g.id))
          .filter((g) => !!g)
          .forEach((s) => s.Fade(0.1, 50))
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
  },
  toggleInCave() {
    set(() => {
      return {
        isInCave: !get().isInCave
      }
    })
  },
  soundCtx() {
    if (get().isInCave) {
      return Ctx.Environmental
    }
    return Ctx.Effectless
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
        .filter((g) => isSoundtrack(g, get))
        .flatMap((g) => GroupHandles.get(g.id))
        .filter((g) => !!g)
        .forEach((s) => s.Fade(1, 3500))
    }
  }

  set(() => {
    const newGroups = [...GroupHandles.keys()]
    return {
      playingGroups: newGroups
    }
  })
}

function isSequence(sound: ISoundGroup): sound is SoundGroupSequence {
  return sound.variant === 'Sequence'
}

function isSoundtrack(g: ISoundGroup | undefined, get: () => GroupSlice): boolean {
  if (g === undefined) {
    return false
  }
  if (g.type !== 'sequence' && g.variant === 'Soundtrack') {
    return true
  }
  if (isSequence(g)) {
    const isPlaylist = g.sequence
      .filter((g) => g.type === 'group')
      .every((g) => get().getGroup(g.groupID).variant === 'Soundtrack')

    return isPlaylist
  }

  return false
}
