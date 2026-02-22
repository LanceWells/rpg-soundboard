import { AbstractRpgAudioNode } from '.'

export class RpgAudioConvolverNode extends AbstractRpgAudioNode {
  private _sourceNode: ConvolverNode

  constructor(ctx: AudioContext, path: string) {
    super()

    this._sourceNode = ctx.createConvolver()

    this.init(ctx, path)
  }

  private async init(ctx: AudioContext, path: string) {
    const audioDataResp = await fetch(path)
    const audioDataBuff = await audioDataResp.arrayBuffer()
    const decodedAudio = await ctx.decodeAudioData(
      audioDataBuff,
      undefined,
      ((err: DOMException) => {
        console.error(err)
        this.handleErrr()
      }).bind(this)
    )

    this._sourceNode.buffer = decodedAudio
    this.handleLoad()
  }

  public getNode(): AudioNode {
    return this._sourceNode
  }
}
