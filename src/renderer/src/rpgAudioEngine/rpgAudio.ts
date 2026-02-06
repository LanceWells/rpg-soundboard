import { AudioCtx, AudioProcessing } from './ctx'
import { RpgAudioBufferNode, RpgAudioElementNode } from './node'
import { RpgAudioConfig, ListenerType, Ctx, IRpgAudioPlayableNode, RpgAudioState } from './types'

/**
 * An interface with the native Web Audio API. Each instance of this class will connect with the
 * same context as specified in the config.
 */
export class RpgAudio {
  private _config: RpgAudioConfig
  private _sourceNode: IRpgAudioPlayableNode
  private _gainNode: GainNode
  private _nodeCtx: Ctx
  private _state: RpgAudioState = RpgAudioState.Loading

  private _stopListeners: ((e: RpgAudio) => void)[] = []
  private _loadListeners: ((e: RpgAudio) => void)[] = []
  private _playListeners: ((e: RpgAudio) => void)[] = []

  public get State() {
    return this._state
  }

  constructor(config: RpgAudioConfig) {
    this._config = config
    this._nodeCtx = config.ctx

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

    if (config.isLargeFile) {
      this._sourceNode = new RpgAudioElementNode(this.getCtx(), config.path, config.loop)
    } else {
      this._sourceNode = new RpgAudioBufferNode(this.getCtx(), config.path, config.loop)
    }

    this._sourceNode.on('load', this.handleLoad.bind(this))
    this._sourceNode.on('play', this.handlePlay.bind(this))
    this._sourceNode.on('stop', this.handleStop.bind(this))
    this._sourceNode.on('errr', this.handleError.bind(this))

    this._gainNode = this.getCtx().createGain()
    this._gainNode.gain.value = config.volume
    this._sourceNode.connect(this._gainNode)
    this._gainNode.connect(this.getDestinationNode())
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
    this._sourceNode.play().catch((err) => {
      console.error('Error playing', err)
    })
  }

  public stop() {
    this._sourceNode.stop().catch((err) => {
      console.error('Error stopping', err)
    })
  }

  public fade(newVolume: number, fadeOverMs: number) {
    if (this._gainNode === null) {
      return
    }

    this._gainNode.gain.cancelScheduledValues(this.getCtx().currentTime)
    try {
      this._gainNode.gain.setValueCurveAtTime(
        this.genWaveArray(newVolume),
        this.getCtx().currentTime,
        fadeOverMs / 1000
      )
    } catch (err) {
      console.error(err)
    }
  }

  public rate(rate: number) {
    this._sourceNode.rate(rate)
  }

  public pan(pan: number) {
    this._sourceNode.pan(pan)
  }

  public getDuration() {
    return this._sourceNode.getDuration()
  }

  public setVolume(newVolume: number) {
    if (this._gainNode === null) {
      return
    }

    this._gainNode.gain.value = newVolume
  }

  private genWaveArray(newVolume: number): Float32Array {
    const arr = new Float32Array(2)
    arr[0] = this._gainNode?.gain.value ?? this._config.volume
    arr[1] = newVolume
    return arr
  }

  private handlePlay() {
    this._state = RpgAudioState.Playing
    this._playListeners.forEach((l) => l(this))
  }

  private handleStop() {
    this._state = RpgAudioState.Stopped
    this._stopListeners.forEach((l) => l(this))
  }

  private handleLoad() {
    this._state = RpgAudioState.Ready
    this._loadListeners.forEach((l) => l(this))
  }

  private handleError() {
    this._state = RpgAudioState.Error
    console.log('err')
  }

  private getCtx() {
    return AudioCtx
  }

  private getDestinationNode(): AudioNode {
    switch (this._nodeCtx) {
      case Ctx.Environmental:
        return AudioProcessing.cave.getNode()
      default:
        return AudioCtx.destination
    }
  }
}
