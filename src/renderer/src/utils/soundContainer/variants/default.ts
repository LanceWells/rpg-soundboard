import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { SoundContainerSetup } from '../interface'
import { AbstractSoundContainerV2 } from '../abstractV2'
import { Ctx } from '@renderer/rpgAudioEngine'
import { GroupID } from 'src/apis/audio/types/groups'

/**
 * Sound container for the Default variant: plays a randomly selected effect once without looping.
 */
export class DefaultSoundContainer<
  TStopped extends string = GroupID,
  TLoaded extends string = GroupID,
  TPlaying extends string = GroupID
> extends AbstractSoundContainerV2<TStopped, TLoaded, TPlaying> {
  Variant: SoundVariants = 'Default'

  constructor(setup: SoundContainerSetup<TStopped, TLoaded, TPlaying>, ctx?: Ctx) {
    super(setup, false, undefined, ctx)
  }
}
