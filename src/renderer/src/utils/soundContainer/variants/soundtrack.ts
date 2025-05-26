import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { AbstractSoundContainer } from '../abstract'
import { GroupID } from 'src/apis/audio/types/groups'
import { SoundContainerSetup } from '../interface'
import dayjs from 'dayjs'

export class SoundtrackSoundContainer<
  TID extends GroupID | undefined = GroupID
> extends AbstractSoundContainer<TID> {
  Variant: SoundVariants = 'Soundtrack'

  private _interval: NodeJS.Timeout | undefined

  private readonly CROSSFADE_TIME = 10000
  private soundIDs: [number, number] = [0, 0]
  private activeSoundIndex: number = 0

  private get activeSoundId() {
    return this.soundIDs[this.activeSoundIndex]
  }

  private set activeSoundId(id: number) {
    this.soundIDs[this.activeSoundIndex] = id
  }

  private get inactiveSoundId() {
    return this.soundIDs[this.inactiveSoundIndex]
  }

  private set inactiveSoundId(id: number) {
    this.soundIDs[this.inactiveSoundIndex] = id
  }

  private get inactiveSoundIndex() {
    return (this.activeSoundIndex + 1) % 2
  }

  private flipActiveSoundIndex() {
    this.activeSoundIndex = this.inactiveSoundIndex
  }

  protected override get fadeTime(): number {
    return 2500
  }

  constructor(setup: SoundContainerSetup<TID>) {
    super(setup, false)
  }

  override Stop(): void {
    this.howl.fade(this.targetVolume, 0, this.fadeTime)
    setTimeout(() => {
      this.howl.stop(this.inactiveSoundId)
      this.howl.stop(this.activeSoundId)

      clearInterval(this._interval)

      super.HandleHowlStop()
    }, this.fadeTime)
  }

  override Play(): void {
    this.activeSoundId = this.howl.play()

    // This is here to invoke the loaded handler.
    this.howl.load()
  }

  private Crossfade(): void {
    console.debug(`Crossfade at ${dayjs().format('HH:mm:ss.SSS')}`)

    // Not yet initialized.
    if (this.inactiveSoundId === 0) {
      this.inactiveSoundId = this.howl.play()
    } else {
      this.howl.play(this.inactiveSoundId)
    }

    this.howl.fade(this.targetVolume, 0, this.CROSSFADE_TIME / 2, this.activeSoundId)
    this.howl.fade(0, this.targetVolume, this.CROSSFADE_TIME, this.inactiveSoundId)
    this.flipActiveSoundIndex()

    console.debug(`
      Active ID: ${this.activeSoundId}
      Inactv ID: ${this.inactiveSoundId}
      Active Dx: ${this.activeSoundIndex}
      Inactv Dx: ${this.inactiveSoundIndex}
    `)

    setTimeout(() => {
      this.howl.pause(this.inactiveSoundId)
      this.howl.seek(0, this.inactiveSoundId)
    }, this.CROSSFADE_TIME)
  }

  protected override HandleHowlStop(): void {
    //
  }

  protected override HandleHowlLoaded(): void {
    super.HandleHowlLoaded()

    if (!this.duration) {
      console.error(`Something went wrong; we should have a duration but we don't`)
      return
    }

    const fadeInMs = this.duration - this.CROSSFADE_TIME

    if (fadeInMs <= 0) {
      return
    }

    this._interval = setInterval(() => this.Crossfade(), fadeInMs)
  }
}
