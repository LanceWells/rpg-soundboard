import { produce } from 'immer'
import {
  Categories,
  CategoryID,
  CreateCategoryRequest,
  CreateCategoryResponse,
  DeleteCategoryRequest,
  DeleteCategoryResponse,
  GetGroupsForCategoryRequest,
  GetGroupsForCategoryResponse,
  GetUncategorizedGroupsRequest,
  GetUncategorizedGroupsResponse,
  ReorderCategoriesRequest,
  ReorderCategoriesResponse,
  SoundCategory,
  UpdateCategoryRequest,
  UpdateCategoryResponse
} from '../interface'
import { AudioConfig } from '../utils/config'
import { BoardsAudioAPI } from './boards'

export const CategoriesAudioAPI: Categories = {
  Create: function (request: CreateCategoryRequest): CreateCategoryResponse {
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
  Update: function (request: UpdateCategoryRequest): UpdateCategoryResponse {
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
  Delete: function (request: DeleteCategoryRequest): DeleteCategoryResponse {
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
  Reorder: function (request: ReorderCategoriesRequest): ReorderCategoriesResponse {
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
  GetCategorizedGroups: function (
    request: GetGroupsForCategoryRequest
  ): GetGroupsForCategoryResponse {
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
  }
}
