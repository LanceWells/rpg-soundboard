import { IAudioApi } from 'src/apis/audio/interface'
import { CategoryID } from 'src/apis/audio/types/categories'
import { SoundGroup } from 'src/apis/audio/types/items'
import { StateCreator } from 'zustand'
import { BoardSlice } from './boardSlice'

export interface CategorySlice {
  addCategory: IAudioApi['Categories']['Create']
  deleteCategory: IAudioApi['Categories']['Delete']
  updateCategory: IAudioApi['Categories']['Update']
  getGroupsForCategory: (categoryID: CategoryID) => SoundGroup[]
  getUncategorizedGroups: IAudioApi['Categories']['GetUncategorizedGroups']
  reorderCategories: IAudioApi['Categories']['Reorder']
  getCategory: IAudioApi['Categories']['Get']
}

export const createCategorySlice: StateCreator<
  CategorySlice & BoardSlice,
  [],
  [],
  CategorySlice
> = (set) => ({
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

    const soundGroups = groups.groups as SoundGroup[]

    return soundGroups
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
  }
})
