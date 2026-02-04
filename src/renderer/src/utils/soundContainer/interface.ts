import { EffectID } from 'src/apis/audio/types/effects'
import { SoundEffectWithPlayerDetails } from 'src/apis/audio/types/groups'
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
export type StopHandler = {
  /**
   * The ID that is associated with the given effect stopping. This will be undefined if TID is
   * undefined.
   */
  id: string

  /**
   * The handler to invoke once the sound has stopped playing.
   *
   * @param groupID The group ID that will be provided to the callback method.
   */
  handler: (groupID: string) => void
}

export type Handler<T extends string> = {
  id: T
  handler: (groupID: T, container: ISoundContainer) => void
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
export type SoundContainerSetup<
  TStopped extends string = string,
  TLoaded extends string = string,
  TPlaying extends string = string
> = {
  effects: SoundEffectWithPlayerDetails[]

  /**
   * A callback handler that will be invoked when the sound has stopped playing.
   */
  stopHandler?: Handler<TStopped>

  /**
   * A callback handler that will be invoked when the sound has loaded.
   */
  loadedHandler?: Handler<TLoaded>

  playingHandler?: Handler<TPlaying>
}

export interface ISoundContainer {
  Variant: SoundVariants
  Play(): void
  Stop(): void
  ChangeVolume(volume: number): void
  Fade(ratio: number, fadeTime?: number): void
  GetDuration(): Promise<number>
  readonly LoadedEffectID: EffectID | undefined
  readonly Duration: number | undefined
}
