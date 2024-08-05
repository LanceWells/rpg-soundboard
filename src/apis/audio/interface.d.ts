import { SupportedFileTypes as SupportedFileType } from './audioApi'

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
  format: SupportedFileType

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
}

/**
 * A request for {@link IAudioApi.CreateGroup}.
 */
export type CreateGroupRequest = {
  /**
   * The name of the group to be created.
   */
  name: string

  /**
   * The ID for the board that this group should be a part of.
   */
  boardID: BoardID

  /**
   * The set of sound effects that should be contained by this group.
   */
  soundEffects: SoundEffectEditableFields[]

  /**
   * An icon that represents the group to be created.
   */
  icon: SoundIcon
}

export type CreateGroupResponse = {
  group: SoundGroup
}

export type CreateBoardRequest = {
  name: string
}

export type CreateBoardResponse = {
  board: SoundBoard
}

export type AddEffectToGroupRequest = {
  groupID: GroupID
  boardID: BoardID
  effectPath: string
  effectVolume: number
}

export type AddEffectToGroupResponse = {
  effect: SoundEffect
}

export type UpdateGroupRequest = {
  boardID: BoardID
  groupID: GroupID
  name: string
  soundFilePaths: SoundEffectEditableFields[]
  icon: SoundIcon
}

export type UpdateGroupResponse = {
  group: SoundGroup
}

export type GetGroupRequest = {
  groupID: GroupID
}

export type GetGroupResponse = {
  group: SoundGroup | undefined
}

export type GetBoardRequest = {
  boardID: BoardID
}

export type GetBoardResponse = {
  board: SoundBoard | undefined
}

export type GetAllBoardsRequest = NonNullable<unknown>

export type GetAllBoardsResponse = {
  boards: SoundBoard[]
}

export type PlayGroupRequest = {
  groupID: GroupID
  relFile: string
}

export type PlayGroupResponse = {
  soundB64: string
  format: SupportedFileType
  volume: number
}

export type PreviewSoundRequest = {
  effect: SoundEffectEditableFields
}

export type PreviewSoundResponse = {
  soundB64: string
  format: SupportedFileType
  volume: number
}

export type AudioApiConfig = {
  boards: SoundBoard[]
}

export type BoardID = `brd-${string}-${string}-${string}-${string}-${string}`

export type GroupID = `grp-${string}-${string}-${string}-${string}-${string}`

export type EffectID = `eff-${string}-${string}-${string}-${string}-${string}`

export interface IAudioApi {
  CreateGroup(request: CreateGroupRequest): CreateGroupResponse
  UpdateGroup(request: UpdateGroupRequest): UpdateGroupResponse
  CreateBoard(request: CreateBoardRequest): CreateBoardResponse
  AddEffectToGroup(request: AddEffectToGroupRequest): AddEffectToGroupResponse
  GetGroup(request: GetGroupRequest): GetGroupResponse
  GetBoard(request: GetBoardRequest): GetBoardResponse
  GetAllBoards(request: GetAllBoardsRequest): GetAllBoardsResponse
  PlayGroup(request: PlayGroupRequest): Promise<PlayGroupResponse>
  PreviewSound(request: PreviewSoundRequest): Promise<PreviewSoundResponse>
}
