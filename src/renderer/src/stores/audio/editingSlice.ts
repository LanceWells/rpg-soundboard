import { IAudioApi } from 'src/apis/audio/interface'
import { BoardID } from 'src/apis/audio/types/boards'
import { CategoryID } from 'src/apis/audio/types/categories'
import { GroupID } from 'src/apis/audio/types/groups'
import {
  SoundCategory,
  SoundGroupSourceEditableFields,
  SoundEffectEditableFields,
  SoundIcon,
  SoundBoard,
  SoundGroupReference,
  SoundGroupSequenceElement,
  SoundGroupSequenceEditableFields,
  SequenceElementID
} from 'src/apis/audio/types/items'
import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import { StateCreator } from 'zustand'
import { BoardSlice } from './boardSlice'
import { enableMapSet, produce } from 'immer'
import { getDefaultGroup } from './groupSlice'
import { ColorOptions } from '@renderer/components/icon/colorPicker'

export type SoundBoardFields = Pick<SoundBoard, 'name'> & { referenceGroups: SoundGroupReference[] }

enableMapSet()

/**
 * A set of editing modes that the view might exist in.
 */
export const EditingModes = {
  /**
   * The view is not being edited currently.
   */
  Off: 0,

  /**
   * The view is currently in "editing" mode, and element interaction should reflect that.
   */
  Editing: 1,

  /**
   * Some groups are currently being dragged and re-arranged.
   */
  Dragging: 2
}

/**
 * A set of editing modes that the view might exist in.
 */
export type EditingMode = keyof typeof EditingModes

export interface EditingSlice {
  /**
   * A handle for the group that is being actively edited. Should generally only be defined if
   * {@link AudioState.editingMode} is true.
   */
  editingGroupID: GroupID | undefined

  /**
   * A handle for the board that is being actively edited. Should be set either if the board is
   * being edited and {@link AudioState.editingMode} is enabled, or if a new effect is being added
   * to said board.
   */
  editingBoardID: BoardID | undefined

  /**
   * A set of values used to populate an editing section for a given category.
   */
  editingCategory: SoundCategory | undefined

  /**
   * If true, the view is currently in "editing mode", which implies that button presses should not
   * perform actions, but should rather open an editable node for that element.
   */
  editingMode: EditingMode

  /**
   * The draft state for the currently-editing group. Should be set to the value of a group that is
   * either being edited, or a new group that is being created.
   */
  editingGroup: SoundGroupSourceEditableFields | null

  editingBoard: SoundBoardFields | null

  draggingID: string | null
  sequenceDraggingID: GroupID | null

  editingSequence: SoundGroupSequenceEditableFields | null
  playingSequenceSounds: Set<SequenceElementID>

  resetEditingGroup: () => void
  resetEditingBoard: () => void
  resetEditingSequence: () => void
  setEditingMode: (isEditing: EditingMode) => void
  setEditingGroupID: (id: GroupID) => void
  addWorkingFiles: (list: SoundEffectEditableFields | SoundEffectEditableFields[]) => void
  resetWorkingFiles: (list?: SoundEffectEditableFields[]) => void
  removeWorkingFile: (index: number) => void
  updateWorkingFile: (index: number, volume: number) => void
  setEditingBoardID: (id: BoardID) => void
  prepEditingCategory: (boardID: BoardID, categoryID: CategoryID) => void
  setGroupName: (name: string | undefined) => void
  setGroupVariant: (variant: SoundVariants) => void
  setGroupCategory: (categoryID: CategoryID) => void
  setSelectedIcon: (icon: SoundIcon) => void
  setDraggingID: (id: string | null) => void
  setSequenceDraggingID: (id: GroupID | null) => void
  setBoardName: (name: string | undefined) => void
  addBoardReference: (sourceBoard: BoardID, sourceGroup: GroupID) => void
  removeBoardReference: (sourceBoard: BoardID, sourceGroup: GroupID) => void
  updateBoardReference: IAudioApi['Groups']['UpdateLink']
  updateSequenceName: (newName: string) => void
  updateSequenceElements: (newSequence: SoundGroupSequenceElement[]) => void
  markSequenceElementAsPlaying: (id: SequenceElementID) => void
  markSequenceElementAsStopped: (id: SequenceElementID) => void
}

export const createEditingSlice: StateCreator<EditingSlice & BoardSlice, [], [], EditingSlice> = (
  set,
  get
) => ({
  draggingID: null,
  editingBoard: null,
  editingBoardID: undefined,
  editingCategory: undefined,
  editingGroup: null,
  editingGroupID: undefined,
  editingMode: 'Off' as EditingMode,
  editingSequence: null,
  sequenceDraggingID: null,
  playingSequenceSounds: new Set(),
  addBoardReference(sourceBoard, sourceGroup) {
    const activeBoardID = get().activeBoardID
    const activeBoard = get().boards.find((b) => b.id === activeBoardID) ?? null
    if (!activeBoard) {
      return
    }

    window.audio.Groups.LinkGroup({
      destinationBoard: activeBoard.id,
      sourceBoard,
      sourceGroup
    })

    const newBoards = window.audio.Boards.GetAll({}).boards

    set({
      boards: newBoards
    })
  },
  addWorkingFiles(newItem) {
    set(
      produce((state: EditingSlice) => {
        const newEffects = Array.isArray(newItem) ? newItem : [newItem]
        if (state.editingGroup) {
          state.editingGroup.effects.push(...newEffects)
        }
      })
    )
  },
  prepEditingCategory(boardID, categoryID) {
    const board = window.audio.Boards.Get({ boardID }).board
    if (!board || !board.categories) {
      return
    }

    const category = board.categories.find((c) => c.id === categoryID)
    if (!category) {
      return
    }

    const categoryCopy = produce(category, (_draft) => {})

    set({
      editingCategory: categoryCopy
    })
  },
  removeBoardReference(sourceBoard, sourceGroup) {
    const activeBoardID = get().activeBoardID
    const activeBoard = get().boards.find((b) => b.id === activeBoardID) ?? null
    if (!activeBoard) {
      return
    }

    window.audio.Groups.UnlinkGroup({
      sourceBoard,
      sourceGroup,
      destinationBoard: activeBoard.id
    })

    const newBoards = window.audio.Boards.GetAll({}).boards

    set({
      boards: newBoards
    })
  },
  removeWorkingFile(index) {
    set(
      produce((state: EditingSlice) => {
        if (state.editingGroup === null) {
          return
        }
        const newList = new Array(...state.editingGroup.effects)
        newList.splice(index, 1)
        state.editingGroup.effects = newList
      })
    )
  },
  resetEditingBoard() {
    set({
      editingBoard: getDefaultBoard()
    })
    return
  },
  resetEditingGroup() {
    const activeBoardID = get().activeBoardID
    if (activeBoardID === null) {
      return
    }

    const activeBoard = get().boards.find((b) => b.id === activeBoardID)
    if (!activeBoard) {
      return
    }

    set({
      editingGroup: getDefaultGroup(activeBoard.categories[0].id)
    })
  },
  resetWorkingFiles(list) {
    set(
      produce((state: EditingSlice) => {
        if (state.editingGroup !== null) {
          state.editingGroup.effects = list ?? []
        }
      })
    )
  },
  setBoardName(name) {
    set(
      produce((state: EditingSlice) => {
        if (state.editingBoard) {
          state.editingBoard.name = name ?? ''
        }
      })
    )
  },
  setDraggingID(id) {
    set({
      draggingID: id
    })
  },
  setSequenceDraggingID(id) {
    set({
      sequenceDraggingID: id
    })
  },
  setEditingBoardID(id) {
    set({
      editingBoardID: id
    })
  },
  setEditingGroupID(id) {
    set({
      editingGroupID: id
    })
  },
  setEditingMode(isEditing) {
    set({
      editingMode: isEditing
    })
  },
  setGroupCategory(categoryID) {
    set(
      produce((state: EditingSlice) => {
        if (state.editingGroup) {
          state.editingGroup.category = categoryID
        }
      })
    )
  },
  setGroupName(name) {
    set(
      produce((state: EditingSlice) => {
        if (state.editingGroup) {
          state.editingGroup.name = name ?? ''
        }
      })
    )
  },
  setGroupVariant(variant) {
    set(
      produce((state: EditingSlice) => {
        if (state.editingGroup) {
          state.editingGroup.variant = variant
        }
      })
    )
  },
  setSelectedIcon(icon) {
    set(
      // I don't like setting both regular and sequence group icons here, but it should work without
      // being too intrusive.
      produce((state: EditingSlice) => {
        if (state.editingGroup !== null) {
          state.editingGroup.icon = icon
        }
        if (state.editingSequence !== null) {
          state.editingSequence.icon = icon
        }
      })
    )
  },
  updateBoardReference(request) {
    window.audio.Groups.UpdateLink(request)

    const newBoards = window.audio.Boards.GetAll({}).boards

    set({
      boards: newBoards
    })

    return {}
  },
  updateWorkingFile(index, volume) {
    set(
      produce((state: EditingSlice) => {
        if (state.editingGroup !== null && state.editingGroup.effects.length > index) {
          state.editingGroup.effects[index].volume = volume
        }
      })
    )
  },
  resetEditingSequence() {
    const activeBoardID = get().activeBoardID
    const activeBoard = get().boards.find((b) => b.id === activeBoardID) ?? null

    if (activeBoardID == null || activeBoard === null) {
      return
    }

    set(
      produce((state: EditingSlice) => {
        state.editingSequence = {
          boardID: activeBoardID,
          category: activeBoard.categories[0].id,
          name: '',
          sequence: [],
          icon: {
            backgroundColor: ColorOptions.black,
            foregroundColor: ColorOptions.white,
            name: 'moon'
          }
        }
      })
    )
  },
  updateSequenceName(newName) {
    set(
      produce((state: EditingSlice) => {
        if (state.editingSequence) {
          state.editingSequence.name = newName
        }
      })
    )
  },
  updateSequenceElements(newSequence) {
    set(
      produce((state: EditingSlice) => {
        if (state.editingSequence) {
          state.editingSequence.sequence = newSequence
        }
      })
    )
  },
  markSequenceElementAsPlaying(id) {
    set(
      produce((state: EditingSlice) => {
        state.playingSequenceSounds.add(id)
      })
    )
  },
  markSequenceElementAsStopped(id) {
    set(
      produce((state: EditingSlice) => {
        state.playingSequenceSounds.delete(id)
      })
    )
  }
})

export const getDefaultBoard = (): SoundBoardFields => ({
  name: '',
  referenceGroups: []
})
