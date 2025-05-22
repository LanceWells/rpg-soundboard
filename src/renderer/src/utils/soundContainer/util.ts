import { GroupID } from 'src/apis/audio/types/groups'
import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { DefaultSoundContainer } from './variants/default'
import { ISoundContainer, SoundContainerSetup } from './interface'
import { LoopingSoundContainer } from './variants/looping'
import { RapidSoundContainer } from './variants/rapid'
import { SoundtrackSoundContainer } from './variants/soundtrack'

export function NewSoundContainer<T extends GroupID | undefined = GroupID>(
  variant: SoundVariants,
  setup: SoundContainerSetup<T>
): ISoundContainer {
  switch (variant) {
    case 'Looping':
      return new LoopingSoundContainer(setup)
    case 'Rapid':
      return new RapidSoundContainer(setup)
    case 'Soundtrack':
      return new SoundtrackSoundContainer(setup)
    case 'Default':
    default:
      return new DefaultSoundContainer(setup)
  }
}
