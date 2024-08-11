import { produce } from 'immer'
import {
  BoardID,
  Boards,
  CreateBoardResponse,
  SoundBoard,
  SoundBoardEditableFields
} from '../interface'
import { AudioConfig } from '../utils/config'
import crypto from 'node:crypto'

export const BoardsAudioAPI: Boards = {
  Get: function (request) {
    const board = AudioConfig.getBoard(request.boardID)
    return {
      board
    }
  },
  Create: function (request: SoundBoardEditableFields): CreateBoardResponse {
    const uuid = crypto.randomUUID()
    const newBoardID: BoardID = `brd-${uuid}`
    const newBoard: SoundBoard = {
      groups: [],
      id: newBoardID,
      name: request.name
    }

    const newConfig = produce(AudioConfig.Config, (draft) => {
      draft.boards.push(newBoard)
    })

    AudioConfig.Config = newConfig

    return {
      board: newBoard
    }
  },
  Update: function (request) {
    throw new Error('Function not implemented.')
  },
  Delete: function (request) {
    throw new Error('Function not implemented.')
  },
  GetAll: function (request) {
    throw new Error('Function not implemented.')
  }
}
