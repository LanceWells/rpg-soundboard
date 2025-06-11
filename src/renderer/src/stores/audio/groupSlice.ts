import { IAudioApi } from 'src/apis/audio/interface'
import { BoardID } from 'src/apis/audio/types/boards'
import { GroupID } from 'src/apis/audio/types/groups'
import {
  ISoundGroupSource,
  SoundGroupSequence,
  SoundGroupSequenceEditableFields,
  SoundGroupSource,
  SoundGroupSourceEditableFields
} from 'src/apis/audio/types/items'
import { StateCreator } from 'zustand'
import { BoardSlice } from './boardSlice'
import { produce } from 'immer'
import { ColorOptions } from '@renderer/components/icon/colorPicker'
import { CategoryID } from 'src/apis/audio/types/categories'
import { EditingSlice } from './editingSlice'
import { isSequenceGroup, isSourceGroup } from '@renderer/utils/typePredicates'
import { EditingSliceV2 } from './editingSliceV2'

export interface GroupSlice {
  /**
   * The set of IDs for groups that are actively playing a sound effect.
   */
  playingGroups: GroupID[]
  getGroup: (groupID: GroupID) => ISoundGroupSource
  getGroupSource: (groupID: GroupID) => SoundGroupSource
  getGroupSequence: (groupID: GroupID) => SoundGroupSequence
  addGroup: IAudioApi['Groups']['Create']
  addSequence: IAudioApi['Groups']['CreateSequence']
  updateGroup: IAudioApi['Groups']['Update']
  updateGroupPartial: (
    boardID: BoardID,
    groupID: GroupID,
    updatedFields: Partial<SoundGroupSourceEditableFields>
  ) => void
  updateSequencePartial: (
    groupID: GroupID,
    updatedFields: Partial<SoundGroupSequenceEditableFields>
  ) => void
  moveGroup: (groupID: GroupID, newBoardID: BoardID) => void
  deleteGroup: (id: GroupID) => void
}

export const createGroupSlice: StateCreator<
  GroupSlice & BoardSlice & EditingSlice & EditingSliceV2,
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
      boards: newBoards
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

    // get().resetEditingSequence()
    get().updateEditingSequenceV2({})

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
      boards: newBoards
    })
  },
  getGroup(request) {
    const group = window.audio.Groups.Get({ groupID: request }).group
    if (!group) {
      throw new Error(`Could not find a group with id ${request}`)
    }

    return group
  },
  getGroupSequence(request) {
    const group = window.audio.Groups.Get({ groupID: request }).group
    if (!group) {
      throw new Error(`Could not find a group with id ${request}`)
    }

    if (!isSequenceGroup(group)) {
      throw new Error(`Found a group with id ${request}, but it isn't a sequence type`)
    }

    return group
  },
  getGroupSource(request) {
    const group = window.audio.Groups.Get({ groupID: request }).group
    if (!group) {
      throw new Error(`Could not find a group with id ${request}`)
    }

    if (!isSourceGroup(group)) {
      throw new Error(`Found a group with id ${request}, but it isn't a sequence type`)
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
      boards: newBoards
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
      boards: newBoards
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
      boards: newBoards
    })
  },
  updateSequencePartial(groupID, updatedFields) {
    const activeBoardID = get().activeBoardID
    if (!activeBoardID) {
      throw new Error('Cannot update sequence without an active board ID')
    }

    const activeBoard = get().boards.find((b) => b.id === activeBoardID) ?? null
    const currentGroup = window.audio.Groups.Get({
      groupID
    }).group

    if (!currentGroup) {
      return
    }

    const newGroup = produce(currentGroup, (draft) => {
      Object.assign(draft, updatedFields)
    }) as SoundGroupSequence

    window.audio.Groups.UpdateSequence({
      groupID,
      boardID: activeBoardID,
      ...newGroup
    })

    const newBoards = window.audio.Boards.GetAll({}).boards

    if (activeBoard === null) {
      return
    }

    set({
      boards: newBoards
    })
  },
  editingGroup: null,
  editingGroupID: undefined,
  playingGroups: []
})

// export const getDefaultGroup = (categoryID: CategoryID): SoundGroupSourceEditableFields => ({
//   type: 'source',
//   effects: [],
//   icon: {
//     backgroundColor: ColorOptions.black,
//     foregroundColor: ColorOptions.white,
//     name: 'moon'
//   },
//   name: '',
//   variant: 'Default',
//   category: categoryID
// })

export const getDefaultGroup = (categoryID: CategoryID): Omit<SoundGroupSource, 'id'> => ({
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

export const getDefaultSequence = (categoryID: CategoryID): SoundGroupSequenceEditableFields => ({
  type: 'sequence',
  category: categoryID,
  icon: {
    backgroundColor: ColorOptions.black,
    foregroundColor: ColorOptions.white,
    name: 'moon'
  },
  name: '',
  sequence: [],
  variant: 'Sequence'
})
