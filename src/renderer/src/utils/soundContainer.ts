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
}

export class SoundContainer {
  private _howl: Howl
  private _stopHandler: StopHandler | undefined
  private _repeats: boolean

  constructor(setup: SoundContainerSetup) {
    const { format, src, volume, stopHandler, repeats } = setup

    this._repeats = repeats

    this._howl = new Howl({
      src,
      format: format.replace('.', ''),
      volume: volume / 100,
      loop: repeats
    })

    this._stopHandler = stopHandler

    this._howl
      .on('end', () => {
        // If an effect repeats, then this 'end' event will fire every time that the loop restarts.
        // In that case, don't stop the sound effect.
        if (!this._repeats) {
          this.HandleHowlStop()
        }
      })
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
    this._howl.play()
  }

  GetStopHandle() {
    return () => this.StopSound()
  }

  private HandleHowlStop() {
    this._howl.off()
    if (this._stopHandler) {
      this._stopHandler.handler(this._stopHandler.id)
    }
  }

  private StopSound() {
    this._howl.stop()
    this.HandleHowlStop()
  }
}
