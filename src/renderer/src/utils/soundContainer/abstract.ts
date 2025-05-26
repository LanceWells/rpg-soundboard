import { Howl } from 'howler'
import { GroupID, SoundEffectWithPlayerDetails } from 'src/apis/audio/types/groups'
import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { ISoundContainer, LoadedHandler, SoundContainerSetup, StopHandler } from './interface'
import { EffectID } from 'src/apis/audio/types/effects'
import { getRandomInt } from '../random'

export abstract class AbstractSoundContainer<TID extends GroupID | undefined = GroupID>
  implements ISoundContainer
{
  private _stopHandler: StopHandler<TID> | undefined
  private _loadedHandler: LoadedHandler | undefined

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

  protected SelectEffect(effects: SoundEffectWithPlayerDetails[]): SoundEffectWithPlayerDetails {
    const effectIndex = getRandomInt(0, effects.length - 1)
    return this.effects[effectIndex]
  }

  protected constructor(setup: SoundContainerSetup<TID>, loop: boolean, lastEffectID?: EffectID) {
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

    this.howl
      .once('loaderror', (id, err) => {
        console.error(`Failed to load sound ${id}: ${err}`)
        this.HandleHowlStop()
      })
      .once('playerror', (id, err) => {
        console.error(`Failed to play sound ${id}: ${err}`)
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

  protected HandleHowlStop() {
    this.howl.off()
    if (this._stopHandler) {
      this._stopHandler.handler(this._stopHandler.id)
    }
  }

  protected HandleHowlEnded() {
    //
  }

  protected HandleHowlLoaded() {
    if (this._loadedHandler) {
      this._loadedHandler.handler()
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
