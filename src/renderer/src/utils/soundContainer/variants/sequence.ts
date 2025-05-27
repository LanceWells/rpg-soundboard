import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { AbstractSoundContainer } from '../abstract'
import { GroupID } from 'src/apis/audio/types/groups'
import { SoundContainerSetup } from '../interface'

export class SequenceSoundContainer<
  TID extends GroupID | undefined = GroupID
> extends AbstractSoundContainer<TID> {
  Variant: SoundVariants = 'Sequence'

  constructor(setup: SoundContainerSetup<TID>) {
    super(setup, false)
  }
}
