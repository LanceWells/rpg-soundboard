import { v4 as uuidv4 } from 'uuid'
import { IRpgAudioNode, RpgAudioNodeEvent } from '../types'

export abstract class AbstractRpgAudioNode implements IRpgAudioNode {
  protected _id: string
  protected _isLoaded: boolean = false

  private _loadListeners: ((e: IRpgAudioNode) => void)[] = []
  private _errrListeners: ((e: IRpgAudioNode) => void)[] = []

  constructor() {
    this._id = `aud-${uuidv4()}`
  }

  protected abstract getNode(): AudioNode

  connect(
    destinationNode: AudioNode,
    output?: number | undefined,
    input?: number | undefined
  ): AudioNode {
    return this.getNode().connect(destinationNode, output, input)
  }

  on(eventType: RpgAudioNodeEvent, handler: (e: IRpgAudioNode) => void): void {
    switch (eventType) {
      case 'load':
        this._loadListeners.push(handler)
        break
      case 'errr':
        this._errrListeners.push(handler)
        break
    }
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
        ((
          res: (value: void | PromiseLike<void>) => void,
          rej: (value: void | PromiseLike<void>) => void
        ) => {
          this.on('load', () => res())
          this.on('errr', () => rej())
        }).bind(this)
      ),
      new Promise<void>((_res, rej) => setTimeout(() => rej('Could not load in time'), 5000))
    ])
  }
}
