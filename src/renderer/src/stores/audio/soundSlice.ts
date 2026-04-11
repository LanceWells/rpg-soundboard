import { GetSoundsResponse, GroupID } from 'src/apis/audio/types/groups'
import { StateCreator, StoreApi } from 'zustand'
import { GroupSlice } from './groupSlice'
import { SoundIcon } from 'src/apis/audio/types/items'
import { SoundscapeManager } from '@renderer/rpgAudioEngine/manager/soundscapeManager'
import { ManagerListenerType } from '@renderer/rpgAudioEngine/manager/abstractSoundManager'

/**
 * Zustand slice that manages audio playback, including playing/stopping groups and soundtrack controls.
 */
export interface SoundSlice {
  playGroup: (groupID: GroupID) => Promise<void>
  stopGroup: (groupID: GroupID) => void
  getSounds: (groupID: GroupID) => Promise<GetSoundsResponse>
  playingGroups: GroupID[]
  activeSoundtrack: SoundTrackDetails | null
  playNextSong: () => void
  setMusicVolume: (newVolume: number) => void
  soundscape: SoundscapeManager
}

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
  soundscape: new SoundscapeManager()
    .on(ManagerListenerType.PlayNext, (mgr) => handleAlbumUpdate(mgr, set))
    .on(ManagerListenerType.AnySoundsStopped, (mgr) => updatePlayingGroups(mgr, set))
    .on(ManagerListenerType.AnySoundsStarted, (mgr) => updatePlayingGroups(mgr, set))
    .on(ManagerListenerType.EffectUpdated, (mgr) => handleAlbumUpdate(mgr, set)),
  playingGroups: [],
  isInCave: false,
  async getSounds(groupID) {
    return await window.audio.Groups.GetSounds({
      groupID
    })
  },
  activeSoundtrack: null,
  playNextSong() {
    get().soundscape.playNextSong()
  },
  setMusicVolume(newVolume) {
    get().soundscape.setMusicVolume(newVolume)
  },
  async playGroup(groupID) {
    get().soundscape.play(groupID)
  },
  stopGroup(groupID) {
    get().soundscape.stop(groupID)
  }
})

function handleAlbumUpdate(
  mgr: SoundscapeManager,
  set: StoreApi<SoundSlice & GroupSlice>['setState']
) {
  const id = mgr.ActiveSoundtrackID
  if (id === null) {
    set({
      activeSoundtrack: null
    })
    return
  }

  const { group } = window.audio.Groups.Get({ groupID: id })
  if (group === undefined) {
    set({
      activeSoundtrack: null
    })
    return
  }

  const container = mgr.ActiveSoundtrack
  if (container === null) {
    set({
      activeSoundtrack: null
    })
    return
  }

  set({
    activeSoundtrack: {
      groupID: id,
      icon: group.icon,
      groupName: group.name,
      effectName: container.getActiveSong()?.name ?? '<unknown song>',
      volume: container.Volume
    }
  })
}

function updatePlayingGroups(
  mgr: SoundscapeManager,
  set: StoreApi<SoundSlice & GroupSlice>['setState']
) {
  set({
    playingGroups: mgr.playingGroups()
  })
}
