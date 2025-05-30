import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { AbstractSoundContainer } from '../abstract'
import { SoundContainerSetup } from '../interface'

export class DefaultSoundContainer extends AbstractSoundContainer {
  Variant: SoundVariants = 'Default'

  constructor(setup: SoundContainerSetup) {
    super(setup, false)
  }
}
