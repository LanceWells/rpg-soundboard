import { AbstractPlayableRpgAudioNode } from './abstractPlayable'

/**
 * Audio node backed by a decoded AudioBuffer; suitable for short, non-streaming audio files.
 */
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
    await this.awaitLoad()
    this._sourceNode.start()
    this.handlePlay()
  }

  async stop(): Promise<void> {
    // Don't call handleStop() here directly - calling AudioBufferSourceNode.stop() always
    // triggers the 'ended' listener registered in the constructor, which already invokes
    // handleStop(). Calling it again here would fire Stop listeners twice per stop.
    this._sourceNode.stop()
  }

  async rate(rate: number): Promise<void> {
    this._sourceNode.playbackRate.value = rate
  }

  async pan(pan: number): Promise<void> {
    this._pannerNode.pan.value = pan
  }
}
