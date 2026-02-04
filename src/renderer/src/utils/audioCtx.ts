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
  onLoad?: () => void
  onPlay?: () => void
  onStop?: () => void
}

export class RpgAudio {
  private _config: RpgAudioConfig
  private _sourceNode: MediaElementAudioSourceNode
  private _gainNode: GainNode | null = null
  private _isPlaying: boolean = false
  private _volume: number
  private _id: string

  private _isLoaded: boolean = false

  private _stopListeners: ((e: RpgAudio) => void)[] = []
  private _loadListeners: ((e: RpgAudio) => void)[] = []
  private _playListeners: ((e: RpgAudio) => void)[] = []

  public get volume() {
    return this._volume
  }

  public async getDuration(): Promise<number> {
    // await this.isReady()

    // The media element thinks in terms of seconds, but we operate in terms of milliseconds.
    const duration = (this._sourceNode?.mediaElement.duration ?? 0) * 1000

    if (!Number.isNaN(duration) && Number.isFinite(duration)) {
      return duration
    }

    const durationPromise = Promise.race<number>([
      new Promise(async (res, rej) => {
        const mediaElement = this.getAudioElement()

        mediaElement.addEventListener(
          'durationchange',
          (() => {
            const duration = mediaElement.duration
            if (isFinite(duration)) {
              res(duration)
            }
          }).bind(this)
        )
      }),
      new Promise(async (res) => {
        const audio = (await (await fetch(this._config.paths[0])).bytes()).buffer
        const audioBuffer = await this.getCtx().decodeAudioData(audio)
        res(audioBuffer.duration)
      }),
      new Promise((_res, rej) => setTimeout(() => rej(`Could not get duration in time`), 500000))
    ])

    try {
      const awaitedDuration = await durationPromise
      return awaitedDuration * 1000
    } catch (err) {
      return 1000
    }

    // This one kinda works, but it seems to use the '100' on the first load, then it's fine each
    // time after. This is probably because it's "streaming" the data each time after.
    //
    // const awaitedDuration = await Promise.race<number>([
    //   new Promise((res, _rej) => res(100)),
    //   new Promise((_res, rej) => setTimeout(() => rej(`Could not get duration in time`), 5000))
    // ])
  }

  // public async isReady(): Promise<boolean> {
  //   if (this._sourceNode.mediaElement.duration !== Infinity) {
  //     return true
  //   }

  //   const d = await Promise.race([
  //     new Promise(async (res) => {
  //       this._sourceNode.mediaElement.addEventListener('durationchange', () => {
  //         res(this._sourceNode.mediaElement.duration)
  //       })

  //       this._sourceNode.mediaElement.currentTime = 1
  //       this._sourceNode.mediaElement.load()
  //       await new Promise((res) => setTimeout(() => res(null), 1000))
  //       this._sourceNode.mediaElement.currentTime = 0
  //     })
  //   ])

  //   return true
  // }

  constructor(config: RpgAudioConfig) {
    this._config = config
    this._volume = config.volume
    this._id = `aud-${uuidv4()}`

    const audioElement = this.getAudioElement()

    const { onLoad, onPlay, onStop } = config

    if (onLoad) {
      this.on(ListenerType.Load, onLoad)
    }
    if (onPlay) {
      this.on(ListenerType.Play, onPlay)
    }
    if (onStop) {
      this.on(ListenerType.Stop, onStop)
    }

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
    audioElement.addEventListener('error', this.handleError.bind(this))
    audioElement.onerror = (event, source, lineno, colno, error) => {
      console.error(event, source, lineno, colno, error)
    }
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
    if (this._sourceNode.mediaElement.currentTime !== 0) {
      this._sourceNode.mediaElement.currentTime = 0
    }

    if (this._sourceNode === null) {
      return
    }

    if (this._isLoaded) {
      this._sourceNode.mediaElement.play()
      return
    }

    this._sourceNode.mediaElement.addEventListener(
      'loadeddata',
      (() => {
        this._sourceNode.mediaElement
          .play()
          .then(() => {
            // success
            console.log('success')
          })
          .catch((err) => {
            // this._sourceNode.mediaElement.load()
            console.error(`${this._isLoaded}\n${JSON.stringify(err)}`)
            this.stop()
          })
      }).bind(this)
    )

    // this.on(
    //   ListenerType.Load,
    //   (() => {
    //     this._sourceNode.mediaElement
    //       .play()
    //       .then(() => {
    //         // success
    //         console.log('success')
    //       })
    //       .catch((err) => {
    //         // this._sourceNode.mediaElement.load()
    //         console.error(`${this._isLoaded}\n${JSON.stringify(err)}`)
    //       })
    //   }).bind(this)
    // )

    // this._sourceNode.mediaElement
    //   .play()
    //   .then(() => {
    //     // success
    //     console.log('success')
    //   })
    //   .catch((err) => {
    //     // this._sourceNode.mediaElement.load()
    //     console.error(`${this._isLoaded}\n${JSON.stringify(err)}`)
    //   })
  }

  public stop() {
    if (this._sourceNode === null) {
      return
    }

    this._sourceNode.mediaElement.pause()
  }

  // public playing(): boolean {
  //   if (this._sourceNode === null) {
  //     return false
  //   }

  //   return this._isPlaying
  // }

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
    arr[0] = this._gainNode?.gain.value ?? this._volume
    arr[1] = this._volume * newVolume
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
    this._isLoaded = true
    this._loadListeners.forEach((l) => l(this))
  }

  private handleError(_event: Event) {
    console.log('err')
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
