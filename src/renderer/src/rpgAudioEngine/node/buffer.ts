import { AbstractRpgAudioNode } from './abstract'

export class RpgAudioBufferNode extends AbstractRpgAudioNode {
  private _sourceNode: AudioBufferSourceNode
  private _audioBuffer: AudioBuffer | null = null
  // private _isLoaded: boolean = false

  constructor(ctx: AudioContext, path: string, loop: boolean) {
    super()

    this._sourceNode = ctx.createBufferSource()
    this._sourceNode.loop = loop

    this._sourceNode.addEventListener('ended', this.handleStop.bind(this))

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
    return this._sourceNode
  }

  // private awaitLoad() {
  //   if (this._isLoaded) {
  //     return
  //   }

  //   return Promise.race<void>([
  //     new Promise<void>(
  //       ((res: (value: void | PromiseLike<void>) => void) => {
  //         this.on('load', () => res())
  //       }).bind(this)
  //     ),
  //     new Promise<void>((_res, rej) => setTimeout(() => rej('Could not load in time')))
  //   ])
  // }

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

  // handleLoad(): void {
  //   this._isLoaded = true
  //   super.handleLoad()
  // }
}
