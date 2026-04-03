import { NewSoundContainer } from '@renderer/utils/soundContainer/util'
import { EffectID } from 'src/apis/audio/types/effects'
import { GetSoundsResponse, GroupID } from 'src/apis/audio/types/groups'
import { StateCreator, StoreApi } from 'zustand'
import { GroupSlice } from './groupSlice'
import {
  Handler,
  ISoundContainer,
  ISoundtrackContainer
} from '@renderer/utils/soundContainer/interface'
import { SequenceSoundContainer } from '@renderer/utils/soundContainer/variants/sequence'
import { isSequenceGroup, isSoundtrackContainer } from '@renderer/utils/typePredicates'
import { ISoundGroup, SoundGroupSequence, SoundIcon } from 'src/apis/audio/types/items'
import { Ctx } from '@renderer/rpgAudioEngine'
import { SoundVariant } from '@renderer/utils/soundVariants'

/**
 * Zustand slice that manages audio playback, including playing/stopping groups and soundtrack controls.
 */
export interface SoundSlice {
  playGroup: (groupID: GroupID) => Promise<void>
  stopGroup: (groupID: GroupID) => void
  getSounds: (groupID: GroupID) => Promise<GetSoundsResponse>
  activeSoundtrack: SoundTrackDetails | null
  playNextSong: () => void
  setMusicVolume: (newVolume: number) => void
  toggleInCave: () => void
  soundCtx(): Ctx
  isInCave: boolean
}

/**
 * Maps each playing group to the set of active sound container instances it owns.
 */
const GroupHandles: Map<GroupID, Array<ISoundContainer>> = new Map()

/**
 * Tracks the last-played effect ID per group to avoid immediate repeats in Rapid mode.
 */
const RepeatSoundIDs: Map<GroupID, EffectID> = new Map()

/**
 * Information about the currently active soundtrack track.
 */
export type SoundTrackDetails = {
  icon: SoundIcon
  groupName: string
  effectName: string
  groupID: GroupID
  volume: number
}

/**
 * Factory function that creates the sound playback slice for the Zustand store.
 */
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
  activeSoundtrack: null,
  playNextSong() {
    const activeSoundtracks = getActiveSongs(get)

    activeSoundtracks
      .flatMap((a) => GroupHandles.get(a.id))
      .filter((a) => a !== undefined && isSoundtrackContainer(a))
      .forEach(async (a) => await a.playNextSong())
  },
  setMusicVolume(newVolume) {
    const activeSoundtracks = getActiveSongs(get)

    activeSoundtracks
      .flatMap((a) => GroupHandles.get(a.id))
      .filter((a) => a !== undefined)
      .forEach(async (a) => a.ChangeVolume(newVolume))

    set(() => {
      const activeSoundtrack = get().activeSoundtrack
      if (activeSoundtrack === null) {
        return {}
      }

      return {
        activeSoundtrack: {
          ...activeSoundtrack,
          volume: newVolume
        }
      }
    })
  },
  async playGroup(groupID) {
    const group = window.audio.Groups.Get({
      groupID
    })

    if (group.group === undefined) {
      console.error(`Tried to play a group with ID ${groupID}, but it's not in the config.`)
      return
    }

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
            handler: (groupID: string) => handleGroupStop(groupID as GroupID, set, get)
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
            handler: (groupID: string) => handleGroupStop(groupID as GroupID, set, get)
          }
        },
        undefined,
        get().soundCtx()
      )

      if (isSoundtrackContainer(sound)) {
        const handler: Handler<string, ISoundContainer & ISoundtrackContainer> = {
          id: groupID,
          handler(groupID, container) {
            handleNextSong(groupID as GroupID, container, set, get)
          }
        }

        sound.on('playNext', handler)
      }
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
        .filter((g) => !isSoundtrack(g, get) && g.variant !== SoundVariant.Looping)
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
    if (!GroupHandles.has(groupID)) {
      return
    }

    const activeSoundtracks = getActiveSongs(get)
    const groups = GroupHandles.get(groupID)!
    if (groups) GroupHandles.get(groupID)?.forEach((handle) => handle.Stop())

    if (activeSoundtracks.some((ast) => ast.id === groupID)) {
      set({
        activeSoundtrack: null
      })
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

/**
 * Returns all currently playing groups that are soundtracks.
 */
function getActiveSongs(get: StoreApi<SoundSlice & GroupSlice>['getState']) {
  return get()
    .playingGroups.map((g) => get().getGroup(g))
    .filter((g) => isSoundtrack(g, get))
}

/**
 * Called when a group's sound container finishes playing; cleans up handles and fades soundtracks
 * back up if no more effects are active.
 */
function handleGroupStop(
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

/**
 * Updates the active soundtrack metadata in the store whenever the soundtrack advances to the next song.
 */
function handleNextSong(
  groupID: GroupID,
  sound: ISoundtrackContainer & ISoundContainer,
  set: StoreApi<SoundSlice & GroupSlice>['setState'],
  get: StoreApi<SoundSlice & GroupSlice>['getState']
) {
  const group = get().getGroup(groupID)
  const activeSong = sound.getActiveSong()

  set({
    activeSoundtrack: {
      groupID: groupID,
      icon: group.icon,
      groupName: group.name,
      effectName: activeSong?.name ?? '<unknown song>',
      volume: sound.Volume
    }
  })
}

/**
 * Type guard that narrows an ISoundGroup to SoundGroupSequence.
 */
function isSequence(sound: ISoundGroup): sound is SoundGroupSequence {
  return sound.variant === 'Sequence'
}

/**
 * Returns true if the group is a soundtrack or a sequence playlist composed entirely of soundtrack groups.
 */
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
