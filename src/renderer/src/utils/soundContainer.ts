import { Howl } from 'howler'
import { getRandomArbitrary } from './random'
import type { GroupID } from 'src/apis/audio/types/groups'
import { SoundVariants } from 'src/apis/audio/types/soundVariants'

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

  /**
   * The variant for the sound effect. Will determine some behavior for the effect. Please see
   * {@link SoundVariants} for more information on each variant.
   */
  variant: SoundVariants
}

/**
 * A container used to handle sound effects. The intent is to abstract-away some of the overhead
 * hanlding. This overhead handling includes items such as:
 *  - Variant-specific behavior.
 *  - Error logging.
 *  - Dynamic loading.
 *
 * @template TID Defines the type of ID that this particular sound container refers to, and will
 * return when calling provided event callbacks.
 *
 * If undefined, this implies that there should be no item ID provided in the callback. This is
 * useful for situations in which this container is considered to be a disposiable one-use object.
 */
export class SoundContainer<TID extends GroupID | undefined = GroupID> {
  private _howl: Howl
  private _stopHandler: StopHandler<TID> | undefined
  private _loadedHandler: LoadedHandler | undefined

  private _targetVolume: number
  private _variant: SoundVariants
  private _fadeOutRef: NodeJS.Timeout | undefined

  /**
   * This is the amount of time, in ms, that fading effects should take to fully reach the target
   * volume.
   *
   * This applies to both fade in as well as fade out.
   */
  static FadeTime = 200

  /**
   * Creates a new instance of a {@link SoundContainer}.
   *
   * @param setup See {@link SoundContainerSetup}.
   */
  constructor(setup: SoundContainerSetup<TID>) {
    const { src, format, volume, stopHandler, loadedHandler, variant, useHtml5 } = setup

    this._targetVolume = volume / 100
    this._variant = variant

    if (src.startsWith('aud://')) {
      this._howl = new Howl({
        src,
        volume: this._variant === 'Looping' ? 0 : this._targetVolume,
        loop: this._variant === 'Looping',
        html5: useHtml5
      })
    } else {
      this._howl = new Howl({
        src,
        volume: this._variant === 'Looping' ? 0 : this._targetVolume,
        format: format?.replace('.', ''),
        loop: this._variant === 'Looping',
        html5: useHtml5
      })
    }

    this._loadedHandler = loadedHandler
    this._stopHandler = stopHandler

    // If an effect repeats, then this 'end' event will fire every time that the loop restarts.
    // In that case, don't stop the sound effect.
    if (this._variant !== 'Looping') {
      this._howl.once('end', () => {
        this.HandleHowlStop()
      })
    }

    this._howl
      .once('loaderror', (id, err) => {
        console.error(`Failed to load sound ${id}: ${err}`)
        this.HandleHowlStop()
      })
      .once('playerror', (id, err) => {
        console.error(`Failed to play sound ${id}: ${err}`)
        this.HandleHowlStop()
      })
      .on('load', () => {
        this.HandleHowlLoaded()
      })
  }

  async Play() {
    const timeToFade = this._howl.duration() - SoundContainer.FadeTime

    if (this._variant === 'Looping' && timeToFade > 0) {
      this._fadeOutRef = setTimeout(() => {
        if (this && this._howl) {
          this._howl.fade(this._targetVolume, 0, SoundContainer.FadeTime)
        }
      }, SoundContainer.FadeTime)
    }

    this._howl.play()

    if (this._variant === 'Rapid') {
      const randomRate = getRandomArbitrary(0.85, 1.15)
      this._howl.rate(randomRate)
    }

    if (this._variant === 'Looping') {
      this._howl.fade(0, this._targetVolume, SoundContainer.FadeTime)
    }
  }

  GetStopHandle() {
    return () => this.Stop()
  }

  GetVolumeHandle() {
    return (volume: number) => {
      this.ChangeVolume(volume)
    }
  }

  GetPlayHandle() {
    return () => this.Play()
  }

  private HandleHowlStop() {
    clearTimeout(this._fadeOutRef)
    this._howl.off()
    if (this._stopHandler) {
      this._stopHandler.handler(this._stopHandler.id)
    }
  }

  private HandleHowlLoaded() {
    if (this._loadedHandler) {
      this._loadedHandler.handler()
    }
  }

  Stop() {
    if (this._variant === 'Looping' && this._variant === 'Looping') {
      this._howl.fade(this._targetVolume, 0, SoundContainer.FadeTime)
      setTimeout(() => {
        this._howl.stop()
        this.HandleHowlStop()
      }, SoundContainer.FadeTime)

      return
    }

    this._howl.stop()
    this.HandleHowlStop()
  }

  ChangeVolume(volume: number) {
    if (this._howl.playing()) {
      const newVolume = volume / 100
      this._howl.volume(newVolume)
    }
  }
}
