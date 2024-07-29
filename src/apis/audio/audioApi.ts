import {
  AddEffectToGroupRequest,
  AddEffectToGroupResponse,
  CreateBoardRequest,
  CreateBoardResponse,
  CreateGroupRequest,
  CreateGroupResponse,
  GetAllBoardsRequest,
  GetAllBoardsResponse,
  GetBoardRequest,
  GetBoardResponse,
  GetGroupRequest,
  GetGroupResponse,
  IAudioApi,
  SoundBoard,
  SoundEffect,
  SoundGroup
} from './interface'
import { ConfigStorage } from '../../utils/configStorage'
import crypto from 'node:crypto'
import { produce } from 'immer'

type AudioApiConfig = {
  boards: SoundBoard[]
}

type BoardID = `brd-${string}-${string}-${string}-${string}-${string}`

type GroupID = `grp-${string}-${string}-${string}-${string}-${string}`

type EffectID = `eff-${string}-${string}-${string}-${string}-${string}`

export class AudioApi implements IAudioApi {
  private _config: ConfigStorage<AudioApiConfig>
  private _boardMap: Map<string, SoundBoard>
  private _groupMap: Map<string, SoundGroup>

  constructor() {
    this._config = new ConfigStorage('audio-api', {
      boards: []
    })

    const allGroups = this._config.Config.boards.flatMap((b) => b.groups)

    this._boardMap = new Map(this._config.Config.boards.map((b) => [b.id, b]))
    this._groupMap = new Map(allGroups.map((g) => [g.id, g]))
  }

  CreateGroup(request: CreateGroupRequest): CreateGroupResponse {
    const matchingBoard = this.GetBoard({ boardID: request.boardID })
    if (!matchingBoard) {
      throw new Error(`Could not find matching board with ID ${request.boardID}.`)
    }

    const uuid = crypto.randomUUID()
    const newGroupID: GroupID = `grp-${uuid}`
    const newGroup: SoundGroup = {
      effects: [],
      id: newGroupID,
      name: request.name
    }

    const newConfig = produce(this._config.Config, (draft) => {
      const matchingBoard = draft.boards.find((b) => b.id === request.boardID)
      matchingBoard?.groups.push(newGroup)
    })

    this._config.UpdateConfig(newConfig)
    matchingBoard.board?.groups.push(newGroup)
    this._groupMap.set(newGroupID, newGroup)

    return {
      group: newGroup
    }
  }

  CreateBoard(request: CreateBoardRequest): CreateBoardResponse {
    const uuid = crypto.randomUUID()
    const newBoardID: BoardID = `brd-${uuid}`
    const newBoard: SoundBoard = {
      groups: [],
      id: newBoardID,
      name: request.name
    }

    const newConfig = produce(this._config.Config, (draft) => {
      draft.boards.push(newBoard)
    })

    this._config.UpdateConfig(newConfig)
    this._boardMap.set(newBoardID, newBoard)

    return {
      board: newBoard
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  AddEffectToGroup(request: AddEffectToGroupRequest): AddEffectToGroupResponse {
    const matchingGroup = this.GetGroup({ groupID: request.groupID, boardID: request.boardID })
    if (!matchingGroup) {
      throw new Error(`Could not find matching board with ID ${request.boardID}.`)
    }

    const uuid = crypto.randomUUID()
    const newEffectID: EffectID = `eff-${uuid}`
    const newEffect: SoundEffect = {
      id: newEffectID,
      path: request.effectPath
    }

    const newConfig = produce(this._config.Config, (draft) => {
      const matchingBoard = draft.boards.find((b) => b.groups.some((g) => g.id === request.groupID))
      matchingBoard?.groups.
    })
  }

  GetGroup(request: GetGroupRequest): GetGroupResponse {
    const matchingGroup = this._groupMap.get(request.groupID)
    return {
      group: matchingGroup
    }
  }

  GetBoard(request: GetBoardRequest): GetBoardResponse {
    const matchingBoard = this._boardMap.get(request.boardID)
    return {
      board: matchingBoard
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  GetAllBoards(request: GetAllBoardsRequest): GetAllBoardsResponse {
    return {
      boards: this._config.Config.boards
    }
  }
}
