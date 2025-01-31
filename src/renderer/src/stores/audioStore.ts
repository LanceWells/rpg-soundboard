import { create } from 'zustand'
import { ColorOptions } from '@renderer/components/modals/newEffectModal/colorPicker'
import { SoundContainer } from '@renderer/utils/soundContainer'
import { produce } from 'immer'
import type {
  SoundBoard,
  SoundCategory,
  SoundEffectEditableFields,
  SoundGroupSource,
  SoundGroupSourceEditableFields,
  SoundGroupReference,
  SoundIcon,
  SoundGroup
} from 'src/apis/audio/types/items'
import type { BoardID } from 'src/apis/audio/types/boards'
import { IAudioApi } from 'src/apis/audio/interface'
import type { CategoryID } from 'src/apis/audio/types/categories'
import type { GroupID } from 'src/apis/audio/types/groups'
import type { EffectID } from 'src/apis/audio/types/effects'
import { SoundVariants } from 'src/apis/audio/types/soundVariants'

export type LinkState = Omit<SoundGroupReference, 'category'>[]

export type SoundBoardFields = Pick<SoundBoard, 'name'> & { referenceGroups: SoundGroupReference[] }

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

/**
 * The state for the soundboard application. Does not contain methods.
 */
export type AudioState = {
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
   * The set of IDs for groups that are actively playing a sound effect.
   */
  playingGroups: GroupID[]

  /**
   * The set of boards that should be represented by the view.
   */
  boards: SoundBoard[]

  /**
   * The draft state for the currently-editing group. Should be set to the value of a group that is
   * either being edited, or a new group that is being created.
   */
  editingGroup: SoundGroupSourceEditableFields | null

  editingBoard: SoundBoardFields | null

  draggingID: string | null

  activeBoardID: BoardID | null
}

export type AudioStoreGroupMethods = {
  getGroup: (groupID: GroupID) => SoundGroupSource
  addGroup: IAudioApi['Groups']['Create']
  updateGroup: IAudioApi['Groups']['Update']
  updateGroupPartial: (
    boardID: BoardID,
    groupID: GroupID,
    updatedFields: Partial<SoundGroupSourceEditableFields>
  ) => void
  moveGroup: (groupID: GroupID, newBoardID: BoardID) => void
  deleteGroup: (id: GroupID) => void
}

export type AudioStoreBoardMethods = {
  addBoard: IAudioApi['Boards']['Create']
  reorderGroups: IAudioApi['Groups']['Reorder']
  updateBoard: IAudioApi['Boards']['Update']
  deleteBoard: (id: BoardID) => void
  setActiveBoardID: (id: BoardID) => void
}

export type AudioStoreSoundMethods = {
  playGroup: (groupID: GroupID) => void
  stopGroup: (groupID: GroupID) => void
}

export type AudioStoreEditingModeMethods = {
  resetEditingGroup: () => void
  resetEditingBoard: () => void
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
  setBoardName: (name: string | undefined) => void
  addBoardReference: (sourceBoard: BoardID, sourceGroup: GroupID) => void
  removeBoardReference: (sourceBoard: BoardID, sourceGroup: GroupID) => void
}

export type AudioStoreCategoryMethods = {
  addCategory: IAudioApi['Categories']['Create']
  deleteCategory: IAudioApi['Categories']['Delete']
  updateCategory: IAudioApi['Categories']['Update']
  getGroupsForCategory: (categoryID: CategoryID) => SoundGroupSource[]
  getUncategorizedGroups: IAudioApi['Categories']['GetUncategorizedGroups']
  reorderCategories: IAudioApi['Categories']['Reorder']
  getCategory: IAudioApi['Categories']['Get']
}

export type AudioStore = AudioState &
  AudioStoreGroupMethods &
  AudioStoreBoardMethods &
  AudioStoreSoundMethods &
  AudioStoreEditingModeMethods &
  AudioStoreCategoryMethods

const GroupStopHandles: Map<GroupID, Array<() => void>> = new Map()

const RepeatSoundIDs: Map<GroupID, EffectID> = new Map()

const getDefaultGroup = (categoryID: CategoryID): SoundGroupSourceEditableFields => ({
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

const getDefaultBoard = (): SoundBoardFields => ({
  name: '',
  referenceGroups: []
})

export const useAudioStore = create<AudioStore>((set, get) => ({
  editingBoard: null,
  editingGroup: null,
  editingMode: 'Off',
  boards: window.audio.Boards.GetAll({}).boards,
  playingGroups: [],
  editingBoardID: undefined,
  editingGroupID: undefined,
  editingCategory: undefined,
  draggingID: null,
  activeBoardID: window.audio.Boards.GetAll({}).boards[0].id ?? null,
  setActiveBoardID(id) {
    set({
      activeBoardID: window.audio.Boards.Get({ boardID: id }).board?.id ?? null
    })
  },
  setDraggingID(id) {
    set({
      draggingID: id
    })
  },
  setEditingMode(isEditing) {
    set({
      editingMode: isEditing
    })
  },
  addWorkingFiles(newItem) {
    set(
      produce((state: AudioStore) => {
        const newEffects = Array.isArray(newItem) ? newItem : [newItem]
        if (state.editingGroup) {
          state.editingGroup.effects.push(...newEffects)
        }
      })
    )
  },
  removeWorkingFile(index) {
    set(
      produce((state: AudioStore) => {
        if (state.editingGroup === null) {
          return
        }
        const newList = new Array(...state.editingGroup.effects)
        newList.splice(index, 1)
        state.editingGroup.effects = newList
      })
    )
  },
  updateWorkingFile(index, volume) {
    set(
      produce((state: AudioStore) => {
        if (state.editingGroup !== null && state.editingGroup.effects.length > index) {
          state.editingGroup.effects[index].volume = volume
        }
      })
    )
  },
  getGroup(request) {
    const group = window.audio.Groups.Get({ groupID: request }).group
    if (!group) {
      throw new Error(`Could not find a group with id ${request}`)
    }

    return group
  },
  setEditingGroupID(id) {
    set({
      editingGroupID: id
    })
  },
  setSelectedIcon(icon) {
    set(
      produce((state: AudioStore) => {
        if (state.editingGroup !== null) {
          state.editingGroup.icon = icon
        }
      })
    )
  },
  setEditingBoardID: (id) => {
    set({
      editingBoardID: id
    })
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
  async playGroup(groupID) {
    let soundsToAvoid: EffectID[] = []

    // If this is a repeat sound effect, then avoid playing the same sound that we last played.
    if (RepeatSoundIDs.has(groupID)) {
      soundsToAvoid = [RepeatSoundIDs.get(groupID)!]
    }

    const audio = await window.audio.Groups.GetSound({
      groupID: groupID,
      idsToSkip: soundsToAvoid
    })

    RepeatSoundIDs.set(groupID, audio.effectID)

    if (audio.variant === 'Soundtrack') {
      // If this is a soundtrack, and we already have one playing, then fade out the old soundtrack
      // and fade in the new soundtrack.
      get()
        .playingGroups.map((g) => get().getGroup(g))
        .filter((g) => g?.variant === 'Soundtrack')
        .forEach((g) => get().stopGroup(g?.id as GroupID))
    }

    const handleHowlStop = (groupID: GroupID) => {
      if (GroupStopHandles.has(groupID)) {
        const handles = GroupStopHandles.get(groupID)!

        if (handles.length > 1) {
          handles.splice(0, 1)
        } else {
          GroupStopHandles.delete(groupID)
        }
      }

      set(() => {
        const newGroups = [...GroupStopHandles.keys()]
        return {
          playingGroups: newGroups
        }
      })
    }

    const sound = new SoundContainer({
      format: audio.format,
      stopHandler: {
        id: groupID,
        handler: handleHowlStop
      },
      src: audio.soundB64,
      volume: audio.volume,
      variant: audio.variant,
      useHtml5: audio.useHtml5
    })

    if (!GroupStopHandles.has(groupID)) {
      GroupStopHandles.set(groupID, [])
    }

    GroupStopHandles.get(groupID)?.push(sound.GetStopHandle())

    set((state) => {
      return {
        playingGroups: [...state.playingGroups, groupID]
      }
    })

    sound.Play()

    return audio
  },
  async stopGroup(groupID) {
    if (GroupStopHandles.has(groupID)) {
      GroupStopHandles.get(groupID)?.forEach((handle) => handle())
    }
  },
  resetWorkingFiles(list) {
    set(
      produce((state: AudioStore) => {
        if (state.editingGroup !== null) {
          state.editingGroup.effects = list ?? []
        }
      })
    )
  },
  setGroupName(name) {
    set(
      produce((state: AudioStore) => {
        if (state.editingGroup) {
          state.editingGroup.name = name ?? ''
        }
      })
    )
  },

  setGroupVariant(variant) {
    set(
      produce((state: AudioStore) => {
        if (state.editingGroup) {
          state.editingGroup.variant = variant
        }
      })
    )
  },
  setGroupCategory(categoryID) {
    set(
      produce((state: AudioStore) => {
        if (state.editingGroup) {
          state.editingGroup.category = categoryID
        }
      })
    )
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
  resetEditingBoard() {
    set({
      editingBoard: getDefaultBoard()
    })
    return
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
  setBoardName(name) {
    set(
      produce((state: AudioStore) => {
        if (state.editingBoard) {
          state.editingBoard.name = name ?? ''
        }
      })
    )
  },
  deleteBoard(id) {
    window.audio.Boards.Delete({
      boardID: id
    })

    const newBoards = window.audio.Boards.GetAll({}).boards
    set({
      boards: newBoards
    })
  },
  addGroup: (req) => {
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
  addBoard(req) {
    const newBoard = window.audio.Boards.Create(req)
    const newBoards = window.audio.Boards.GetAll({}).boards

    set({
      boards: newBoards
    })

    return newBoard
  },
  updateBoard(request) {
    const updatedBoard = window.audio.Boards.Update(request)
    const newBoards = window.audio.Boards.GetAll({}).boards

    set({
      boards: newBoards
    })

    return updatedBoard
  },
  reorderGroups(request) {
    window.audio.Groups.Reorder(request)
    const newBoards = window.audio.Boards.GetAll({}).boards

    set({
      boards: newBoards
    })

    return {}
  },
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
  updateCategory(request) {
    const resp = window.audio.Categories.Update(request)
    const newBoards = window.audio.Boards.GetAll({}).boards

    set({
      boards: newBoards
    })

    return resp
  },
  getGroupsForCategory(categoryID) {
    const groups = window.audio.Categories.GetCategorizedGroups({
      categoryID
    })

    const soundGroups = groups.groups as SoundGroup[]
    const outGroups = soundGroups.map<SoundGroupSource>((g) => {
      if (g.type === 'source') {
        return g
      }

      const source = window.audio.Groups.Get({
        groupID: g.id
      })
      return source.group as SoundGroupSource
    })

    return outGroups
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
  getCategory(request) {
    return window.audio.Categories.Get(request)
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
  }
}))
