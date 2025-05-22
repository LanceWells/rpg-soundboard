import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { AbstractSoundContainer, SoundContainerSetup } from './abstract'
import { GroupID } from 'src/apis/audio/types/groups'

export class DefaultSoundContainer<
  TID extends GroupID | undefined = GroupID
> extends AbstractSoundContainer<TID> {
  Variant: SoundVariants = 'Default'

  constructor(setup: SoundContainerSetup<TID>) {
    super(setup, false)
  }
}
