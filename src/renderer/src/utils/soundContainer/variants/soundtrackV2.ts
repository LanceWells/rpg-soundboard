import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { AbstractSoundContainerV2 } from '../abstractV2'
import { SoundContainerSetup } from '../interface'
import { Ctx } from '@renderer/rpgAudioEngine'

export class SoundtrackSoundContainerV2 extends AbstractSoundContainerV2 {
  Variant: SoundVariants = 'Soundtrack'

  public static readonly CROSSFADE_TIME = 10000

  protected override fadeTime: number = 2500

  constructor(setup: SoundContainerSetup, enableLoops: boolean = true) {
    super(setup, enableLoops, undefined)
  }

  protected override getCtx(): Ctx {
    return Ctx.Soundtrack
  }

  override Stop(): void {
    this.rpgAudio.fade(0, this.fadeTime)
    setTimeout(() => {
      super.Stop()
    }, this.fadeTime)
  }
}
