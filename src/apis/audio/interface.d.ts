export type SoundEffect = {
  id: string
  path: string
}

export type SoundGroup = {
  id: string
  name: string
  effects: SoundEffect[]
}

export type SoundBoard = {
  id: string
  name: string
  groups: SoundGroup[]
}

export type CreateGroupRequest = {
  name: string
  boardID: string
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
  groupID: string
  boardID: string
  effectPath: string
}

export type AddEffectToGroupResponse = {
  effect: SoundEffect
}

export type GetGroupRequest = {
  boardID: string
  groupID: string
}

export type GetGroupResponse = {
  group: SoundGroup | undefined
}

export type GetBoardRequest = {
  boardID: string
}

export type GetBoardResponse = {
  board: SoundBoard | undefined
}

export type GetAllBoardsRequest = NonNullable<unknown>

export type GetAllBoardsResponse = {
  boards: SoundBoard[]
}

export type AudioApiConfig = {
  boards: SoundBoard[]
}

export type BoardID = `brd-${string}-${string}-${string}-${string}-${string}`

export type GroupID = `grp-${string}-${string}-${string}-${string}-${string}`

export type EffectID = `eff-${string}-${string}-${string}-${string}-${string}`

export interface IAudioApi {
  CreateGroup(request: CreateGroupRequest): CreateGroupResponse
  CreateBoard(request: CreateBoardRequest): CreateBoardResponse
  AddEffectToGroup(request: AddEffectToGroupRequest): AddEffectToGroupResponse
  GetGroup(request: GetGroupRequest): GetGroupResponse
  GetBoard(request: GetBoardRequest): GetBoardResponse
  GetAllBoards(request: GetAllBoardsRequest): GetAllBoardsResponse
}
