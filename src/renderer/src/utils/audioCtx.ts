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

export const AudioCtx = new AudioContextSelector()

type RpgAudioConfig = {
  paths: string[]
  volume: number
  loop: boolean
  ctx: Ctx
}

export class RpgAudio {
  private _config: RpgAudioConfig
  private _sourceNode: AudioBufferSourceNode | null = null
  private _gainNode: GainNode | null = null
  private _isPlaying: boolean = false
  private _volume: number

  constructor(config: RpgAudioConfig) {
    this._config = config
    this._volume = config.volume
  }

  public async load() {
    const audio = (await (await fetch(this._config.paths[0])).bytes()).buffer
    const audioBuffer = await this.getCtx().decodeAudioData(audio)
    const sourceNode = this.getCtx().createBufferSource()
    const gainNode = this.getCtx().createGain()

    sourceNode.buffer = audioBuffer
    if (this._config.loop) {
      sourceNode.loop = true
    }

    gainNode.gain.value = this._config.volume

    sourceNode.connect(gainNode)
    gainNode.connect(this.getCtx().destination)

    this._sourceNode = sourceNode
    this._gainNode = gainNode
  }

  public play() {
    if (this._sourceNode === null) {
      return
    }

    this._sourceNode.addEventListener(
      'ended',
      (() => {
        this._isPlaying = false
      }).bind(this)
    )

    this._sourceNode.start()
  }

  public stop() {
    if (this._sourceNode === null) {
      return
    }

    this._sourceNode.stop()
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

    this._gainNode.gain.setValueCurveAtTime(
      this.genWaveArray(newVolume),
      this.getCtx().currentTime,
      fadeInMs / 1000
    )
  }

  public volume(newVolume: number) {
    if (this._gainNode === null) {
      return
    }

    this._gainNode.gain.value = newVolume
  }

  private genWaveArray(newVolume: number): Float32Array {
    const arr = new Float32Array(2)
    arr[0] = this._volume
    arr[1] = newVolume
    return arr
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
