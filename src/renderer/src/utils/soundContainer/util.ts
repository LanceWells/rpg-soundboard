import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { DefaultSoundContainer } from './variants/default'
import { ISoundContainer, SoundContainerSetup } from './interface'
import { LoopingSoundContainer } from './variants/looping'
import { RapidSoundContainer } from './variants/rapid'
import { EffectID } from 'src/apis/audio/types/effects'
import { SoundtrackSoundContainerV2 } from './variants/soundtrackV2'
import { Ctx } from '@renderer/rpgAudioEngine'
import { GroupID } from 'src/apis/audio/types/groups'

/**
 * Factory that instantiates the correct ISoundContainer subclass for the given variant.
 * @param variant The playback variant (Default, Looping, Rapid, Soundtrack).
 * @param lastEffectID The previously played effect ID, used by Rapid mode to avoid repeats.
 * @param setup Sound container configuration including effects and event handlers.
 * @param enableLoops Whether looping should be enabled (used by Looping variant).
 * @param ctx The audio processing context to use.
 */
export function NewSoundContainer<
  TStopped extends string = GroupID,
  TLoaded extends string = GroupID,
  TPlaying extends string = GroupID
>(
  variant: SoundVariants,
  lastEffectID: EffectID | undefined,
  setup: SoundContainerSetup<TStopped, TLoaded, TPlaying>,
  enableLoops?: boolean,
  ctx?: Ctx
): ISoundContainer {
  switch (variant) {
    case 'Looping':
      return new LoopingSoundContainer<TStopped, TLoaded, TPlaying>(setup, enableLoops, ctx)
    case 'Rapid':
      return new RapidSoundContainer<TStopped, TLoaded, TPlaying>(setup, lastEffectID, ctx)
    case 'Soundtrack':
      return new SoundtrackSoundContainerV2<TStopped, TLoaded, TPlaying>(setup, enableLoops)
    case 'Default':
    default:
      return new DefaultSoundContainer<TStopped, TLoaded, TPlaying>(setup, ctx)
  }
}
