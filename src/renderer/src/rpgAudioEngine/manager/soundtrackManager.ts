import { IRpgAudioManager } from './interface'
import { ISoundContainer, ISoundtrackContainer } from '@renderer/utils/soundContainer/interface'
import { SoundtrackSoundContainerV2 } from '@renderer/utils/soundContainer/variants/soundtrackV2'
import { AbstractSoundManager } from './abstractSoundManager'
import { GroupID } from 'src/apis/audio/types/groups'

export class SoundtrackManager
  extends AbstractSoundManager<ISoundtrackContainer & ISoundContainer>
  implements IRpgAudioManager
{
  private _activeSoundtrackID: GroupID | null

  public get ActiveSoundtrack(): (ISoundContainer & ISoundtrackContainer) | null {
    if (this._activeSoundtrackID === null) {
      return null
    }

    const container = this._activeSounds.get(this._activeSoundtrackID)
    if (container === undefined || container.length !== 1) {
      return null
    }

    return container[0]
  }

  public get ActiveSoundtrackID(): GroupID | null {
    return this._activeSoundtrackID
  }

  constructor() {
    super()
    this._activeSoundtrackID = null
  }

  async play(groupID: GroupID): Promise<void> {
    const group = window.audio.Groups.Get({
      groupID
    }).group

    if (group === undefined) {
      console.warn(`Could not find a group with ID ${groupID}.`)
      return
    }

    const audio = await window.audio.Groups.GetSounds({ groupID: group.id })
    const sound = new SoundtrackSoundContainerV2({
      effects: audio.sounds,
      stopHandler: {
        id: group.id,
        handler: this.onSoundEnd.bind(this)
      }
    })

    sound.on('playNext', {
      id: group.id,
      handler: this.handlePlayNext.bind(this)
    })

    // Stop all playing soundtracks if we're playing another one.
    this._activeSounds
      .values()
      .flatMap((s) => s)
      .forEach((s) => s.Stop())

    this.playInternal(group.id, sound)
  }

  override stop(groupID: GroupID): void {
    this._activeSoundtrackID = null
    super.stop(groupID)
  }

  private handlePlayNext(groupID: GroupID, _container: ISoundtrackContainer & ISoundContainer) {
    this._activeSoundtrackID = groupID
    this._playNextListeners.forEach((l) => l(this))
  }
}
