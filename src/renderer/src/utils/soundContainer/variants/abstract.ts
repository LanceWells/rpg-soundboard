import { Howl } from 'howler'
import { GroupID } from 'src/apis/audio/types/groups'
import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { ISoundContainer } from './interface'

/**
 * Defines the callback handler that will be invoked when the sound stops playing.
 *
 * @template TID Defines the type of ID that this particular sound container refers to, and will
 * return when calling provided event callbacks.
 *
 * If undefined, this implies that there should be no item ID provided in the callback. This is
 * useful for situations in which this container is considered to be a disposiable one-use object.
 */
export type StopHandler<TID extends GroupID | undefined> = {
  /**
   * The ID that is associated with the given effect stopping. This will be undefined if TID is
   * undefined.
   */
  id: TID

  /**
   * The handler to invoke once the sound has stopped playing.
   *
   * @param groupID The group ID that will be provided to the callback method.
   */
  handler: (groupID: TID) => void
}

/**
 * Defines the callback handler that will be invoked when the sound is loaded.
 */
export type LoadedHandler = {
  /**
   * The handler to invoke once the sound has loaded.
   */
  handler: () => void
}

/**
 * A setup container used to define variables for use with an instance of a sound container.
 *
 * @template TID Defines the type of ID that this particular sound container refers to, and will
 * return when calling provided event callbacks.
 *
 * If undefined, this implies that there should be no item ID provided in the callback. This is
 * useful for situations in which this container is considered to be a disposiable one-use object.
 */
export type SoundContainerSetup<T extends GroupID | undefined> = {
  /**
   * The source for the sound that should be played. May either use the `aud://` protocol, or be a
   * direct file path reference.
   */
  src: string

  /**
   * The volume that the sound should be played at.
   *
   * This value ranges from 0 - 400; 100 implying "full volume".
   */
  volume: number

  /**
   * The file format used with the given sound effect.
   *
   * This is only necessary for base64 data URLs. This value may either include the `.` for a file
   * prefix, or omit it. For example, either `.mp3` or `mp3` are valid.
   */
  format?: string

  /**
   * If true, use HTML5 audio for streaming, as opposed to web audio API. This should typically be
   * true only for large files.
   */
  useHtml5: boolean

  /**
   * A callback handler that will be invoked when the sound has stopped playing.
   */
  stopHandler?: StopHandler<T>

  /**
   * A callback handler that will be invoked when the sound has loaded.
   */
  loadedHandler?: LoadedHandler
}

export abstract class AbstractSoundContainer<TID extends GroupID | undefined = GroupID>
  implements ISoundContainer
{
  private _stopHandler: StopHandler<TID> | undefined
  private _loadedHandler: LoadedHandler | undefined

  protected duration: number | undefined
  protected howl: Howl
  protected targetVolume: number

  public abstract Variant: SoundVariants

  protected get fadeTime() {
    return 200
  }

  protected constructor(setup: SoundContainerSetup<TID>, loop: boolean) {
    const { src, format, volume, stopHandler, loadedHandler, useHtml5 } = setup

    this.targetVolume = volume / 100

    const initVolume = loop ? 0 : this.targetVolume

    if (src.startsWith('aud://')) {
      this.howl = new Howl({
        src,
        volume: initVolume,
        loop,
        html5: useHtml5,
        preload: useHtml5 ? 'metadata' : true
      })
    } else {
      this.howl = new Howl({
        src,
        volume: initVolume,
        format: format?.replace('.', ''),
        loop,
        html5: useHtml5
      })
    }

    this._loadedHandler = loadedHandler
    this._stopHandler = stopHandler

    if (loop) {
      this.howl.once('stop', () => {
        this.HandleHowlStop()
      })
    } else {
      this.howl.once('end', () => {
        this.HandleHowlStop()
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
        this.duration = this.howl.duration()
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
