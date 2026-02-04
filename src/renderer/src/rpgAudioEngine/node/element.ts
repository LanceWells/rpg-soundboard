import { AbstractPlayableRpgAudioNode } from '.'

export class RpgAudioElementNode extends AbstractPlayableRpgAudioNode {
  private _sourceNode: MediaElementAudioSourceNode

  constructor(ctx: AudioContext, path: string, loop: boolean) {
    super()

    const audioElement = this.getAudioElement()
    audioElement.src = path
    audioElement.loop = loop

    this._sourceNode = ctx.createMediaElementSource(audioElement)
    audioElement.addEventListener('ended', this.handleStop.bind(this))
    audioElement.addEventListener('pause', this.handleStop.bind(this))
    audioElement.addEventListener('loadeddata', this.handleLoad.bind(this))
    audioElement.addEventListener('play', this.handlePlay.bind(this))
    audioElement.addEventListener('error', this.handleErrr.bind(this))
  }

  protected getNode(): AudioNode {
    return this._sourceNode
  }

  async getDuration(): Promise<number> {
    await this.awaitLoad()

    const duration = this._sourceNode.mediaElement.duration
    if (Number.isFinite(duration)) {
      return duration * 1000
    }

    console.error('Could not get a duration in time')

    return 0
  }

  async getCurrentTime(): Promise<number> {
    return this._sourceNode.mediaElement.currentTime
  }

  async play(): Promise<void> {
    this._sourceNode.mediaElement.play()
  }

  async stop(): Promise<void> {
    this._sourceNode.mediaElement.pause()
  }

  private static getAudioBank(): HTMLDivElement {
    let audioBank = document.querySelector('#AUDIO_BANK')
    if (audioBank === null) {
      const newAudioBank = document.createElement('div')
      newAudioBank.id = 'AUDIO_BANK'
      newAudioBank.style.visibility = 'hidden'
      audioBank = document.body.appendChild(newAudioBank)
    }

    return audioBank as HTMLDivElement
  }

  private getAudioElement(): HTMLAudioElement {
    const audioBank = RpgAudioElementNode.getAudioBank()

    let audioElement = audioBank.querySelector(`#${this._id}`)
    if (audioElement === null) {
      const newAudioElement = document.createElement('audio')
      newAudioElement.id = this._id
      audioElement = audioBank.appendChild(newAudioElement)
    }

    return audioElement as HTMLAudioElement
  }

  // protected handleLoad(): void {
  //   this._isLoaded = true
  //   super.handleLoad()
  // }

  protected handleStop(): void {
    this.getAudioElement().remove()
    super.handleStop()
  }
}
