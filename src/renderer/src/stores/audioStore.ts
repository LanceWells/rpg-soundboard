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

export type AudioState = {
  editingGroupID: GroupID | undefined
  editingMode: boolean
  playingGroups: GroupID[]
  boards: SoundBoard[]
  effectBoardID: BoardID | undefined

  editingGroup: SoundGroupEditableFields
}

export type AudioStoreMethods = {
  addGroup: IAudioApi['CreateGroup']
  updateGroup: IAudioApi['UpdateGroup']
  addBoard: IAudioApi['CreateBoard']
  setEditingMode: (isEditing: boolean) => void

  setEditingGroupID: (id: GroupID) => void

  addWorkingFile: (list: SoundEffectEditableFields) => void
  resetWorkingFiles: (list?: SoundEffectEditableFields[]) => void
  removeWorkingFile: (index: number) => void
  updateWorkingFile: (index: number, volume: number) => void
  setGroupName: (name: string | undefined) => void
  setSelectedIcon: (icon: SoundIcon) => void

  setEffectBoardID: (id: BoardID) => void

  playGroup: (groupID: GroupID) => void
  stopGroup: (groupID: GroupID) => void
}

export type AudioStore = AudioState & AudioStoreMethods

export const GroupStopHandles: Map<GroupID, () => void> = new Map()

const getDefaultGroup = () => ({
  effects: [],
  icon: {
    backgroundColor: ColorOptions.black,
    foregroundColor: ColorOptions.white,
    name: 'moon'
  },
  name: ''
})

export const useAudioStore = create<AudioStore>((set) => ({
  editingGroup: getDefaultGroup(),
  editingMode: false,
  boards: window.audio.GetAllBoards({}).boards,
  playingGroups: [],
  effectBoardID: undefined,
  editingGroupID: undefined,
  setEditingMode(isEditing) {
    set({
      editingMode: isEditing
    })
  },
  addWorkingFile(newItem) {
    set(
      produce((state: AudioStore) => {
        state.editingGroup.effects.push(newItem)
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
  setEffectBoardID: (id) => {
    set({
      effectBoardID: id
    })
  },
  async playGroup(groupID) {
    const audio = await window.audio.PlayGroup({ groupID: groupID, relFile: import.meta.dirname })

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
      volume: audio.volume
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
  updateGroup(req) {
    const updatedGroup = window.audio.UpdateGroup(req)
    const newBoards = window.audio.GetAllBoards({}).boards

    set({
      boards: newBoards,
      editingGroup: getDefaultGroup()
    })

    return updatedGroup
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
  }
}))
