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
import { deleteBoardFolder } from './fs'

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
    const matchingBoard = this.Get({ boardID: request.boardID })
    if (!matchingBoard.board) {
      throw new Error(`Could not find matching board with ID ${request.boardID}.`)
    }

    const newConfig = produce(AudioConfig.Config, (draft) => {
      const matchingBoard = draft.boards.find((b) => b.id === request.boardID)
      if (matchingBoard) {
        matchingBoard.name = request.fields.name
      }
    })

    AudioConfig.Config = newConfig

    const updatedBoard = this.Get({ boardID: request.boardID })

    return {
      board: updatedBoard.board!
    }
  },
  Delete: function (request) {
    const matchingBoard = this.Get({ boardID: request.boardID })
    if (matchingBoard.board === undefined) {
      throw new Error(`Could not find matching board with ID ${request.boardID}.`)
    }

    const newConfig = produce(AudioConfig.Config, (draft) => {
      draft.boards = draft.boards.filter((b) => b.id !== matchingBoard.board?.id)
    })

    AudioConfig.Config = newConfig

    deleteBoardFolder(request.boardID)

    return {}
  },
  GetAll: function () {
    return {
      boards: AudioConfig.Config.boards
    }
  }
}
