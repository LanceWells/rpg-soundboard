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
  stopHandler?: StopHandler
}

export class SoundContainer {
  private _howl: Howl
  private _stopHandler: StopHandler | undefined

  constructor(setup: SoundContainerSetup) {
    const { format, src, volume, stopHandler } = setup

    this._howl = new Howl({
      src,
      format: format.replace('.', ''),
      volume: volume / 100
    })

    this._stopHandler = stopHandler

    this._howl
      .once('end', () => {
        this.HandleHowlStop()
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
