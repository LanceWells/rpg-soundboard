import { IRpgAudioNode, IRpgAudioPlayableNode, RpgAudioNodeEvent } from '../types'
import { AbstractRpgAudioNode } from './abstract'

/**
 * This node differs from an AbstractRpgAudioNode in that it provides controls for audio playback.
 * Most nodes will be playable nodes, but certain nodes may be an exception to this rule, such as
 * the convolver node. This is why we split the playable node out; so that we can still share that
 * common base class without needing to include playback as part of the contract.
 */
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
  abstract pan(pan: number): Promise<void>
  abstract rate(rate: number): Promise<void>

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
