import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { AbstractSoundContainer } from '../abstract'
import { SoundContainerSetup } from '../interface'

export class LoopingSoundContainer extends AbstractSoundContainer {
  Variant: SoundVariants = 'Looping'

  constructor(setup: SoundContainerSetup) {
    super(setup, true)
  }

  override Stop(): void {
    this.howl.fade(this.targetVolume, 0, this.fadeTime)
    setTimeout(() => {
      this.howl.stop()
    }, this.fadeTime)
  }
}
