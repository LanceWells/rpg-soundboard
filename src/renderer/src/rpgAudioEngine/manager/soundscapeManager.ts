import { IRpgAudioManager } from './interface'
import { GroupID } from 'src/apis/audio/types/groups'
import { SoundtrackManager } from './soundtrackManager'
import { SoundEffectManager } from './soundEffectManager'
import { ISoundContainer, ISoundtrackContainer } from '@renderer/utils/soundContainer/interface'
import { ManagerListenerType } from './abstractSoundManager'

export class SoundscapeManager implements IRpgAudioManager {
  private _soundtracks: SoundtrackManager
  private _soundEffects: SoundEffectManager

  private _allSoundsDoneListeners: ((e: SoundscapeManager) => void)[] = []
  private _anySoundsDoneListeners: ((e: SoundscapeManager) => void)[] = []
  private _playNextListeners: ((e: SoundscapeManager) => void)[] = []
  private _anySoundsStartedListeners: ((e: SoundscapeManager) => void)[] = []
  protected _anySoundsUpdatedListeners: ((e: SoundscapeManager) => void)[] = []

  public get ActiveSoundtrack(): (ISoundContainer & ISoundtrackContainer) | null {
    return this._soundtracks.ActiveSoundtrack
  }

  public get ActiveSoundtrackID(): GroupID | null {
    return this._soundtracks.ActiveSoundtrackID
  }

  constructor() {
    this._soundtracks = new SoundtrackManager()
    this._soundEffects = new SoundEffectManager()

    this._soundEffects.on(ManagerListenerType.AllSoundsStopped, this.onAllEffectsDone.bind(this))
    this._soundEffects.on(ManagerListenerType.AnySoundsStopped, this.onAnyEffectsDone.bind(this))
    this._soundEffects.on(ManagerListenerType.AnySoundsStarted, this.onAnySoundsStarted.bind(this))

    this._soundtracks.on(ManagerListenerType.PlayNext, this.onPlayNextSong.bind(this))
    this._soundtracks.on(ManagerListenerType.AnySoundsStarted, this.onAnySoundsStarted.bind(this))
    this._soundtracks.on(ManagerListenerType.AnySoundsStopped, this.onPlayNextSong.bind(this))
    this._soundtracks.on(ManagerListenerType.AnySoundsStopped, this.onAnyEffectsDone.bind(this))
  }

  playingGroups(): GroupID[] {
    const effectIDs = this._soundEffects.playingGroups()
    const musicIDs = this._soundtracks.playingGroups()
    return effectIDs.concat(musicIDs)
  }

  stop(groupID: GroupID): void {
    const group = window.audio.Groups.Get({
      groupID
    }).group

    if (group === undefined) {
      console.warn(`Could not find a group with ID ${groupID}.`)
      return
    }

    if (group.variant === 'Soundtrack') {
      this._soundtracks.stop(groupID)
    } else {
      this._soundEffects.stop(groupID)
    }
  }

  async play(groupID: GroupID): Promise<void> {
    const group = window.audio.Groups.Get({
      groupID
    }).group

    if (group === undefined) {
      console.warn(`Could not find a group with ID ${groupID}.`)
      return
    }

    if (group.variant === 'Soundtrack') {
      this._soundtracks.play(groupID)
    } else {
      this.fade(0.15, 50)
      this._soundEffects.play(groupID)
    }

    this._anySoundsStartedListeners.forEach((l) => l(this))
  }

  on(listenOn: ManagerListenerType, callback: (e: SoundscapeManager) => void): SoundscapeManager {
    switch (listenOn) {
      case ManagerListenerType.AllSoundsStopped:
        this._allSoundsDoneListeners.push(callback)
        break
      case ManagerListenerType.PlayNext:
        this._playNextListeners.push(callback)
        break
      case ManagerListenerType.AnySoundsStopped:
        this._anySoundsDoneListeners.push(callback)
        break
      case ManagerListenerType.AnySoundsStarted:
        this._anySoundsStartedListeners.push(callback)
        break
      case ManagerListenerType.EffectUpdated:
        this._anySoundsUpdatedListeners.push(callback)
        break
    }

    return this
  }

  playNextSong() {
    const active = this.ActiveSoundtrack
    if (!active) {
      return
    }

    active.playNextSong()
  }

  setMusicVolume(newVolume: number) {
    const active = this.ActiveSoundtrack
    if (!active) {
      return
    }

    active.ChangeVolume(newVolume)
    this._anySoundsUpdatedListeners.forEach((l) => l(this))
  }

  fade(ratio: number, fadeTime: number) {
    const active = this.ActiveSoundtrack
    if (!active) {
      return
    }

    active.Fade(ratio, fadeTime)
  }

  private onAllEffectsDone(_mgr: IRpgAudioManager) {
    this.fade(1, 3500)
  }

  private onPlayNextSong(_mgr: IRpgAudioManager) {
    this._playNextListeners.forEach((l) => l(this))
  }

  private onAnyEffectsDone(_mgr: IRpgAudioManager) {
    this._anySoundsDoneListeners.forEach((l) => l(this))
  }

  private onAnySoundsStarted(_mgr: IRpgAudioManager) {
    this._anySoundsStartedListeners.forEach((l) => l(this))
  }
}
