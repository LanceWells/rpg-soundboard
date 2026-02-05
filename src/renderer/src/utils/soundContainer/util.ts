import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { DefaultSoundContainer } from './variants/default'
import { ISoundContainer, SoundContainerSetup } from './interface'
import { LoopingSoundContainer } from './variants/looping'
import { RapidSoundContainer } from './variants/rapid'
import { EffectID } from 'src/apis/audio/types/effects'
import { SoundtrackSoundContainerV2 } from './variants/soundtrackV2'
import { Ctx } from '@renderer/rpgAudioEngine'

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
