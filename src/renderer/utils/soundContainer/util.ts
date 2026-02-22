import { EffectID } from '../../../apis/audio/types/effects'
import { SoundVariants } from '../../../apis/audio/types/soundVariants'
import { Ctx } from '../../rpgAudioEngine'
import { SoundContainerSetup, ISoundContainer } from './interface'
import { DefaultSoundContainer } from './variants/default'
import { LoopingSoundContainer } from './variants/looping'
import { RapidSoundContainer } from './variants/rapid'
import { SoundtrackSoundContainerV2 } from './variants/soundtrackV2'

export function NewSoundContainer(
  variant: SoundVariants,
  lastEffectID: EffectID | undefined,
  setup: SoundContainerSetup,
  enableLoops?: boolean,
  ctx?: Ctx
): ISoundContainer {
  switch (variant) {
    case 'Looping':
      return new LoopingSoundContainer(setup, enableLoops, ctx)
    case 'Rapid':
      return new RapidSoundContainer(setup, lastEffectID, ctx)
    case 'Soundtrack':
      return new SoundtrackSoundContainerV2(setup, enableLoops)
    case 'Default':
    default:
      return new DefaultSoundContainer(setup, ctx)
  }
}
