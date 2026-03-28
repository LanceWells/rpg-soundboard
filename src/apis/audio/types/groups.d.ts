import type {
  SoundGroupSourceEditableFields,
  SoundGroupSource,
  SoundEffect,
  SoundGroupReferenceEditableFields,
  SoundGroupSequenceEditableFields,
  SoundGroupSequence,
  ISoundGroup
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

/**
 * Request for {@link IGroups.CreateBulk}.
 */
export type CreateBulkRequest = {
  /**
   * The groups that should be created.
   */
  groups: SoundGroupSourceEditableFields[]

  /**
   * Any tags that should be applied to each newly-created group.
   */
  commonTags: string[]
}

/**
 * Response for {@link IGroups.CreateBulk}.
 */
export type CreateBulkResponse = {}

/**
 * Request for {@link IGroups.CreateSequence}.
 */
export type CreateSequenceRequest = SoundGroupSequenceEditableFields

/**
 * Response for {@link IGroups.CreateSequence}.
 */
export type CreateSequenceResponse = {
  /**
   * The newly-created sequence.
   */
  sequence: SoundGroupSequence
}

/**
 * Request for {@link IGroups.UpdateSequence}.
 */
export type UpdateSequenceRequest = {
  /**
   * The group that should be edited.
   */
  groupID: GroupID
} & SoundGroupSequenceEditableFields

/**
 * Response for {@link IGroups.UpdateSequence}.
 */
export type UpdateSequenceResponse = {
  /**
   * The sequence that has been updated.
   */
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

/**
 * Response for {@link IGroups.GetAll}.
 */
export type GetAllResponse = {
  /**
   * All of the user's groups.
   */
  groups: ISoundGroup[]
}

/**
 * The request object for {@link IGroups.GetSounds}.
 */
export type GetSoundsRequest = {
  /**
   * The ID for the group to get the sound effect for.
   */
  groupID: GroupID
}

/**
 * Response for {@link IGroups.GetSounds}.
 */
export type GetSoundsResponse = {
  /**
   * The sound variant associated with the particular button (group).
   */
  variant: SoundVariants

  /**
   * The set of sounds associated with the particular button (group).
   */
  sounds: SoundEffectWithPlayerDetails[]
}

/**
 * A complete representation of a sound effect usable by the FE. Includes additional player details.
 */
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
 * A request for {@link IGroups.GetPinnedSearches}.
 */
export type GetPinnedSearchesRequest = {}

/**
 * A response for {@link IGroups.GetPinnedSearches}.
 */
export type GetPinnedSearchesResponse = {
  pinnedSearches: string[]
}

/**
 * A request for {@link IGroups.UpdatePinnedSearches}.
 */
export type UpdatePinnedSearchesRequest = {
  /**
   * The new pinned searches that should be saved. This will entirely replace the existing pinned
   * searches.
   */
  newPinnedSearches: string[]
}

/**
 * A response for {@link IGroups.UpdatePinnedSearches}.
 */
export type UpdatePinnedSearchesResponse = {}

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

  /**
   * Fetches all groups.
   */
  GetAll(): GetAllResponse

  /**
   * Creates a number of groups in a single request.
   * @param request See {@link CreateBulk}.
   */
  CreateBulk(request: CreateBulkRequest): Promise<CreateBulkResponse>

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

  /**
   * Gets all of the sounds (effects) associated with a particular button (group).
   * @param request See {@link GetSoundsRequest}.
   */
  GetSounds(request: GetSoundsRequest): Promise<GetSoundsResponse>

  /**
   * Creates a new sequence element.
   * @param request See {@link CreateSequenceRequest}.
   */
  CreateSequence(request: CreateSequenceRequest): CreateSequenceResponse

  /**
   * Updates an existing sequence element.
   * @param request See {@link UpdateSequence}.
   */
  UpdateSequence(request: UpdateSequenceRequest): UpdateSequenceResponse

  /**
   * Gets all of the pinned searches.
   * @param request See {@link GetPinnedSearchesRequest}.
   */
  GetPinnedSearches(request: GetPinnedSearchesRequest): GetPinnedSearchesResponse

  /**
   * Updates the pinned searches.
   * @param request See {@link UpdatePinnedSearchesRequest}.
   */
  UpdatePinnedSearches(request: UpdatePinnedSearchesRequest): UpdatePinnedSearchesResponse
}
