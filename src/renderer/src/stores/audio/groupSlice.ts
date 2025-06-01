import { IAudioApi } from 'src/apis/audio/interface'
import { BoardID } from 'src/apis/audio/types/boards'
import { GroupID } from 'src/apis/audio/types/groups'
import {
  SoundGroupSequence,
  SoundGroupSource,
  SoundGroupSourceEditableFields
} from 'src/apis/audio/types/items'
import { StateCreator } from 'zustand'
import { BoardSlice } from './boardSlice'
import { produce } from 'immer'
import { ColorOptions } from '@renderer/components/icon/colorPicker'
import { CategoryID } from 'src/apis/audio/types/categories'
import { EditingSlice } from './editingSlice'

export interface GroupSlice {
  /**
   * The set of IDs for groups that are actively playing a sound effect.
   */
  playingGroups: GroupID[]

  getGroup: (groupID: GroupID) => SoundGroupSource | SoundGroupSequence
  addGroup: IAudioApi['Groups']['Create']
  addSequence: IAudioApi['Groups']['CreateSequence']
  updateGroup: IAudioApi['Groups']['Update']
  updateGroupPartial: (
    boardID: BoardID,
    groupID: GroupID,
    updatedFields: Partial<SoundGroupSourceEditableFields>
  ) => void
  moveGroup: (groupID: GroupID, newBoardID: BoardID) => void
  deleteGroup: (id: GroupID) => void
}

export const createGroupSlice: StateCreator<
  GroupSlice & BoardSlice & EditingSlice,
  [],
  [],
  GroupSlice
> = (set, get) => ({
  addGroup(req) {
    const activeBoardID = get().activeBoardID
    const activeBoard = get().boards.find((b) => b.id === activeBoardID) ?? null
    const newGroup = window.audio.Groups.Create(req)
    const newBoards = window.audio.Boards.GetAll({}).boards

    if (activeBoard === null) {
      return newGroup
    }

    set({
      boards: newBoards,
      editingGroup: getDefaultGroup(activeBoard.categories[0].id)
    })

    return newGroup
  },
  addSequence(req) {
    const activeBoardID = get().activeBoardID
    const activeBoard = get().boards.find((b) => b.id === activeBoardID) ?? null
    const newGroup = window.audio.Groups.CreateSequence(req)
    const newBoards = window.audio.Boards.GetAll({}).boards

    if (activeBoard === null) {
      return newGroup
    }

    set({
      boards: newBoards
    })

    get().resetEditingSequence()

    return newGroup
  },
  deleteGroup(id) {
    const activeBoardID = get().activeBoardID
    const activeBoard = get().boards.find((b) => b.id === activeBoardID) ?? null
    window.audio.Groups.Delete({
      groupID: id
    })

    const newBoards = window.audio.Boards.GetAll({}).boards
    if (activeBoard === null) {
      return
    }

    set({
      boards: newBoards,
      editingGroup: getDefaultGroup(activeBoard.categories[0].id)
    })
  },
  getGroup(request) {
    const group = window.audio.Groups.Get({ groupID: request }).group
    if (!group) {
      throw new Error(`Could not find a group with id ${request}`)
    }

    return group
  },
  moveGroup(groupID, newBoardID) {
    const activeBoardID = get().activeBoardID
    const activeBoard = get().boards.find((b) => b.id === activeBoardID) ?? null
    const { group } = window.audio.Groups.Get({ groupID })

    if (activeBoard === null) {
      return
    }

    if (group === undefined) {
      return
    }

    window.audio.Groups.Move({ groupID, boardID: newBoardID })

    const newBoards = window.audio.Boards.GetAll({}).boards

    set({
      boards: newBoards,
      editingGroup: getDefaultGroup(activeBoard.categories[0].id),
      editingGroupID: undefined
    })
  },
  updateGroup(req) {
    const activeBoardID = get().activeBoardID
    const activeBoard = get().boards.find((b) => b.id === activeBoardID) ?? null
    const updatedGroup = window.audio.Groups.Update(req)
    const newBoards = window.audio.Boards.GetAll({}).boards

    if (activeBoard === null) {
      return updatedGroup
    }

    set({
      boards: newBoards,
      editingGroup: getDefaultGroup(activeBoard.categories[0].id)
    })

    return updatedGroup
  },
  updateGroupPartial(boardID, groupID, updatedFields) {
    const activeBoardID = get().activeBoardID
    const activeBoard = get().boards.find((b) => b.id === activeBoardID) ?? null
    const currentGroup = window.audio.Groups.Get({
      groupID
    }).group

    if (!currentGroup) {
      return
    }

    const newGroup = produce(currentGroup, (draft) => {
      Object.assign(draft, updatedFields)
    }) as SoundGroupSource

    window.audio.Groups.Update({
      boardID,
      groupID,
      ...newGroup
    })

    const newBoards = window.audio.Boards.GetAll({}).boards

    if (activeBoard === null) {
      return
    }

    set({
      boards: newBoards,
      editingGroup: getDefaultGroup(activeBoard.categories[0].id)
    })
  },
  editingGroup: null,
  editingGroupID: undefined,
  playingGroups: []
})

export const getDefaultGroup = (categoryID: CategoryID): SoundGroupSourceEditableFields => ({
  type: 'source',
  effects: [],
  icon: {
    backgroundColor: ColorOptions.black,
    foregroundColor: ColorOptions.white,
    name: 'moon'
  },
  name: '',
  variant: 'Default',
  category: categoryID
})
