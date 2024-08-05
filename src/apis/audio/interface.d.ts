import { SupportedFileTypes } from './audioApi'

export type SoundIcon = {
  name: string
  backgroundColor: string
  foregroundColor: string
}

export type SoundEffect = {
  id: EffectID
  path: string
  format: SupportedFileTypes
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
  format: SupportedFileTypes
  volume: number
}

export type PreviewSoundRequest = {
  effect: NewEffectData
}

export type PreviewSoundResponse = {
  soundB64: string
  format: SupportedFileTypes
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
