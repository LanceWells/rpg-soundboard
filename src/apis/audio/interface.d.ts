import { SupportedFileTypes } from './supportedFileTypes'

/**
 * Represents the icon associated with an {@link SoundGroup}.
 */
export type SoundIcon = {
  /**
   * The name of the icon to use. This name refers to the name of the icon from the game-icons
   * repository.
   */
  name: string

  /**
   * The hex code for the background color to use with the group's icon.
   */
  backgroundColor: string

  /**
   * The hex code for the foreground color to use with the group's icon.
   */
  foregroundColor: string
}

/**
 * Represents an independent sound effect, for use with picking a random sound from a
 * {@link SoundGroup}.
 */
export type SoundEffect = {
  /**
   * The ID for the effect.
   */
  id: EffectID

  /**
   * The filepath associated with the given sound effect. Should generally be located in the app
   * directory.
   */
  path: string

  /**
   * The file type associated with this given sound effect. Used with howler to determine how to
   * play the given audio, considering that the audio will be translated into a base64 data URL.
   */
  format: SupportedFileTypes

  /**
   * The volume associated with the sound effect. Represented by a number from 0 to 100, where 100
   * is the original volume of the audio.
   */
  volume: number
}

/**
 * An extraction of editable fields for {@link SoundEffect}.
 */
export type SoundEffectEditableFields = Omit<SoundEffect, 'id' | 'format'>

/**
 * Represents a group of independent sound effects. Note that this is represented by a series of
 * buttons on a soundboard. The effects contained by this group are meant to be a randomization of
 * possible sounds that the group might produce.
 */
export type SoundGroup = {
  /**
   * The ID for the group.
   */
  id: GroupID

  /**
   * A name used to represent the group. Ideally this should be short, as it will be rendered in
   * small text underneath a small-sized button.
   */
  name: string

  /**
   * A series of sound effects represented by this group. These are a set of sounds that could
   * evenly be played once the button is pressed.
   */
  effects: SoundEffect[]

  /**
   * The icon that will be displayed as the button for the sound effect.
   */
  icon: SoundIcon

  /**
   * If true, this sound effect should keep playing indefinitely, starting over from the beginning
   * once the sound has ended. Must be stopped manually.
   */
  repeats: boolean

  /**
   * If true, this effect should fade in when starting.
   */
  fadeIn: boolean

  /**
   * If true, this effect should fade out when ending.
   */
  fadeOut: boolean

  category?: CategoryID
}

/**
 * An extraction of editable fields for {@link SoundGroup}.
 */
export type SoundGroupEditableFields = Omit<SoundGroup, 'id' | 'effects'> & {
  /**
   * An extraction of editable fields for sound effects. Created here to represent the set of
   * editable effects for this group.
   */
  effects: SoundEffectEditableFields[]
}

export type SoundCategory = {
  id: CategoryID
  name: string
}

export type SoundCategoryEditableFields = Omit<SoundCategory, 'id'>

/**
 * Represents an individual sound board object. The sound board is the "root" container for all
 * sounds, and should change the entire view to represent its collection of sound effects, once the
 * board has been selected.
 *
 * A board contains groups, which themselves contain effects. The hierarchy being:
 * ```
 * board -> group A -> effect A
 *       |          |  effect B
 *       |
 *       -> group B -> effect C
 * ```
 */
export type SoundBoard = {
  /**
   * The ID for the sound board.
   */
  id: BoardID

  /**
   * The name for the sound board. Used as the primary identifier for a given sound board.
   */
  name: string

  /**
   * The set of groups represented by this sound board. Each group should be represented as an
   * individual button on a given soundboard.
   */
  groups: SoundGroup[]

  categories?: SoundCategory[]
}

/**
 * A set of editable fields as a subset of a {@link SoundBoard}.
 */
export type SoundBoardEditableFields = Omit<SoundBoard, 'id' | 'groups'>

/**
 * The request object for {@link IAudioApi.CreateGroup}.
 */
export type CreateGroupRequest = {
  /**
   * The ID for the board that this group should be a part of.
   */
  boardID: BoardID
} & SoundGroupEditableFields

/**
 * The response object for {@link IAudioApi.CreateGroup}.
 */
export type CreateGroupResponse = {
  /**
   * The group that has been created.
   */
  group: SoundGroup
}

/**
 * The request object for {@link IAudioApi.CreateBoard}.
 */
export type CreateBoardRequest = SoundBoardEditableFields

/**
 * The response object for {@link IAudioApi.CreateBoard}.
 */
export type CreateBoardResponse = {
  /**
   * The board that has been created.
   */
  board: SoundBoard
}

/**
 * The request object for {@link IAudioApi.AddEffectToGroup}.
 */
export type AddEffectToGroupRequest = {
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
 * The response object for {@link IAudioApi.AddEffectToGroupResponse}.
 */
export type AddEffectToGroupResponse = {
  /**
   * The sound effect that has been created.
   */
  effect: SoundEffect
}

/**
 * The request object for {@link IAudioApi.UpdateGroup}.
 */
export type UpdateGroupRequest = {
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
 * The response object for {@link IAudioApi.UpdateGroup}.
 */
export type UpdateGroupResponse = {
  /**
   * The sound group that has been updated.
   */
  group: SoundGroup
}

/**
 * The request object for {@link IAudioApi.GetGroup}.
 */
export type GetGroupRequest = {
  /**
   * The ID for the group to fetch.
   */
  groupID: GroupID
}

/**
 * The response object for {@link IAudioApi.GetGroup}.
 */
export type GetGroupResponse = {
  /**
   * The group that has been fetched, or undefined if the group was not found.
   */
  group: SoundGroup | undefined
}

/**
 * The request object for {@link IAudioApi.GetBoard}.
 */
export type GetBoardRequest = {
  /**
   * The ID for the board to fetch.
   */
  boardID: BoardID
}

/**
 * The response object for {@link IAudioApi.GetBoard}.
 */
export type GetBoardResponse = {
  /**
   * The board that has been fetched, or undefined if the board was not found.
   */
  board: SoundBoard | undefined
}

/**
 * The request object for {@link IAudioApi.GetAllBoardsRequest}.
 */
export type GetAllBoardsRequest = {}

/**
 * The response object for {@link IAudioApi.GetAllBoards}.
 */
export type GetAllBoardsResponse = {
  /**
   * All of the soundboards that are currently stored.
   */
  boards: SoundBoard[]
}

/**
 * The request object for {@link IAudioApi.GetGroupSound}.
 */
export type GetGroupSoundRequest = {
  /**
   * The ID for the group to get the sound effect for.
   */
  groupID: GroupID
}

/**
 * The response object for {@link IAudioApi.GetGroupSound}.
 */
export type GetGroupSoundResponse = {
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
   * If true, this audio should repeat.
   */
  repeats: boolean

  /**
   * If true, this audio should fade in when starting.
   */
  fadeIn: boolean

  /**
   * If true, this audio should fade out when stopping.
   */
  fadeOut: boolean
}

/**
 * The request object for {@link IAudioApi.PreviewSound}.
 */
export type PreviewSoundRequest = {
  /**
   * The set of editable fields for a given sound effect. Note that we only require the editable
   * fields as there is no ID, etc. that can be attributed to an unsaved sound.
   */
  effect: SoundEffectEditableFields
}

/**
 * The response object for {@link IAudioApi.PreviewSound}.
 */
export type PreviewSoundResponse = {
  /**
   * The base64, data URL for a given sound effect.
   */
  soundB64: string

  /**
   * The format for the original sound effect. Note that this is required when playing a sound via
   * a data URL.
   */
  format: SupportedFileType

  /**
   * The volume to play for the sound effect. Will range from 0 to 100.
   */
  volume: number
}

/**
 * The request object for {@link IAudioApi.ReorderGroups}.
 */
export type ReorderGroupsRequest = {
  /**
   * The ID for the board that should have its groups reordered.
   */
  boardID: BoardID

  /**
   * The new order that the groups should be rearranged in.
   */
  newOrder: GroupID[]
}

/**
 * The response object for {@link IAudioApi.ReorderGroups}.
 */
export type ReorderGroupsResponse = {}

/**
 * The request object for {@link IAudioApi.DeleteGroup}.
 */
export type DeleteGroupRequest = {
  /**
   * The ID for the group that should be deleted.
   */
  groupID: GroupID
}

/**
 * The response object for {@link IAudioApi.DeleteGroup}.
 */
export type DeleteGroupResponse = {}

/**
 * The request object for {@link IAudioApi.UpdateBoard}.
 */
export type UpdateBoardRequest = {
  /**
   * The ID for the board that should be updated.
   */
  boardID: BoardID

  /**
   * The new fields that should be configured for the given board.
   */
  fields: SoundBoardEditableFields
}

/**
 * The response object for {@link IAudioApi.UpdateBoard}.
 */
export type UpdateBoardResponse = { board: SoundBoard }

/**
 * The request object for {@link IAudioApi.DeleteBoardRequest}.
 */
export type DeleteBoardRequest = {
  /**
   * The ID for the board to be deleted.
   */
  boardID: BoardID
}

export type CreateCategoryRequest = {
  boardID: BoardID
} & SoundCategoryEditableFields

export type CreateCategoryResponse = {
  category: SoundCategory
}

export type DeleteCategoryRequest = {
  boardID: BoardID
  categoryID: CategoryID
}

export type DeleteCategoryResponse = {}

export type UpdateCategoryRequest = {
  boardID: BoardID
  categoryID: CategoryID
} & SoundCategoryEditableFields

export type UpdateCategoryResponse = {
  category: SoundCategory
}

export type GetGroupsForCategoryRequest = {
  categoryID: CategoryID
}

export type GetGroupsForCategoryResponse = {
  groups: SoundGroup[]
}

export type GetUncategorizedGroupsRequest = {
  boardID: BoardID
}

export type GetUncategorizedGroupsResponse = {
  groups: SoundGroup[]
}

/**
 * The response object for {@link IAudioApi.DeleteBoard}.
 */
export type DeleteBoardResponse = {}

/**
 * The root object for the audio API, and the storage for all soundboards.
 */
export type AudioApiConfig = {
  /**
   * The set of soundboards that are stored in the relevant config file.
   */
  boards: SoundBoard[]
}

/**
 * An ID that refers to a particular soundboard.
 */
export type BoardID = `brd-${string}-${string}-${string}-${string}-${string}`

/**
 * An ID that refers to a particular sound group.
 */
export type GroupID = `grp-${string}-${string}-${string}-${string}-${string}`

/**
 * An ID that refers to a particular sound effect.
 */
export type EffectID = `eff-${string}-${string}-${string}-${string}-${string}`

/**
 * An ID that refers to a particular sound category.
 */
export type CategoryID = `cat-${string}-${string}-${string}-${string}-${string}`

/**
 * An interface used to define the set of methods that comprise the "Audio" side of the application.
 */
export interface IAudioApi {
  /**
   * Gets a specific group from the soundboard storage.
   *
   * @param request See {@link GetGroupRequest}.
   */
  GetGroup(request: GetGroupRequest): GetGroupResponse

  /**
   * Creates a new group for a particular soundboard.
   *
   * @param request See {@link CreateGroupRequest}.
   */
  CreateGroup(request: CreateGroupRequest): CreateGroupResponse

  /**
   * Updates a particular group with a new set of specified values.
   *
   * @param request See {@link UpdateGroupRequest}.
   */
  UpdateGroup(request: UpdateGroupRequest): UpdateGroupResponse

  /**
   * Adds a sound effect to a given sound group.
   *
   * @param request See {@link AddEffectToGroupRequest}.
   */
  AddEffectToGroup(request: AddEffectToGroupRequest): AddEffectToGroupResponse

  /**
   * Gets a sound effect from a given group.
   *
   * Note that if a particular group has multiple sound effects, that one will be chosen from that
   * group at random.
   *
   * To simplify the setup process, there are no weighted values to determine which sound effect is
   * retrieved.
   *
   * @param request See {@link GetGroupSoundRequest}.
   */
  GetGroupSound(request: GetGroupSoundRequest): Promise<GetGroupSoundResponse>

  /**
   * Gets a particular soundboard.
   *
   * @param request See {@link GetBoardRequest}.
   */
  GetBoard(request: GetBoardRequest): GetBoardResponse

  /**
   * Creates a new soundboard.
   *
   * @param request See {@link CreateBoardRequest}.
   */
  CreateBoard(request: CreateBoardRequest): CreateBoardResponse

  /**
   * Updates a particular soundboard.
   *
   * @param request See {@link UpdateBoardRequest}.
   */
  UpdateBoard(request: UpdateBoardRequest): UpdateBoardResponse

  /**
   * Deletes a given soundboard. Note that this will delete not only the board, but it will delete
   * information about all of the groups that it contains as well as the stored sound effects for
   * each group in this board.
   *
   * @param request See {@link DeleteBoardRequest}.
   */
  DeleteBoard(request: DeleteBoardRequest): DeleteBoardResponse

  /**
   * Gets all soundboards that are currently stored by the system.
   *
   * @param request See {@link GetAllBoardsRequest}.
   */
  GetAllBoards(request: GetAllBoardsRequest): GetAllBoardsResponse

  /**
   * Reorders groups in a particular soundboard.
   *
   * @param request See {@link ReorderGroupsRequest}.
   */
  ReorderGroups(request: ReorderGroupsRequest): ReorderGroupsResponse

  /**
   * Deletes a particular group. Note that this will also delete all related sound effect files.
   *
   * @param request See {@link DeleteGroupRequest}.
   */
  DeleteGroup(request: DeleteGroupRequest): DeleteGroupResponse

  /**
   * Used to preview a particular sound effect. Useful when we don't quite want to store a sound
   * effect before we try to listen to it.
   *
   * @param request See {@link PreviewSoundRequest}.
   */
  PreviewSound(request: PreviewSoundRequest): Promise<PreviewSoundResponse>

  CreateCategory(request: CreateCategoryRequest): CreateCategoryResponse

  DeleteCategory(request: DeleteCategoryRequest): DeleteBoardResponse

  UpdateCategory(request: UpdateCategoryRequest): UpdateCategoryResponse

  GetGroupsForCategory(request: GetGroupsForCategoryRequest): GetGroupsForCategoryResponse

  GetUncategorizedGroups(request: GetUncategorizedGroupsRequest): GetUncategorizedGroupsResponse
}
