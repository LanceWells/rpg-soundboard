import { produce } from 'immer'
import { AudioConfig } from '../utils/config'
import crypto from 'node:crypto'
import { deleteBoardFolder } from './fs'
import { IBoards, CreateResponse, BoardID } from '../types/boards'
import { SoundBoardEditableFields, SoundBoard, SoundCategory } from '../types/items'
import { CategoryID } from '../types/categories'

/**
 * A standard implementation of the {@link IBoards} interface.
 */
export const BoardsAudioAPI: IBoards = {
  /**
   * @inheritdoc
   */
  Get: function (request) {
    const board = AudioConfig.getBoard(request.boardID)
    return {
      board
    }
  },

  /**
   * @inheritdoc
   */
  Create: function (request: SoundBoardEditableFields): CreateResponse {
    const uuid = crypto.randomUUID()
    const newBoardID: BoardID = `brd-${uuid}`
    const defaultCategory: SoundCategory = {
      id: `brd-${crypto.randomUUID()}` as CategoryID,
      name: request.name
    }

    const newBoard: SoundBoard = {
      references: [],
      groups: [],
      id: newBoardID,
      name: request.name,
      categories: [defaultCategory]
    }

    const newConfig = produce(AudioConfig.Config, (draft) => {
      draft.boards.push(newBoard)
    })

    AudioConfig.Config = newConfig

    return {
      board: newBoard
    }
  },

  /**
   * @inheritdoc
   */
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

  /**
   * @inheritdoc
   */
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

  /**
   * @inheritdoc
   */
  GetAll: function () {
    return {
      boards: AudioConfig.Config.boards
    }
  }
}
