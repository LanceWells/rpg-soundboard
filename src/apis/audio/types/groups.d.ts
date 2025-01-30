import type { SoundGroupEditableFields, SoundGroupSource, SoundEffect } from './items'
import type { BoardID } from './boards'
import type { EffectID } from './effects'
import type { CategoryID } from './categories'
import type { SupportedFileTypes } from '../supportedFileTypes'
import { SoundVariants } from './soundVariants'

/**
 * The request object for {@link IGroups.Create}.
 */
export type CreateRequest = {
  /**
   * The ID for the board that this group should be a part of.
   */
  boardID: BoardID
} & SoundGroupEditableFields

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
 * The request object for {@link IGroups.AddEffect}.
 */
export type AddEffectRequest = {
  /**
   * The group to add the effect to.
   */
  groupID: GroupID

  /**
   * The board that the group is a part of.
   */
  boardID: BoardID

  /**
   * The path to the originating sound effect file.
   */
  effectPath: string

  /**
   * The target volume for the sound effect. Should range from 0-100.
   */
  effectVolume: number
}

/**
 * The response object for {@link IGroups.AddEffect}.
 */
export type AddEffectResponse = {
  /**
   * The sound effect that has been created.
   */
  effect: SoundEffect
}

export type LinkRequest = {
  destinationBoard: BoardID
  sourceGroup: GroupID
  sourceBoard: BoardID
}

export type LinkResponse = {}

export type UnlinkRequest = {
  board: BoardID
  group: GroupID
}

export type UnlinkResponse = {}

/**
 * The request object for {@link IGroups.Update}.
 */
export type UpdateRequest = {
  /**
   * The ID for the board that this group belongs to.
   */
  boardID: BoardID

  /**
   * The ID for the group that should be updated.
   */
  groupID: GroupID
} & SoundGroupEditableFields

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
  group: SoundGroup | undefined
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
  soundB64: string

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

/**
 * The request object for {@link IGroups.Reorder}.
 */
export type ReorderRequest = {
  /**
   * The ID for the board that should have its groups reordered.
   */
  boardID: BoardID

  /**
   * The new order that the groups should be rearranged in.
   */
  newOrder: GroupID[]

  /**
   * If provided, indicates that the groups being reordered are within the same category. Otherwise,
   * indicates that the gruops are uncategorized.
   */
  category: CategoryID
}

/**
 * The response object for {@link IGroups.Reorder}.
 */
export type ReorderResponse = {}

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
 * The request object for {@link IGroups.Move}.
 */
export type MoveRequest = {
  /**
   * The ID for the group that should be deleted.
   */
  groupID: GroupID

  /**
   * The board to Copy this group to.
   */
  boardID: BoardID
}

/**
 * The response object for {@link IGroups.Move}.
 */
export type MoveResponse = {}

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
   * Copies a particular group that matches the provided set of parameters.
   * @param request See {@link DeleteRequest}.
   */
  Move(request: MoveRequest): MoveResponse

  /**
   * Reorders groups within a particular category, or that are uncategorized.
   * @param request See {@link ReorderRequest}.
   */
  Reorder(request: ReorderRequest): ReorderResponse

  /**
   * Gets a random sound effect from a group that matches the set list of parameters.
   * @param request See {@link GetSoundRequest}.
   */
  GetSound(request: GetSoundRequest): Promise<GetSoundResponse>

  /**
   * Adds an effect to a particular group.
   * @param request See {@link AddEffectRequest}.
   */
  AddEffect(request: AddEffectRequest): AddEffectResponse

  LinkGroup(request: LinkRequest): LinkResponse

  UnlinkGroup(request: UnlinkRequest): UnlinkResponse
}
