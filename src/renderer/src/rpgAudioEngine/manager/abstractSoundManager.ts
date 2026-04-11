import { GroupID } from 'src/apis/audio/types/groups'
import { Ctx } from '..'
import { IRpgAudioManager } from './interface'
import { ISoundContainer } from '@renderer/utils/soundContainer/interface'

export enum ManagerListenerType {
  AllSoundsStopped,
  AnySoundsStopped,
  AnySoundsStarted,
  PlayNext,
  EffectUpdated
}

export abstract class AbstractSoundManager<TContainer extends ISoundContainer>
  implements IRpgAudioManager
{
  protected _activeSounds: Map<GroupID, TContainer[]>

  protected _allSoundsDoneListeners: ((e: IRpgAudioManager) => void)[] = []
  protected _playNextListeners: ((e: IRpgAudioManager) => void)[] = []
  protected _anySoundsDoneListeners: ((e: IRpgAudioManager) => void)[] = []
  protected _anySoundsStartedListeners: ((e: IRpgAudioManager) => void)[] = []
  protected _anySoundsUpdatedListeners: ((e: IRpgAudioManager) => void)[] = []

  constructor() {
    this._activeSounds = new Map()
  }

  playingGroups(): GroupID[] {
    return [...this._activeSounds.keys()]
  }

  abstract play(groupID: GroupID): Promise<void>

  protected async playInternal(groupID: GroupID, container: TContainer) {
    if (!this._activeSounds.has(groupID)) {
      this._activeSounds.set(groupID, [])
    }

    this._activeSounds.get(groupID)!.push(container)
    container.Play()
    this._anySoundsStartedListeners.forEach((l) => l(this))
  }

  stop(groupID: GroupID) {
    if (!this._activeSounds.has(groupID)) {
      console.warn(`Tried to stop a group with ID ${groupID}, but it didn't have a reference.`)
      return
    }

    const sound = this._activeSounds.get(groupID)!
    sound.forEach((s) => {
      s.Stop()
    })

    this._activeSounds.delete(groupID)
    // this._anySoundsDoneListeners.forEach((l) => l(this))
  }

  on(listenOn: ManagerListenerType, callback: (e: IRpgAudioManager) => void) {
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
  }

  protected soundCtx() {
    return Ctx.Effectless
  }

  protected onSoundEnd(groupID: GroupID) {
    // There are 2 ways to get in here:
    //    1. We intentionally stopped the sound - we don't have it in our active sounds.
    //    2. The sound ran out of stuff to say - we have it in our active sounds.
    if (!this._activeSounds.has(groupID)) {
      return
    }

    // If we have more than one element, we just want to dequeue the first element.
    const handles = this._activeSounds.get(groupID)!
    if (handles.length > 1) {
      handles.splice(0, 1)
    } else {
      this._activeSounds.delete(groupID)
      this._anySoundsDoneListeners.forEach((l) => l(this))
    }

    const remainingEffectsCount = [...this._activeSounds.values()].flat().length
    if (remainingEffectsCount === 0) {
      this._allSoundsDoneListeners.forEach((l) => l(this))
    }
  }
}
