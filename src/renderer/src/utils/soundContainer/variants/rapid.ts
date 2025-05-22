import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { AbstractSoundContainer } from '../abstract'
import { GroupID } from 'src/apis/audio/types/groups'
import { getRandomArbitrary } from '@renderer/utils/random'
import { SoundContainerSetup } from '../interface'

export class RapidSoundContainer<
  TID extends GroupID | undefined = GroupID
> extends AbstractSoundContainer<TID> {
  Variant: SoundVariants = 'Rapid'

  constructor(setup: SoundContainerSetup<TID>) {
    super(setup, false)
  }

  override Play() {
    const randomRate = getRandomArbitrary(0.8, 1.2)
    super.Play()
    this.howl.rate(randomRate)
  }
}
