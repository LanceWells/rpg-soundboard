import { Howl } from 'howler'
import { GroupID } from 'src/apis/audio/types/groups'
import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { ISoundContainer, LoadedHandler, SoundContainerSetup, StopHandler } from './interface'

export abstract class AbstractSoundContainer<TID extends GroupID | undefined = GroupID>
  implements ISoundContainer
{
  private _stopHandler: StopHandler<TID> | undefined
  private _loadedHandler: LoadedHandler | undefined

  protected duration: number | undefined
  protected howl: Howl
  protected targetVolume: number
  protected _src: string

  public abstract Variant: SoundVariants

  protected get fadeTime() {
    return 200
  }

  protected get src(): string | string[] {
    return this._src
  }

  protected constructor(setup: SoundContainerSetup<TID>, loop: boolean) {
    const { src, format, volume, stopHandler, loadedHandler, useHtml5 } = setup

    this.targetVolume = volume / 100
    this._src = src

    const initVolume = loop ? 0 : this.targetVolume

    if (src.startsWith('aud://')) {
      this.howl = new Howl({
        src: this.src,
        volume: initVolume,
        loop,
        html5: useHtml5,
        preload: useHtml5 ? 'metadata' : true
      })
    } else {
      this.howl = new Howl({
        src: this.src,
        volume: initVolume,
        format: format?.replace('.', ''),
        loop,
        html5: useHtml5
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
