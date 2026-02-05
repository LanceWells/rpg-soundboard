import { AbstractPlayableRpgAudioNode } from './abstractPlayable'

export class RpgAudioBufferNode extends AbstractPlayableRpgAudioNode {
  private _sourceNode: AudioBufferSourceNode
  private _audioBuffer: AudioBuffer | null = null
  private _pannerNode: StereoPannerNode

  constructor(ctx: AudioContext, path: string, loop: boolean) {
    super()

    this._sourceNode = ctx.createBufferSource()
    this._sourceNode.loop = loop

    this._pannerNode = ctx.createStereoPanner()
    this._sourceNode.addEventListener('ended', this.handleStop.bind(this))
    this._sourceNode.connect(this._pannerNode)

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

    this._audioBuffer = decodedAudio
    this._sourceNode.buffer = decodedAudio
    this.handleLoad()
  }

  protected getNode(): AudioNode {
    return this._pannerNode
  }

  async getDuration(): Promise<number> {
    await this.awaitLoad()

    if (this._audioBuffer === null) {
      console.error('Unable to load audio buffer')
      return 0
    }

    return this._audioBuffer.duration * 1000
  }

  async play(): Promise<void> {
    this._sourceNode.start()
    this.handlePlay()
  }

  async stop(): Promise<void> {
    this._sourceNode.stop()
    this.handleStop()
  }

  async rate(rate: number): Promise<void> {
    this._sourceNode.playbackRate.value = rate
  }

  async pan(pan: number): Promise<void> {
    this._pannerNode.pan.value = pan
  }
}
