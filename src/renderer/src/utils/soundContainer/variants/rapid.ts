import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { SoundEffectWithPlayerDetails } from 'src/apis/audio/types/groups'
import { getRandomArbitrary, getRandomInt } from '@renderer/utils/random'
import { SoundContainerSetup } from '../interface'
import { EffectID } from 'src/apis/audio/types/effects'
import { AbstractSoundContainerV2 } from '../abstractV2'
import { Ctx } from '@renderer/rpgAudioEngine'

export class RapidSoundContainer extends AbstractSoundContainerV2 {
  Variant: SoundVariants = 'Rapid'

  protected override SelectEffect(effects: SoundEffectWithPlayerDetails[]) {
    let effectIndex = 0

    if (effects.length > 2) {
      while (effects[effectIndex]?.id === this._lastEffectID) {
        effectIndex = getRandomInt(0, effects.length - 1)
      }
    }

    return effects[effectIndex]
  }

  constructor(setup: SoundContainerSetup, lastEffectID: EffectID | undefined, ctx?: Ctx) {
    super(setup, false, lastEffectID, ctx)
  }

  override Play() {
    const randomPan = getRandomArbitrary(-0.2, 0.2)
    const randomRate = getRandomArbitrary(0.8, 1.2)
    super.Play()
    super.Rate(randomRate)
    super.Pan(randomPan)
  }
}
