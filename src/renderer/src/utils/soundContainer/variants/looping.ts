import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { SoundContainerSetup } from '../interface'
import { AbstractSoundContainerV2 } from '../abstractV2'
import { Ctx } from '@renderer/rpgAudioEngine'
import { GroupID } from 'src/apis/audio/types/groups'

/**
 * Sound container for the Looping variant: plays an effect on repeat and fades out smoothly on stop.
 */
export class LoopingSoundContainer<
  TStopped extends string = GroupID,
  TLoaded extends string = GroupID,
  TPlaying extends string = GroupID
> extends AbstractSoundContainerV2<TStopped, TLoaded, TPlaying> {
  Variant: SoundVariants = 'Looping'

  constructor(
    setup: SoundContainerSetup<TStopped, TLoaded, TPlaying>,
    enableLoops: boolean = true,
    ctx?: Ctx
  ) {
    super(setup, enableLoops, undefined, ctx)
  }

  override Stop(): void {
    this.rpgAudio.fade(0, this.fadeTime)
    setTimeout(() => {
      super.Stop()
    }, this.fadeTime)
  }
}
