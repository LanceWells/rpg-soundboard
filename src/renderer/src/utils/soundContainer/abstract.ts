import { Howl } from 'howler'
import { SoundEffectWithPlayerDetails } from 'src/apis/audio/types/groups'
import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { Handler, ISoundContainer, SoundContainerSetup } from './interface'
import { EffectID } from 'src/apis/audio/types/effects'
import { getRandomInt } from '../random'

export abstract class AbstractSoundContainer<
  TStopped extends string = string,
  TLoaded extends string = string,
  TPlaying extends string = string
> implements ISoundContainer
{
  private _stopHandler: Handler<TStopped> | undefined
  private _loadedHandler: Handler<TLoaded> | undefined
  private _playingHandler: Handler<TPlaying> | undefined

  protected _lastEffectID: EffectID | undefined
  protected duration: number | undefined
  protected howl: Howl
  protected targetVolume: number
  protected effects: SoundEffectWithPlayerDetails[] = []
  protected _loadedEffect: SoundEffectWithPlayerDetails

  public abstract Variant: SoundVariants

  protected get fadeTime() {
    return 200
  }

  public get LoadedEffectID(): EffectID {
    return this._loadedEffect.id
  }

  public get Duration(): number | undefined {
    return this.duration
  }

  protected SelectEffect(effects: SoundEffectWithPlayerDetails[]): SoundEffectWithPlayerDetails {
    const effectIndex = getRandomInt(0, effects.length - 1)
    return this.effects[effectIndex]
  }

  protected constructor(
    setup: SoundContainerSetup<TStopped, TLoaded, TPlaying>,
    loop: boolean,
    lastEffectID?: EffectID
  ) {
    const { effects, stopHandler, loadedHandler } = setup

    this.effects = effects
    this._lastEffectID = lastEffectID

    this._loadedEffect = this.SelectEffect(effects)
    this.targetVolume = this._loadedEffect.volume / 100

    const initVolume = loop ? 0 : this.targetVolume
    const src = this._loadedEffect.path

    if (src.startsWith('aud://')) {
      this.howl = new Howl({
        src,
        volume: initVolume,
        loop,
        html5: this._loadedEffect.useHtml5,
        preload: this._loadedEffect.useHtml5 ? 'metadata' : true
      })
    } else {
      this.howl = new Howl({
        src,
        volume: initVolume,
        format: this._loadedEffect.format.replace('.', ''),
        loop,
        html5: this._loadedEffect.useHtml5
      })
    }

    this._loadedHandler = loadedHandler
    this._stopHandler = stopHandler

    if (loop) {
      this.howl
        .once('stop', () => {
          this.HandleHowlStop()
        })
        .on('end', () => {
          this.HandleHowlEnded()
        })
    } else {
      this.howl.once('end', () => {
        this.HandleHowlStop()
        this.HandleHowlEnded()
      })
    }

    if (this.howl.state() === 'loaded') {
      this.duration = this.howl.duration() * 1000
      this.HandleHowlLoaded()
    }

    this.howl
      .once('loaderror', (id, err) => {
        console.error(`Failed to load sound ${id}: ${err}\nsrc: ${src}`)
        this.HandleHowlStop()
      })
      .once('playerror', (id, err) => {
        console.error(`Failed to play sound ${id}: ${err}\nsrc: ${src}`)
        this.HandleHowlStop()
      })
      .on('load', () => {
        // When this loads, we know the duration. We may want to set it right away, but regardless,
        // we probably want to set a timer to trigger at D - N, where D is the duration of the song,
        // and N is the length of time before then to start fading out, while also fading in a new
        // instance.
        this.duration = this.howl.duration() * 1000
        this.HandleHowlLoaded()
      })
      .on('stop', () => {
        this.HandleHowlStop()
      })
  }

  public async GetDuration(): Promise<number> {
    return this.duration ?? 0
  }

  protected HandleHowlStop() {
    this.howl.off()
    if (this._stopHandler) {
      this._stopHandler.handler(this._stopHandler.id, this)
    }
  }

  protected HandleHowlEnded() {
    //
  }

  protected HandleHowlLoaded() {
    if (this._loadedHandler) {
      this._loadedHandler.handler(this._loadedHandler.id, this)
    }
  }

  protected HandleHowlPlaying() {
    if (this._playingHandler) {
      this._playingHandler.handler(this._playingHandler.id, this)
    }
  }

  Play() {
    this.howl.play()
    if (this.fadeTime > 0) {
      this.howl.fade(0, this.targetVolume, this.fadeTime)
    }
  }

  Stop() {
    this.howl.stop()
    this.HandleHowlStop()
  }

  ChangeVolume(volume: number) {
    if (this.howl.playing()) {
      const newVolume = volume / 100
      this.howl.volume(newVolume)
    }
  }

  Fade(ratio: number) {
    if (this.howl.playing()) {
      const oldVolume = this.targetVolume
      const newVolume = oldVolume * ratio
      this.howl.fade(oldVolume, newVolume, 250)
    }
  }
}
