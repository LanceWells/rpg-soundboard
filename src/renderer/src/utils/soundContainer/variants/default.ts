import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { SoundContainerSetup } from '../interface'
import { AbstractSoundContainerV2 } from '../abstractV2'

export class DefaultSoundContainer extends AbstractSoundContainerV2 {
  Variant: SoundVariants = 'Default'

  constructor(setup: SoundContainerSetup) {
    super(setup, false)
  }
}
