import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { GroupID, SoundEffectWithPlayerDetails } from 'src/apis/audio/types/groups'
import { getRandomArbitrary, getRandomInt } from '@renderer/utils/random'
import { SoundContainerSetup } from '../interface'
import { EffectID } from 'src/apis/audio/types/effects'
import { AbstractSoundContainerV2 } from '../abstractV2'
import { Ctx } from '@renderer/rpgAudioEngine'

/**
 * Sound container for the Rapid variant: plays a randomly selected effect with randomized pan and rate, avoiding immediate repeats.
 */
export class RapidSoundContainer<
  TStopped extends string = GroupID,
  TLoaded extends string = GroupID,
  TPlaying extends string = GroupID
> extends AbstractSoundContainerV2<TStopped, TLoaded, TPlaying> {
  Variant: SoundVariants = 'Rapid'

  protected override SelectEffect(effects: SoundEffectWithPlayerDetails[]) {
    let effectIndex = getRandomInt(0, effects.length - 1)

    if (effects.length > 2) {
      while (effects[effectIndex]?.id === this._lastEffectID) {
        effectIndex = getRandomInt(0, effects.length - 1)
      }
    }

    return effects[effectIndex]
  }

  constructor(
    setup: SoundContainerSetup<TStopped, TLoaded, TPlaying>,
    lastEffectID: EffectID | undefined,
    ctx?: Ctx
  ) {
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
