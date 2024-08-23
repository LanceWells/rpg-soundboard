import { produce } from 'immer'
import { AudioConfig } from '../utils/config'
import { BoardsAudioAPI } from './boards'
import {
  ICategories,
  CategoryID,
  CreateRequest,
  CreateResponse,
  DeleteRequest,
  DeleteResponse,
  GetCategorizedGroupsRequest,
  GetCategorizedGroupsResponse,
  GetUncategorizedGroupsRequest,
  GetUncategorizedGroupsResponse,
  ReorderRequest,
  ReorderResponse,
  UpdateRequest,
  UpdateResponse
} from '../types/categories'
import { SoundCategory } from '../types/items'

export const CategoriesAudioAPI: ICategories = {
  /**
   * @inheritdoc
   */
  Create: function (request: CreateRequest): CreateResponse {
    const { boardID, ...categoryFields } = request

    const board = AudioConfig.getBoard(request.boardID)

    if (!board) {
      throw new Error(`${this.Create.name}: board not found with id (${request.boardID})`)
    }

    const newCategoryID: CategoryID = `cat-${crypto.randomUUID()}`
    const newCategory: SoundCategory = {
      id: newCategoryID,
      ...categoryFields
    }

    const newConfig = produce(AudioConfig.Config, (draft) => {
      const matchingBoard = draft.boards.find((b) => b.id === boardID)
      if (!matchingBoard) {
        return
      }

      if (!matchingBoard.categories) {
        matchingBoard.categories = []
      }

      matchingBoard.categories.push(newCategory)
    })

    AudioConfig.Config = newConfig

    return {
      category: newCategory
    }
  },
  /**
   * @inheritdoc
   */
  Update: function (request: UpdateRequest): UpdateResponse {
    const { boardID, categoryID, ...categoryFields } = request

    const matchingBoard = AudioConfig.getBoard(boardID)
    if (matchingBoard === undefined) {
      throw new Error(`Could not find matching board with ID ${boardID}.`)
    }

    const updatedCategory: SoundCategory = {
      id: categoryID,
      ...categoryFields
    }

    const newConfig = produce(AudioConfig.Config, (draft) => {
      const matchingBoard = draft.boards.find((b) => b.id === boardID)
      if (!matchingBoard || !matchingBoard.categories) {
        return
      }

      const newCategories = matchingBoard.categories.map<SoundCategory>((c) => {
        if (c.id === request.categoryID) {
          return updatedCategory
        }

        return c
      })

      matchingBoard.categories = newCategories
    })

    AudioConfig.Config = newConfig

    return {
      category: updatedCategory
    }
  },
  /**
   * @inheritdoc
   */
  Delete: function (request: DeleteRequest): DeleteResponse {
    const matchingBoard = AudioConfig.getBoard(request.boardID)
    if (matchingBoard === undefined) {
      throw new Error(`Could not find matching board with ID ${request.boardID}.`)
    }

    const newConfig = produce(AudioConfig.Config, (draft) => {
      const matchingBoard = draft.boards.find((b) => b.id === request.boardID)
      if (!matchingBoard?.categories) {
        return
      }

      matchingBoard.categories = matchingBoard.categories.filter((c) => c.id !== request.categoryID)
      matchingBoard.groups.forEach((g) => {
        if (g.category === request.categoryID) {
          g.category = undefined
        }
      })
    })

    AudioConfig.Config = newConfig

    return {}
  },
  /**
   * @inheritdoc
   */
  Reorder: function (request: ReorderRequest): ReorderResponse {
    const board = AudioConfig.getBoard(request.boardID)

    if (!board) {
      console.error(`${this.Reorder.name}: board not found with id (${request.boardID})`)
      return {}
    }

    if (!board.categories) {
      console.error(`${this.Reorder.name}: board doesnt have categories (${request.boardID})`)
      return {}
    }

    if (request.newOrder.length !== board.categories.length) {
      console.error(
        `${this.Reorder.name}: board doesnt have same number of categories (${request.boardID})`
      )
      return {}
    }

    const newConfig = produce(AudioConfig.Config, (draft) => {
      const matchingBoard = draft.boards.find((b) => b.id === request.boardID)
      const catMap = new Map(board.categories!.map((c) => [c.id, c]))

      const newOrder = request.newOrder.map((c) => catMap.get(c)) as SoundCategory[]

      matchingBoard!.categories = newOrder
    })

    AudioConfig.Config = newConfig

    return {}
  },
  /**
   * @inheritdoc
   */
  GetCategorizedGroups: function (
    request: GetCategorizedGroupsRequest
  ): GetCategorizedGroupsResponse {
    const { categoryID } = request

    const matchingBoard = BoardsAudioAPI.GetAll({}).boards.find((b) =>
      (b.categories ?? []).some((c) => c.id === categoryID)
    )

    if (!matchingBoard) {
      return {
        groups: []
      }
    }

    const categoryGroups = matchingBoard.groups.filter((g) => g.category === categoryID)

    return {
      groups: categoryGroups
    }
  },
  /**
   * @inheritdoc
   */
  GetUncategorizedGroups: function (
    request: GetUncategorizedGroupsRequest
  ): GetUncategorizedGroupsResponse {
    const { boardID } = request

    const matchingBoard = AudioConfig.getBoard(boardID)
    if (!matchingBoard) {
      return {
        groups: []
      }
    }

    const uncategorizedGroups = matchingBoard?.groups.filter((g) => g.category === undefined)

    return {
      groups: uncategorizedGroups
    }
  },
  Get(request) {
    const { categoryID } = request

    const matchingCategory = AudioConfig.getCategory(categoryID)
    return {
      category: matchingCategory ?? null
    }
  }
}
