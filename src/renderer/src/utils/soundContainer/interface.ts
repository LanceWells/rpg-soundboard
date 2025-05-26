import { EffectID } from 'src/apis/audio/types/effects'
import {
  GetSoundResponse,
  GetSoundsResponse,
  GroupID,
  SoundEffectWithPlayerDetails
} from 'src/apis/audio/types/groups'
import { SoundEffect } from 'src/apis/audio/types/items'
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
  // /**
  //  * The source for the sound that should be played. May either use the `aud://` protocol, or be a
  //  * direct file path reference.
  //  */
  // src: string

  effects: SoundEffectWithPlayerDetails[]

  // /**
  //  * The volume that the sound should be played at.
  //  *
  //  * This value ranges from 0 - 400; 100 implying "full volume".
  //  */
  // volume: number

  // /**
  //  * The file format used with the given sound effect.
  //  *
  //  * This is only necessary for base64 data URLs. This value may either include the `.` for a file
  //  * prefix, or omit it. For example, either `.mp3` or `mp3` are valid.
  //  */
  // format?: string

  // /**
  //  * If true, use HTML5 audio for streaming, as opposed to web audio API. This should typically be
  //  * true only for large files.
  //  */
  // useHtml5: boolean

  /**
   * A callback handler that will be invoked when the sound has stopped playing.
   */
  stopHandler?: StopHandler<T>

  /**
   * A callback handler that will be invoked when the sound has loaded.
   */
  loadedHandler?: LoadedHandler
}

export interface ISoundContainer {
  Variant: SoundVariants
  Play(): void
  Stop(): void
  ChangeVolume(volume: number): void
  Fade(ratio: number): void
  readonly LoadedEffectID: EffectID
}
