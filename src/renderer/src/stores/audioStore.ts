import {
  BoardID,
  GroupID,
  IAudioApi,
  SoundEffectEditableFields,
  SoundBoard,
  SoundGroupEditableFields,
  SoundIcon
} from 'src/apis/audio/interface'
import { create } from 'zustand'
import { ColorOptions } from '@renderer/components/modals/newEffectModal/colorPicker'
import { SoundContainer } from '@renderer/utils/soundContainer'
import { produce } from 'immer'

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
  editingGroup: SoundGroupEditableFields
}

export type AudioStoreGroupMethods = {
  addGroup: IAudioApi['CreateGroup']
  updateGroup: IAudioApi['UpdateGroup']
  deleteGroup: (id: GroupID) => void
}

export type AudioStoreBoardMethods = {
  addBoard: IAudioApi['CreateBoard']
  reorderGroups: IAudioApi['ReorderGroups']
  updateBoard: IAudioApi['UpdateBoard']
  deleteBoard: (id: BoardID) => void
}

export type AudioStoreSoundMethods = {
  playGroup: (groupID: GroupID) => void
  stopGroup: (groupID: GroupID) => void
}

export type AudioStoreEditingModeMethods = {
  resetEditingGroup: () => void
  setEditingMode: (isEditing: EditingMode) => void
  setEditingGroupID: (id: GroupID) => void
  addWorkingFiles: (list: SoundEffectEditableFields | SoundEffectEditableFields[]) => void
  resetWorkingFiles: (list?: SoundEffectEditableFields[]) => void
  removeWorkingFile: (index: number) => void
  updateWorkingFile: (index: number, volume: number) => void
  setEditingBoardID: (id: BoardID) => void
  setGroupName: (name: string | undefined) => void
  setGroupRepeating: (shouldRepeat: boolean) => void
  setFadeIn: (fade: boolean) => void
  setFadeOut: (fade: boolean) => void
  setSelectedIcon: (icon: SoundIcon) => void
}

export type AudioStore = AudioState &
  AudioStoreGroupMethods &
  AudioStoreBoardMethods &
  AudioStoreSoundMethods &
  AudioStoreEditingModeMethods

export const GroupStopHandles: Map<GroupID, () => void> = new Map()

const getDefaultGroup = (): SoundGroupEditableFields => ({
  effects: [],
  icon: {
    backgroundColor: ColorOptions.black,
    foregroundColor: ColorOptions.white,
    name: 'moon'
  },
  name: '',
  repeats: false,
  fadeIn: false,
  fadeOut: false
})

export const useAudioStore = create<AudioStore>((set) => ({
  editingGroup: getDefaultGroup(),
  editingMode: 'Off',
  boards: window.audio.GetAllBoards({}).boards,
  playingGroups: [],
  editingBoardID: undefined,
  editingGroupID: undefined,
  setEditingMode(isEditing) {
    set({
      editingMode: isEditing
    })
  },
  addWorkingFiles(newItem) {
    set(
      produce((state: AudioStore) => {
        const newEffects = Array.isArray(newItem) ? newItem : [newItem]
        state.editingGroup.effects.push(...newEffects)
      })
    )
  },
  removeWorkingFile(index) {
    set(
      produce((state: AudioStore) => {
        const newList = new Array(...state.editingGroup.effects)
        newList.splice(index, 1)
        state.editingGroup.effects = newList
      })
    )
  },
  updateWorkingFile(index, volume) {
    set(
      produce((state: AudioStore) => {
        if (state.editingGroup.effects.length > index) {
          state.editingGroup.effects[index].volume = volume
        }
      })
    )
  },
  setEditingGroupID(id) {
    set({
      editingGroupID: id
    })
  },
  setSelectedIcon(icon) {
    set(
      produce((state: AudioStore) => {
        state.editingGroup.icon = icon
      })
    )
  },
  setEditingBoardID: (id) => {
    set({
      editingBoardID: id
    })
  },
  async playGroup(groupID) {
    const audio = await window.audio.GetGroupSound({
      groupID: groupID
    })

    const handleHowlStop = (groupID: GroupID) => {
      set((state) => {
        const filteredGroups = state.playingGroups.filter((g) => g !== groupID)
        return {
          playingGroups: filteredGroups
        }
      })
      GroupStopHandles.delete(groupID)
    }

    const sound = new SoundContainer({
      format: audio.format,
      stopHandler: {
        id: groupID,
        handler: handleHowlStop
      },
      src: audio.soundB64,
      volume: audio.volume,
      repeats: audio.repeats,
      fadeIn: audio.fadeIn,
      fadeOut: audio.fadeOut
    })

    GroupStopHandles.set(groupID, sound.GetStopHandle())

    set((state) => ({
      playingGroups: [...state.playingGroups, groupID]
    }))

    sound.Play()

    return audio
  },
  async stopGroup(groupID) {
    if (GroupStopHandles.has(groupID)) {
      GroupStopHandles.get(groupID)!()
    }
  },
  resetWorkingFiles(list) {
    set(
      produce((state: AudioStore) => {
        state.editingGroup.effects = list ?? []
      })
    )
  },
  setGroupName(name) {
    set(
      produce((state: AudioStore) => {
        state.editingGroup.name = name ?? ''
      })
    )
  },
  setGroupRepeating(shouldRepeat) {
    set(
      produce((state: AudioStore) => {
        state.editingGroup.repeats = shouldRepeat
      })
    )
  },
  setFadeIn(fade) {
    set(
      produce((state: AudioStore) => {
        state.editingGroup.fadeIn = fade
      })
    )
  },
  setFadeOut(fade) {
    set(
      produce((state: AudioStore) => {
        state.editingGroup.fadeOut = fade
      })
    )
  },
  resetEditingGroup() {
    set({
      editingGroup: getDefaultGroup()
    })
  },
  updateGroup(req) {
    const updatedGroup = window.audio.UpdateGroup(req)
    const newBoards = window.audio.GetAllBoards({}).boards

    set({
      boards: newBoards,
      editingGroup: getDefaultGroup()
    })

    return updatedGroup
  },
  deleteGroup(id) {
    window.audio.DeleteGroup({
      groupID: id
    })

    const newBoards = window.audio.GetAllBoards({}).boards
    set({
      boards: newBoards,
      editingGroup: getDefaultGroup()
    })
  },
  deleteBoard(id) {
    window.audio.DeleteBoard({
      boardID: id
    })

    const newBoards = window.audio.GetAllBoards({}).boards
    set({
      boards: newBoards
    })
  },
  addGroup: (req) => {
    const newGroup = window.audio.CreateGroup(req)
    const newBoards = window.audio.GetAllBoards({}).boards

    set({
      boards: newBoards,
      editingGroup: getDefaultGroup()
    })

    return newGroup
  },
  addBoard(req) {
    const newBoard = window.audio.CreateBoard(req)
    const newBoards = window.audio.GetAllBoards({}).boards

    set({
      boards: newBoards
    })

    return newBoard
  },
  updateBoard(request) {
    const updatedBoard = window.audio.UpdateBoard(request)
    const newBoards = window.audio.GetAllBoards({}).boards

    set({
      boards: newBoards
    })

    return updatedBoard
  },
  reorderGroups(request) {
    window.audio.ReorderGroups(request)
    const newBoards = window.audio.GetAllBoards({}).boards

    set({
      boards: newBoards
    })

    return {}
  }
}))
