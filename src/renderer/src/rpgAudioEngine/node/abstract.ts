import { v4 as uuidv4 } from 'uuid'
import { RpgAudioNode, RpgAudioNodeEvent } from '../types'

export abstract class AbstractRpgAudioNode implements RpgAudioNode {
  protected _id: string

  private _stopListeners: ((e: RpgAudioNode) => void)[] = []
  private _loadListeners: ((e: RpgAudioNode) => void)[] = []
  private _playListeners: ((e: RpgAudioNode) => void)[] = []
  private _errrListeners: ((e: RpgAudioNode) => void)[] = []

  protected _isLoaded: boolean = false

  constructor() {
    this._id = `aud-${uuidv4()}`
  }

  protected abstract getNode(): AudioNode

  abstract getDuration(): Promise<number>
  abstract play(): Promise<void>
  abstract stop(): Promise<void>

  connect(
    destinationNode: AudioNode,
    output?: number | undefined,
    input?: number | undefined
  ): AudioNode {
    return this.getNode().connect(destinationNode, output, input)
  }

  on(eventType: RpgAudioNodeEvent, handler: (e: RpgAudioNode) => void): void {
    switch (eventType) {
      case 'load':
        this._loadListeners.push(handler)
        break
      case 'stop':
        this._stopListeners.push(handler)
        break
      case 'play':
        this._playListeners.push(handler)
        break
      case 'errr':
        this._errrListeners.push(handler)
        break
    }
  }

  protected handlePlay() {
    this._playListeners.forEach((l) => l(this))
  }

  protected handleStop() {
    this._stopListeners.forEach((l) => l(this))
  }

  protected handleLoad() {
    this._isLoaded = true
    this._loadListeners.forEach((l) => l(this))
  }

  protected handleErrr() {
    this._errrListeners.forEach((l) => l(this))
  }

  protected async awaitLoad() {
    if (this._isLoaded) {
      return
    }

    return Promise.race<void>([
      new Promise<void>(
        ((res: (value: void | PromiseLike<void>) => void) => {
          this.on('load', () => res())
        }).bind(this)
      ),
      new Promise<void>((_res, rej) => setTimeout(() => rej('Could not load in time'), 1000))
    ])
  }
}
