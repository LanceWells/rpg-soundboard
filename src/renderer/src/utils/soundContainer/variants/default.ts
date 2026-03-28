import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { SoundContainerSetup } from '../interface'
import { AbstractSoundContainerV2 } from '../abstractV2'
import { Ctx } from '@renderer/rpgAudioEngine'

/**
 * Sound container for the Default variant: plays a randomly selected effect once without looping.
 */
export class DefaultSoundContainer extends AbstractSoundContainerV2 {
  Variant: SoundVariants = 'Default'

  constructor(setup: SoundContainerSetup, ctx?: Ctx) {
    super(setup, false, undefined, ctx)
  }
}
