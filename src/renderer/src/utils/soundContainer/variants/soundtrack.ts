import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { AbstractSoundContainer } from '../abstract'
import { GroupID } from 'src/apis/audio/types/groups'
import { SoundContainerSetup } from '../interface'

export class SoundtrackSoundContainer<
  TID extends GroupID | undefined = GroupID
> extends AbstractSoundContainer<TID> {
  Variant: SoundVariants = 'Soundtrack'

  protected override get fadeTime(): number {
    return 2500
  }

  constructor(setup: SoundContainerSetup<TID>) {
    super(setup, false)
  }

  override Play() {
    super.Play()
  }

  override Stop(): void {
    this.howl.fade(this.targetVolume, 0, this.fadeTime)
    setTimeout(() => {
      this.howl.stop()
    }, this.fadeTime)
  }
}
