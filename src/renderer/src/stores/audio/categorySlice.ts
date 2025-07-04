import { IAudioApi } from 'src/apis/audio/interface'
import { CategoryID } from 'src/apis/audio/types/categories'
import { StateCreator } from 'zustand'
import { BoardSlice } from './boardSlice'
import { ISoundGroup, SoundCategory } from 'src/apis/audio/types/items'

export interface CategorySlice {
  addCategory: IAudioApi['Categories']['Create']
  deleteCategory: IAudioApi['Categories']['Delete']
  updateCategory: IAudioApi['Categories']['Update']
  getGroupsForCategory: (categoryID: CategoryID) => ISoundGroup[]
  getUncategorizedGroups: IAudioApi['Categories']['GetUncategorizedGroups']
  reorderCategories: IAudioApi['Categories']['Reorder']
  getCategory: IAudioApi['Categories']['Get']
  getDefaultCategory: () => SoundCategory
}

export const createCategorySlice: StateCreator<
  CategorySlice & BoardSlice,
  [],
  [],
  CategorySlice
> = (set, get) => ({
  addCategory(request) {
    const resp = window.audio.Categories.Create(request)
    const newBoards = window.audio.Boards.GetAll({}).boards

    set({
      boards: newBoards
    })

    return resp
  },
  deleteCategory(request) {
    const resp = window.audio.Categories.Delete(request)
    const newBoards = window.audio.Boards.GetAll({}).boards

    set({
      boards: newBoards
    })

    return resp
  },
  getCategory(request) {
    return window.audio.Categories.Get(request)
  },
  getGroupsForCategory(categoryID) {
    const groups = window.audio.Categories.GetCategorizedGroups({
      categoryID
    })

    return groups.groups
  },
  getUncategorizedGroups(request) {
    const resp = window.audio.Categories.GetUncategorizedGroups(request)

    return resp
  },
  reorderCategories(request) {
    const resp = window.audio.Categories.Reorder(request)
    const newBoards = window.audio.Boards.GetAll({}).boards

    set({
      boards: newBoards
    })

    return resp
  },
  updateCategory(request) {
    const resp = window.audio.Categories.Update(request)
    const newBoards = window.audio.Boards.GetAll({}).boards

    set({
      boards: newBoards
    })

    return resp
  },
  getDefaultCategory() {
    const activeBoardID = get().activeBoardID
    const activeBoard = get().boards.find((b) => b.id === activeBoardID)

    if (!activeBoard) {
      throw new Error(`WARNING: Could not find a board with ID: ${activeBoardID}`)
    }

    const defaultCategory = activeBoard.categories[0]

    // The category from the board has several of its values' writable states set to false. This is
    // generally only an issue when editing this category as a temp object to use when editing a
    // cateogry. Rather than attempt to edit this object (which has generally lead to errors in that
    // assignment), create a copy of the object and return that copy instead.
    const catCopy = Object.assign({}, defaultCategory)

    return catCopy
  }
})
