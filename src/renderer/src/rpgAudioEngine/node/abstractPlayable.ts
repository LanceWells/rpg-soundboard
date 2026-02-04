import { IRpgAudioNode, IRpgAudioPlayableNode, RpgAudioNodeEvent } from '../types'
import { AbstractRpgAudioNode } from './abstract'

export abstract class AbstractPlayableRpgAudioNode
  extends AbstractRpgAudioNode
  implements IRpgAudioPlayableNode
{
  private _stopListeners: ((e: IRpgAudioPlayableNode) => void)[] = []
  private _playListeners: ((e: IRpgAudioPlayableNode) => void)[] = []

  constructor() {
    super()
  }

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

  on(eventType: RpgAudioNodeEvent, handler: (e: IRpgAudioNode) => void): void {
    super.on(eventType, handler)
    switch (eventType) {
      case 'stop':
        this._stopListeners.push(handler)
        break
      case 'play':
        this._playListeners.push(handler)
        break
    }
  }

  protected handlePlay() {
    this._playListeners.forEach((l) => l(this))
  }

  protected handleStop() {
    this._stopListeners.forEach((l) => l(this))
  }
}
