import { AudioCtx, AudioProcessing } from './ctx'
import { RpgAudioBufferNode, RpgAudioElementNode } from './node'
import { RpgAudioConfig, ListenerType, Ctx, IRpgAudioPlayableNode } from './types'

/**
 * An interface with the native Web Audio API. Each instance of this class will connect with the
 * same context as specified in the config.
 */
export class RpgAudio {
  private _config: RpgAudioConfig
  private _sourceNode: IRpgAudioPlayableNode
  private _gainNode: GainNode
  private _nodeCtx: Ctx

  private _stopListeners: ((e: RpgAudio) => void)[] = []
  private _loadListeners: ((e: RpgAudio) => void)[] = []
  private _playListeners: ((e: RpgAudio) => void)[] = []

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
    this._sourceNode.connect(this._gainNode)
    // this._gainNode.connect(this.getCtx().destination)
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
    this._sourceNode.play()
  }

  public stop() {
    this._sourceNode.stop()
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

  public getDuration() {
    return this._sourceNode.getDuration()
  }

  public setVolume(newVolume: number) {
    if (this._gainNode === null) {
      return
    }

    this._gainNode.gain.value = newVolume
  }

  private genWaveArray(ratio: number): Float32Array {
    const arr = new Float32Array(2)
    arr[0] = this._gainNode?.gain.value ?? this._config.volume
    arr[1] = this._config.volume * ratio
    return arr
  }

  private handlePlay() {
    this._playListeners.forEach((l) => l(this))
  }

  private handleStop() {
    this._stopListeners.forEach((l) => l(this))
  }

  private handleLoad() {
    this._loadListeners.forEach((l) => l(this))
  }

  private handleError() {
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
