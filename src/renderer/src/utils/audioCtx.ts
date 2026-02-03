import { v4 as uuidv4 } from 'uuid'

class AudioContextSelector {
  public environmentalCtx: AudioContext
  public soundtrackCtx: AudioContext
  public effectlessCtx: AudioContext

  constructor() {
    this.environmentalCtx = new AudioContext()
    this.soundtrackCtx = new AudioContext()
    this.effectlessCtx = new AudioContext()
  }
}

export enum Ctx {
  Environmental,
  Soundtrack,
  Effectless
}

export enum ListenerType {
  Load,
  Stop,
  Play
}

export const AudioCtx = new AudioContextSelector()

type RpgAudioConfig = {
  paths: string[]
  volume: number
  loop: boolean
  ctx: Ctx
}

export class RpgAudio {
  private _config: RpgAudioConfig
  private _sourceNode: MediaElementAudioSourceNode
  private _gainNode: GainNode | null = null
  private _isPlaying: boolean = false
  private _volume: number
  private _id: string

  private _stopListeners: ((e: RpgAudio) => void)[] = []
  private _loadListeners: ((e: RpgAudio) => void)[] = []
  private _playListeners: ((e: RpgAudio) => void)[] = []

  public get volume() {
    return this._volume
  }

  public async getDuration(): Promise<number> {
    // The media element thinks in terms of seconds, but we operate in terms of milliseconds.
    const duration = (this._sourceNode?.mediaElement.duration ?? 0) * 1000

    if (duration !== Infinity) {
      return duration
    }

    const awaitedDuration = await Promise.race<number>([
      new Promise((res, rej) => {
        this.getAudioElement().addEventListener(
          'durationchange',
          (() => {
            const duration = this.getAudioElement().duration

            if (duration === Infinity) {
              rej('Could not get non-infinite duration.')
            }

            res(duration)
          }).bind(this)
        )
      }),
      new Promise((_res, rej) => setTimeout(() => rej(`Could not get duration in time`), 100))
    ])

    return awaitedDuration
  }

  constructor(config: RpgAudioConfig) {
    this._config = config
    this._volume = config.volume
    this._id = `aud-${uuidv4()}`

    const audioElement = this.getAudioElement()
    audioElement.src = config.paths[0]
    audioElement.loop = config.loop

    this._sourceNode = this.getCtx().createMediaElementSource(audioElement)
    this._gainNode = this.getCtx().createGain()

    this._sourceNode.connect(this._gainNode)
    this._gainNode.connect(this.getCtx().destination)

    audioElement.addEventListener('ended', this.handleStop.bind(this))
    audioElement.addEventListener('pause', this.handleStop.bind(this))
    audioElement.addEventListener('loadeddata', this.handleLoad.bind(this))
    audioElement.addEventListener('play', this.handlePlay.bind(this))
  }

  public on(listenOn: ListenerType, callback: (e: RpgAudio) => void) {
    switch (listenOn) {
      case ListenerType.Load:
        this._loadListeners.push(callback)
        break
      case ListenerType.Stop:
        this._stopListeners.push(callback)
        break
      case ListenerType.Play:
        this._playListeners.push(callback)
        break
    }
  }

  public play() {
    if (this._sourceNode === null) {
      return
    }

    // this._sourceNode.addEventListener(
    //   'ended',
    //   (() => {
    //     this._isPlaying = false
    //   }).bind(this)
    // )

    // this._isPlaying = true
    this._sourceNode.mediaElement.play()
  }

  public stop() {
    if (this._sourceNode === null) {
      return
    }

    // this._isPlaying = false
    this._sourceNode.mediaElement.pause()
  }

  public playing(): boolean {
    if (this._sourceNode === null) {
      return false
    }

    return this._isPlaying
  }

  public fade(newVolume: number, fadeInMs: number) {
    if (this._gainNode === null) {
      return
    }

    this._gainNode.gain.cancelScheduledValues(this.getCtx().currentTime)
    try {
      this._gainNode.gain.setValueCurveAtTime(
        this.genWaveArray(newVolume),
        this.getCtx().currentTime,
        fadeInMs / 1000
      )
    } catch (err) {
      console.error(err)
    }
  }

  public setVolume(newVolume: number) {
    if (this._gainNode === null) {
      return
    }

    this._gainNode.gain.value = newVolume
    this._volume = newVolume
  }

  private genWaveArray(newVolume: number): Float32Array {
    const arr = new Float32Array(2)
    arr[0] = this._volume
    arr[1] = newVolume
    return arr
  }

  private handlePlay(_event: Event) {
    this._isPlaying = true
    this._playListeners.forEach((l) => l(this))
  }

  private handleStop(_event: Event) {
    this.getAudioElement().remove()
    this._stopListeners.forEach((l) => l(this))
  }

  private handleLoad(_event: Event) {
    this._loadListeners.forEach((l) => l(this))
  }

  private getCtx() {
    switch (this._config.ctx) {
      case Ctx.Environmental:
        return AudioCtx.environmentalCtx
      case Ctx.Effectless:
        return AudioCtx.effectlessCtx
      case Ctx.Soundtrack:
        return AudioCtx.soundtrackCtx
    }
  }

  private getAudioBank(): HTMLDivElement {
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
    const audioBank = this.getAudioBank()

    let audioElement = audioBank.querySelector(`#${this._id}`)
    if (audioElement === null) {
      const newAudioElement = document.createElement('audio')
      newAudioElement.id = this._id
      audioElement = audioBank.appendChild(newAudioElement)
    }

    return audioElement as HTMLAudioElement
  }
}

/**
 * 1 input -> split across files.
 *
 * [
 *    [
 *      {path: string}
 *    ]
 * ]
 */
