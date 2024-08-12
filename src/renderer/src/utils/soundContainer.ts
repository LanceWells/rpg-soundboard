import { Howl } from 'howler'
import { GroupID } from 'src/apis/audio/interface'
import { getRandomArbitrary } from './random'
import type { SoundVariants } from 'src/apis/audio/soundVariants'

type StopHandler<T extends GroupID | undefined> = {
  id: T
  handler: (groupID: T) => void
}

export type SoundContainerSetup<T extends GroupID | undefined> = {
  src: string
  volume: number
  format: string
  stopHandler?: StopHandler<T>
  variant: SoundVariants
}

export class SoundContainer<T extends GroupID | undefined = GroupID> {
  private _howl: Howl
  private _stopHandler: StopHandler<T> | undefined

  private _targetVolume: number
  private _variant: SoundVariants
  private _fadeOutRef: NodeJS.Timeout | undefined

  static FadeTime = 200

  constructor(setup: SoundContainerSetup<T>) {
    const { format, src, volume, stopHandler, variant } = setup

    this._targetVolume = volume / 100
    this._variant = variant

    this._howl = new Howl({
      src,
      format: format.replace('.', ''),
      volume: this._variant === 'Looping' ? 0 : this._targetVolume,
      loop: this._variant === 'Looping'
    })

    this._stopHandler = stopHandler

    // If an effect repeats, then this 'end' event will fire every time that the loop restarts.
    // In that case, don't stop the sound effect.
    if (this._variant !== 'Looping') {
      this._howl.once('end', () => {
        this.HandleHowlStop()
      })
    }

    this._howl
      .once('loaderror', (id, err) => {
        console.error(`Failed to load sound ${id}: ${err}`)
        this.HandleHowlStop()
      })
      .once('playerror', (id, err) => {
        console.error(`Failed to play sound ${id}: ${err}`)
        this.HandleHowlStop()
      })
  }

  Play() {
    const timeToFade = this._howl.duration() - SoundContainer.FadeTime

    if (this._variant === 'Looping' && timeToFade > 0) {
      this._fadeOutRef = setTimeout(() => {
        if (this && this._howl) {
          this._howl.fade(this._targetVolume, 0, SoundContainer.FadeTime)
        }
      }, SoundContainer.FadeTime)
    }

    this._howl.play()

    if (this._variant === 'Rapid') {
      const randomRate = getRandomArbitrary(0.85, 1.15)
      this._howl.rate(randomRate)
    }

    if (this._variant === 'Looping') {
      this._howl.fade(0, 1, SoundContainer.FadeTime)
    }
  }

  GetStopHandle() {
    return () => this.StopSound()
  }

  GetVolumeHandle() {
    return (volume: number) => {
      if (this._howl.playing()) {
        const newVolume = volume / 100
        this._howl.volume(newVolume)
      }
    }
  }

  private HandleHowlStop() {
    clearTimeout(this._fadeOutRef)
    this._howl.off()
    if (this._stopHandler) {
      this._stopHandler.handler(this._stopHandler.id)
    }
  }

  private StopSound() {
    if (this._variant === 'Looping' && this._variant === 'Looping') {
      this._howl.fade(this._targetVolume, 0, SoundContainer.FadeTime)
      setTimeout(() => {
        this._howl.stop()
        this.HandleHowlStop()
      }, SoundContainer.FadeTime)

      return
    }

    this._howl.stop()
    this.HandleHowlStop()
  }
}
