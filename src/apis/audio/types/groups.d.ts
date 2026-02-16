import type {
  SoundGroupSourceEditableFields,
  SoundGroupSource,
  SoundEffect,
  SoundGroupReferenceEditableFields,
  SoundGroupSequenceEditableFields,
  SoundGroupSequence
} from './items'
import type { EffectID } from './effects'
import type { SupportedFileTypes } from '../supportedFileTypes'
import { SoundVariants } from './soundVariants'

/**
 * The request object for {@link IGroups.Create}.
 */
export type CreateRequest = SoundGroupSourceEditableFields

/**
 * The response object for {@link IGroups.Create}.
 */
export type CreateResponse = {
  /**
   * The group that has been created.
   */
  group: SoundGroupSource
}

export type CreateSequenceRequest = SoundGroupSequenceEditableFields

export type CreateSequenceResponse = {
  sequence: SoundGroupSequence
}

export type UpdateSequenceRequest = {
  groupID: GroupID
} & SoundGroupSequenceEditableFields

export type UpdateSequenceResponse = {
  sequence: SoundGroupSequence
}

/**
 * The request object for {@link IGroups.Update}.
 */
export type UpdateRequest = {
  /**
   * The ID for the group that should be updated.
   */
  groupID: GroupID
} & SoundGroupSourceEditableFields

/**
 * The response object for {@link IGroups.Update}.
 */
export type UpdateResponse = {
  /**
   * The sound group that has been updated.
   */
  group: SoundGroupSource
}

/**
 * The request object for {@link IGroups.Get}.
 */
export type GetRequest = {
  /**
   * The ID for the group to fetch.
   */
  groupID: GroupID
}

/**
 * The response object for {@link IGroups.Get}.
 */
export type GetResponse = {
  /**
   * The group that has been fetched, or undefined if the group was not found.
   */
  group: ISoundGroup | undefined
}

export type GetAllResponse = {
  groups: ISoundGroup[]
}

/**
 * The request object for {@link IGroups.GetSound}.
 */
export type GetSoundRequest = {
  /**
   * The ID for the group to get the sound effect for.
   */
  groupID: GroupID

  idsToSkip?: EffectID[]
}

/**
 * The response object for {@link IGroups.GetSound}.
 */
export type GetSoundResponse = {
  /**
   * The base64 data URL for the file. This can be handed off directly to an audio player to load
   * the sound effect.
   */
  src: string

  /**
   * The file format from the original file. This is necessary when sending a data URL into an audio
   * player.
   */
  format: SupportedFileType

  /**
   * The volume of the effect to play. Will range from 0 to 100.
   */
  volume: number

  /**
   * The ID for the effect that is being played.
   */
  effectID: EffectID

  /**
   * The variant for the group that the sound has been fetched for. This is provided as a factor of
   * convenience, but should be included on the originating object.
   */
  variant: SoundVariants

  /**
   * If true, this provided sound effect should utilize HTML5 audio. This should be "false" in
   * general. The Web Audio API is preferable in most aspects, but at time of writing our
   * implementation does not allow for audio streaming using the Web Audio API. As a result, any
   * large files that should be streamed, should use html5 to ensure that they are streamed as
   * opposed to fully downloaded.
   */
  useHtml5: boolean
}

export type SoundEffectWithPlayerDetails = SoundEffect & {
  /**
   * If true, this provided sound effect should utilize HTML5 audio. This should be "false" in
   * general. The Web Audio API is preferable in most aspects, but at time of writing our
   * implementation does not allow for audio streaming using the Web Audio API. As a result, any
   * large files that should be streamed, should use html5 to ensure that they are streamed as
   * opposed to fully downloaded.
   */
  useHtml5: boolean
}

export type GetSoundsResponse = {
  variant: SoundVariants
  sounds: SoundEffectWithPlayerDetails[]
}

/**
 * The request object for {@link IGroups.Delete}.
 */
export type DeleteRequest = {
  /**
   * The ID for the group that should be deleted.
   */
  groupID: GroupID
}

/**
 * The response object for {@link IGroups.Delete}.
 */
export type DeleteResponse = {}

/**
 * An ID that refers to a particular sound group.
 */
export type GroupID = `grp-${string}-${string}-${string}-${string}-${string}`

/**
 * A fragment of the larger {@link IAudioApi} interface.
 *
 * Specifically for use with "SoundGroups". SoundGroups refer to a single button on a larger
 * soundboard. The "group" terminology refers to the fact that an individual button might contain
 * multiple effects that are selected at random.
 */
export interface IGroups {
  /**
   * Gets a group that matches the provided set of parameters.
   * @param request See {@link GetRequest}.
   */
  Get(request: GetRequest): GetResponse

  GetAll(): GetAllResponse

  /**
   * Creates a new group using the provided set of parameters.
   * @param request See {@link CreateRequest}.
   */
  Create(request: CreateRequest): CreateResponse

  /**
   * Updates a particular group using the provided set of parameters.
   * @param request See {@link UpdateRequest}.
   */
  Update(request: UpdateRequest): UpdateResponse

  /**
   * Deletes a particular group that matches the provided set of parameters.
   * @param request See {@link DeleteRequest}.
   */
  Delete(request: DeleteRequest): DeleteResponse

  GetSounds(request: GetSoundRequest): Promise<GetSoundsResponse>

  CreateSequence(request: CreateSequenceRequest): CreateSequenceResponse

  UpdateSequence(request: UpdateSequenceRequest): UpdateSequenceResponse
}
