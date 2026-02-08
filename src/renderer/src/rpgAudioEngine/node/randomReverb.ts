import { getRandomInt } from '@renderer/utils/random'
import { IRpgAudioNode, RandomReverbNodeConfig, RpgAudioNodeEvent } from '../types'
import { RpgAudioConvolverNode } from './convolver'

export class RandomReverbNode implements IRpgAudioNode {
  private _loadListeners: ((e: IRpgAudioNode) => void)[] = []
  private _errrListeners: ((e: IRpgAudioNode) => void)[] = []

  private _nodes: [RpgAudioConvolverNode, ...RpgAudioConvolverNode[]]

  constructor(config: RandomReverbNodeConfig) {
    this._nodes = config.nodes
  }

  public on(eventType: RpgAudioNodeEvent, handler: (e: IRpgAudioNode) => void): void {
    switch (eventType) {
      case 'load':
        this._loadListeners.push(handler)
        break
      case 'errr':
        this._errrListeners.push(handler)
        break
    }
  }

  public async awaitLoad() {
    await Promise.all(this._nodes.map((n) => n.awaitLoad()))
  }

  public connect(
    destinationNode: AudioNode,
    output?: number | undefined,
    input?: number | undefined
  ): AudioNode {
    this._nodes.forEach((n) => n.connect(destinationNode, output, input))

    // This isn't how this is supposed to be used. But, we need to return this for the interface and
    // I honestly just feel too lazy to fix this right now.
    return destinationNode
  }

  public disconnect(): void {
    this._nodes.forEach((n) => n.disconnect())
  }

  public getRandomNode(): AudioNode {
    const nodeIndex = getRandomInt(0, this._nodes.length - 1)
    const randomNode = this._nodes[nodeIndex]
    return randomNode.getNode()
  }
}
