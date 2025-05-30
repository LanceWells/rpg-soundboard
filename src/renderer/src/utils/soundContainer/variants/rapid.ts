import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { AbstractSoundContainer } from '../abstract'
import { GroupID, SoundEffectWithPlayerDetails } from 'src/apis/audio/types/groups'
import { getRandomArbitrary, getRandomInt } from '@renderer/utils/random'
import { SoundContainerSetup } from '../interface'
import { EffectID } from 'src/apis/audio/types/effects'

export class RapidSoundContainer extends AbstractSoundContainer {
  Variant: SoundVariants = 'Rapid'

  protected override SelectEffect(effects: SoundEffectWithPlayerDetails[]) {
    let effectIndex = 0

    while (effects[effectIndex]?.id === this._lastEffectID) {
      effectIndex = getRandomInt(0, effects.length - 1)
    }

    return effects[effectIndex]
  }

  constructor(setup: SoundContainerSetup, lastEffectID: EffectID | undefined) {
    super(setup, false, lastEffectID)
  }

  override Play() {
    const randomRate = getRandomArbitrary(0.8, 1.2)
    super.Play()
    this.howl.rate(randomRate)
  }
}
