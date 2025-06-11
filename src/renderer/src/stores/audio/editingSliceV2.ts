import { StateCreator } from 'zustand'
import { BoardSlice } from './boardSlice'
import {
  SequenceElementID,
  SoundBoardEditableFields,
  SoundCategory,
  SoundGroupSequence,
  SoundGroupSource,
  SoundGroupSourceEditableFields
} from 'src/apis/audio/types/items'
import { enableMapSet, produce } from 'immer'
import { getDefaultBoard } from './editingSlice'
import { BoardID } from 'src/apis/audio/types/boards'
import { getDefaultGroup, getDefaultSequence } from './groupSlice'
import { CategorySlice } from './categorySlice'
import { GroupID } from 'src/apis/audio/types/groups'
import { IAudioApi } from 'src/apis/audio/interface'

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

export type EditableSoundTypes = SoundGroupSource | SoundGroupSequence

type EditableElement<T> = T extends { id: infer TID }
  ? { element: Omit<T, 'id'> | undefined; id: TID | undefined } | undefined
  : never

export type EditingElements = {
  category: EditableElement<SoundCategory>
  sequence: EditableElement<SoundGroupSequence>
  source:
    | {
        id: GroupID | undefined
        element: SoundGroupSourceEditableFields | undefined
      }
    | undefined
  board:
    | {
        id: BoardID | undefined
        element: SoundBoardEditableFields | undefined
      }
    | undefined
}

export type EditingElementsMethods = {
  [K in keyof EditingElements as `updateEditing${Capitalize<string & K>}V2`]: EditingElements[K] extends
    | { element: infer TEl | undefined; id: infer TId | undefined }
    | undefined
    ? (newValue?: Partial<TEl>, id?: TId | undefined) => void
    : string
}

// export type ResetElementsMethods = {
//   [K in keyof EditingElements as `resetEditing${Capitalize<string & K>}V2`]: () => void
// }

export interface EditingSliceV2 extends EditingElementsMethods {
  /**
   * If true, the view is currently in "editing mode", which implies that button presses should not
   * perform actions, but should rather open an editable node for that element.
   */
  editingMode: EditingMode

  editingElementsV2: EditingElements
  playingSequenceSoundsV2: Set<SequenceElementID>
  draggingID: string | null
  setEditingMode: (isEditing: EditingMode) => void
  setSequenceElementPlayingStatusV2: (id: SequenceElementID, status: boolean) => void
  addBoardReference: (sourceBoard: BoardID, sourceGroup: GroupID) => void
  removeBoardReference: (sourceBoard: BoardID, sourceGroup: GroupID) => void
  updateBoardReference: IAudioApi['Groups']['UpdateLink']
  setDraggingID: (id: string | null) => void
}

enableMapSet()

export const createEditingSliceV2: StateCreator<
  EditingSliceV2 & BoardSlice & CategorySlice,
  [],
  [],
  EditingSliceV2
> = (set, get) => ({
  editingMode: 'Off' as EditingMode,
  editingElementsV2: {
    board: undefined,
    category: undefined,
    sequence: undefined,
    source: undefined
  },
  playingSequenceSoundsV2: new Set(),
  draggingID: null,
  setEditingMode(isEditing) {
    set({
      editingMode: isEditing
    })
  },
  updateEditingBoardV2: (newValue, id) => {
    set(
      produce((state: EditingSliceV2) => {
        if (newValue === undefined) {
          state.editingElementsV2.board = undefined
          return
        }

        if (state.editingElementsV2.board === undefined) {
          state.editingElementsV2.board = {
            element: getDefaultBoard(),
            id: undefined
          }
        }

        Object.assign(state.editingElementsV2.board.element!, newValue)

        if (id !== undefined) {
          state.editingElementsV2.board.id = id
        }
      })
    )
  },
  updateEditingCategoryV2: (newValue, id) => {
    set(
      produce((state: EditingSliceV2) => {
        if (newValue === undefined) {
          state.editingElementsV2.category = undefined
          return
        }

        const defaultCategory = get().getDefaultCategory()

        if (state.editingElementsV2.category === undefined) {
          state.editingElementsV2.category = {
            element: defaultCategory,
            id: undefined
          }
        }

        Object.assign(state.editingElementsV2.category.element!, newValue)
        if (id !== undefined) {
          state.editingElementsV2.category.id = id
        }

        return
      })
    )
  },
  updateEditingSequenceV2: (newValue, id) => {
    set(
      produce((state: EditingSliceV2) => {
        if (newValue === undefined) {
          state.editingElementsV2.sequence = undefined
          return
        }

        const defaultCategory = get().getDefaultCategory()

        if (state.editingElementsV2.sequence === undefined) {
          state.editingElementsV2.sequence = {
            element: getDefaultSequence(defaultCategory.id),
            id: undefined
          }
        }

        Object.assign(state.editingElementsV2.sequence.element!, newValue)
        if (id !== undefined) {
          state.editingElementsV2.sequence.id = id
        }
      })
    )
  },
  updateEditingSourceV2: (newValue, id) => {
    set(
      produce((state: EditingSliceV2) => {
        if (newValue === undefined) {
          state.editingElementsV2.source = undefined
          return
        }

        const defaultCategory = get().getDefaultCategory()

        if (state.editingElementsV2.source === undefined) {
          state.editingElementsV2.source = {
            element: getDefaultGroup(defaultCategory.id),
            id: undefined
          }
        }

        Object.assign(state.editingElementsV2.source.element!, newValue)
        if (id !== undefined) {
          state.editingElementsV2.source.id = id
        }
      })
    )
  },
  setSequenceElementPlayingStatusV2(id, status) {
    set(
      produce((state: EditingSliceV2) => {
        if (status === true) {
          state.playingSequenceSoundsV2.add(id)
        } else {
          state.playingSequenceSoundsV2.delete(id)
        }
      })
    )
  },
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
  updateBoardReference(request) {
    window.audio.Groups.UpdateLink(request)

    const newBoards = window.audio.Boards.GetAll({}).boards

    set({
      boards: newBoards
    })

    return {}
  },
  setDraggingID(id) {
    set({
      draggingID: id
    })
  }
})
