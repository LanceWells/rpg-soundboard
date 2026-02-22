import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { SoundContainerSetup } from '../interface'
import { AbstractSoundContainerV2 } from '../abstractV2'
import { Ctx } from '@renderer/rpgAudioEngine'

export class LoopingSoundContainer extends AbstractSoundContainerV2 {
  Variant: SoundVariants = 'Looping'

  constructor(setup: SoundContainerSetup, enableLoops: boolean = true, ctx?: Ctx) {
    super(setup, enableLoops, undefined, ctx)
  }

  override Stop(): void {
    this.rpgAudio.fade(0, this.fadeTime)
    setTimeout(() => {
      super.Stop()
    }, this.fadeTime)
  }
}
