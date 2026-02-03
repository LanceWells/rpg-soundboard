import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { AbstractSoundContainer } from '../abstract'
import { SoundContainerSetup } from '../interface'
import { AbstractSoundContainerV2 } from '../abstractV2'

export class LoopingSoundContainer extends AbstractSoundContainerV2 {
  Variant: SoundVariants = 'Looping'

  constructor(setup: SoundContainerSetup) {
    super(setup, true)
  }

  override Stop(): void {
    this.rpgAudio.fade(0, this.fadeTime)
    setTimeout(() => {
      super.Stop()
    }, this.fadeTime)
  }
}
