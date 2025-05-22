import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { AbstractSoundContainer } from '../abstract'
import { GroupID } from 'src/apis/audio/types/groups'
import { SoundContainerSetup } from '../interface'

export class LoopingSoundContainer<
  TID extends GroupID | undefined = GroupID
> extends AbstractSoundContainer<TID> {
  Variant: SoundVariants = 'Looping'

  constructor(setup: SoundContainerSetup<TID>) {
    super(setup, true)
  }

  override Stop(): void {
    this.howl.fade(this.targetVolume, 0, this.fadeTime)
    setTimeout(() => {
      this.howl.stop()
    }, this.fadeTime)
  }
}
