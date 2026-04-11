import { RpgAudio } from '@renderer/rpgAudioEngine'
import { EffectID } from 'src/apis/audio/types/effects'
import { GroupID, SoundEffectWithPlayerDetails } from 'src/apis/audio/types/groups'
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

/**
 * Generic event handler pairing an ID with a callback that receives the ID and an associated container.
 */
export type Handler<T extends string, C = ISoundContainer> = {
  id: T
  handler: (groupID: T, container: C) => void
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
  TStopped extends string = GroupID,
  TLoaded extends string = GroupID,
  TPlaying extends string = GroupID
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

/**
 * Bundles an RpgAudio player with its display name and intended target volume.
 */
export type RpgAudioContainer = {
  targetVolume: number
  name: string
  audio: RpgAudio
}

/**
 * Common interface for all sound containers, providing play/stop/volume/fade controls.
 */
export interface ISoundContainer {
  Variant: SoundVariants
  Volume: number
  Play(): void
  Stop(): void
  ChangeVolume(volume: number): void
  Fade(ratio: number, fadeTime?: number): void
  GetDuration(): Promise<number>
  readonly LoadedEffectID: EffectID | undefined
}

/**
 * Enumeration of event names specific to soundtrack containers.
 */
export const SoundtrackEvents = {
  playNext: 'playNext'
}

/**
 * String union of valid soundtrack event names.
 */
export type SoundtrackEvents = keyof typeof SoundtrackEvents

/**
 * Interface for soundtrack containers that support queued playback and song-advance events.
 */
export interface ISoundtrackContainer {
  playNextSong(): Promise<void>
  getActiveSong(): RpgAudioContainer | undefined
  on(event: SoundtrackEvents, handler: Handler<GroupID, ISoundContainer & ISoundtrackContainer>)
}
