import { AbstractPlayableRpgAudioNode } from '.'

export class RpgAudioElementNode extends AbstractPlayableRpgAudioNode {
  private _sourceNode: MediaElementAudioSourceNode

  constructor(ctx: AudioContext, path: string, loop: boolean) {
    super()

    const audioElement = this.getAudioElement()
    const sourceElement = this.getSourceElement()
    // audioElement.src = path
    sourceElement.src = path
    audioElement.loop = loop

    this._sourceNode = ctx.createMediaElementSource(audioElement)

    audioElement.addEventListener('ended', this.handleStop.bind(this))
    audioElement.addEventListener('pause', this.handleStop.bind(this))
    audioElement.addEventListener('loadeddata', this.handleLoad.bind(this))
    audioElement.addEventListener('play', this.handlePlay.bind(this))
    audioElement.addEventListener('error', this.handleErrr.bind(this))
    audioElement.addEventListener('error', (ev) => {
      console.error(ev)
    })
    sourceElement.addEventListener('error', (ev) => {
      console.error(ev)
    })
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
    try {
      await this.awaitLoad()
      this._sourceNode.mediaElement.play()
    } catch (err) {
      console.error('')
    }
  }

  async stop(): Promise<void> {
    await this.awaitLoad()
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

      // This crossorigin setting is (still, I almost don't believe it), critical. There's some
      // problem where loading a sound file with the same URL back-to-back will fail to load on
      // subsequent attempts. I noticed that by waiting an arbitrary length of time (probably one to
      // several minutes), that the sound would start loading again. Presumably this is because the
      // audio element will attempt to load from some cached value on subsequent attempts using some
      // CORS credentials.
      //
      // An empty string is, shockingly, a valid and intentional value for CORS settings on
      // HTMLMedialElements; it implies that we should enable both CORS and Same-Origin policies.
      // Conversely, if the property is not specified at all, then CORS is disabled.
      newAudioElement.crossOrigin = ''
      audioElement = audioBank.appendChild(newAudioElement)
    }
    return audioElement as HTMLAudioElement
  }

  private getSourceElement(): HTMLAudioElement {
    const audioElement = this.getAudioElement()

    let sourceElement = audioElement.querySelector(`#${this._id}-src`)
    if (sourceElement === null) {
      const newAudioSource = document.createElement('source')
      newAudioSource.id = this._id
      sourceElement = audioElement.appendChild(newAudioSource)
    }
    return sourceElement as HTMLAudioElement
  }

  // protected handleLoad(): void {
  //   this._isLoaded = true
  //   super.handleLoad()
  // }

  protected handleStop(): void {
    this.getAudioElement().remove()
    super.handleStop()
  }

  async rate(rate: number): Promise<void> {
    this.getAudioElement().playbackRate = rate
  }

  async pan(): Promise<void> {}
}
