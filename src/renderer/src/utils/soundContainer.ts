import { Howl } from 'howler'
import { GroupID } from 'src/apis/audio/interface'

type StopHandler = {
  id: GroupID
  handler: (groupID: GroupID) => void
}

export type SoundContainerSetup = {
  src: string
  volume: number
  format: string
  repeats: boolean
  stopHandler?: StopHandler
  fadeIn?: boolean
  fadeOut?: boolean
}

export class SoundContainer {
  private _howl: Howl
  private _stopHandler: StopHandler | undefined
  private _repeats: boolean

  private _targetVolume: number
  private _fadeIn: boolean
  private _fadeOut: boolean
  private _fadeOutRef: NodeJS.Timeout | undefined

  static FadeTime = 200

  constructor(setup: SoundContainerSetup) {
    const { format, src, volume, stopHandler, repeats, fadeIn, fadeOut } = setup

    this._repeats = repeats
    this._targetVolume = volume / 100
    this._fadeIn = fadeIn ?? false
    this._fadeOut = fadeOut ?? false

    this._howl = new Howl({
      src,
      format: format.replace('.', ''),
      volume: this._fadeIn ? 0 : this._targetVolume,
      loop: repeats
    })

    this._stopHandler = stopHandler

    // If an effect repeats, then this 'end' event will fire every time that the loop restarts.
    // In that case, don't stop the sound effect.
    if (!this._repeats) {
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

    if (this._fadeOut && timeToFade > 0) {
      this._fadeOutRef = setTimeout(() => {
        if (this && this._howl) {
          this._howl.fade(this._targetVolume, 0, SoundContainer.FadeTime)
        }
      }, SoundContainer.FadeTime)
    }

    this._howl.play()

    if (this._fadeIn) {
      this._howl.fade(0, 1, SoundContainer.FadeTime)
    }
  }

  GetStopHandle() {
    return () => this.StopSound()
  }

  private HandleHowlStop() {
    clearTimeout(this._fadeOutRef)
    this._howl.off()
    if (this._stopHandler) {
      this._stopHandler.handler(this._stopHandler.id)
    }
  }

  private StopSound() {
    if (this._fadeOut && this._repeats) {
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
