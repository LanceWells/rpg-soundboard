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

export type SoundGroup = {
  id: GroupID
  name: string
  effects: SoundEffect[]
  icon: SoundIcon
}

export type SoundBoard = {
  id: BoardID
  name: string
  groups: SoundGroup[]
}

export type NewEffectData = {
  path: string
  volume: number
}

export type CreateGroupRequest = {
  name: string
  boardID: BoardID
  soundFilePaths: NewEffectData[]
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
  soundFilePaths: NewEffectData[]
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
  effect: NewEffectData
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
