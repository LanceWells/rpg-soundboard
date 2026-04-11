import { ISoundContainer } from '@renderer/utils/soundContainer/interface'
import { SequenceSoundContainer } from '@renderer/utils/soundContainer/variants/sequence'
import { GroupID } from 'src/apis/audio/types/groups'
import { SoundGroupSequence, SoundGroupSource } from 'src/apis/audio/types/items'
import { EffectID } from 'src/apis/audio/types/effects'
import { isSequenceGroup, isSourceGroup } from '@renderer/utils/typePredicates'
import { NewSoundContainer } from '@renderer/utils/soundContainer/util'
import { IRpgAudioManager } from './interface'
import { AbstractSoundManager } from './abstractSoundManager'

export class SoundEffectManager
  extends AbstractSoundManager<ISoundContainer>
  implements IRpgAudioManager
{
  private _lastPlayedEffect: Map<GroupID, EffectID | undefined>

  constructor() {
    super()
    this._lastPlayedEffect = new Map()
  }

  async play(groupID: GroupID): Promise<void> {
    const group = window.audio.Groups.Get({
      groupID
    }).group

    if (group === undefined) {
      console.warn(`Could not find a group with ID ${groupID}.`)
      return
    }

    let sound: ISoundContainer

    if (isSequenceGroup(group)) {
      sound = await this.groupToSequenceContainer(group)
    } else if (isSourceGroup(group)) {
      sound = await this.groupToSourceContainer(group)
      this._lastPlayedEffect.set(group.id, sound.LoadedEffectID)
    } else {
      console.warn(`Invalid group type ${group.id}`)
      return
    }

    this.playInternal(group.id, sound)
  }

  private async groupToSequenceContainer(group: SoundGroupSequence) {
    const effectGroupPromises = SequenceSoundContainer.ApiToSetupElements(group.sequence)
    const effectGroups = await Promise.all(effectGroupPromises)

    const sound = new SequenceSoundContainer(
      {
        effectGroups,
        stoppedHandler: {
          id: group.id,
          handler: this.onSoundEnd.bind(this)
        }
      },
      this.soundCtx()
    )

    await sound.Init()

    return sound
  }

  private async groupToSourceContainer(group: SoundGroupSource) {
    const sounds = await window.audio.Groups.GetSounds({
      groupID: group.id
    })

    const sound = NewSoundContainer(
      sounds.variant,
      this._lastPlayedEffect.get(group.id),
      {
        effects: sounds.sounds,
        stopHandler: {
          id: group.id,
          handler: this.onSoundEnd.bind(this)
        }
      },
      undefined,
      this.soundCtx()
    )

    return sound
  }
}
