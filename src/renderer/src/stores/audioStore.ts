import {
  BoardID,
  GroupID,
  IAudioApi,
  NewEffectData,
  SoundBoard,
  SoundIcon
} from 'src/apis/audio/interface'
import { create } from 'zustand'
import { ColorOptions } from '@renderer/components/modals/newEffectModal/colorPicker'
import { SoundContainer } from '@renderer/utils/soundContainer'

export type AudioStore = {
  selectedIcon: SoundIcon
  editingGroupID: GroupID | undefined
  editingMode: boolean
  groupName: string
  workingFileList: NewEffectData[]
  playingGroups: GroupID[]
  boards: SoundBoard[]
  boardBeingAddedToId: BoardID | undefined
  setEditingMode: (isEditing: boolean) => void
  addWorkingFile: (list: NewEffectData) => void
  resetWorkingFiles: (list?: NewEffectData[]) => void
  removeWorkingFile: (index: number) => void
  updateWorkingFile: (index: number, volume: number) => void
  setEditingGroupID: (id: GroupID) => void
  setGroupName: (name: string | undefined) => void
  setSelectedIcon: (icon: SoundIcon) => void
  setBoardBeingAddedTo: (id: BoardID) => void
  playGroup: (groupID: GroupID) => void
  updateGroup: IAudioApi['UpdateGroup']
  addGroup: IAudioApi['CreateGroup']
  addBoard: IAudioApi['CreateBoard']
}

export const useAudioStore = create<AudioStore>((set) => ({
  selectedIcon: {
    backgroundColor: ColorOptions.black,
    foregroundColor: ColorOptions.white,
    name: 'moon'
  },
  editingMode: false,
  boards: window.audio.GetAllBoards({}).boards,
  playingGroups: [],
  boardBeingAddedToId: undefined,
  workingFileList: [],
  groupName: '',
  editingGroupID: undefined,
  setEditingMode(isEditing) {
    set({
      editingMode: isEditing
    })
  },
  addWorkingFile(newItem) {
    set((state) => ({
      workingFileList: [...state.workingFileList, newItem]
    }))
  },
  removeWorkingFile(index) {
    set((state) => {
      const newList = new Array(...state.workingFileList)
      newList.splice(index, 1)
      return {
        workingFileList: newList
      }
    })
  },
  updateWorkingFile(index, volume) {
    set((state) => {
      const newList = new Array(...state.workingFileList)
      if (newList.at(index)) {
        newList.at(index)!.volume = volume
      }

      return {
        workingFileList: newList
      }
    })
  },
  setEditingGroupID(id) {
    set({
      editingGroupID: id
    })
  },
  setSelectedIcon(icon) {
    set({
      selectedIcon: icon
    })
  },
  setBoardBeingAddedTo: (id) => {
    set({
      boardBeingAddedToId: id
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

    set((state) => ({
      playingGroups: [...state.playingGroups, groupID]
    }))

    sound.Play()

    return audio
  },
  resetWorkingFiles(list) {
    set({
      workingFileList: list ?? []
    })
  },
  setGroupName(name) {
    set({
      groupName: name
    })
  },
  updateGroup(req) {
    const updatedGroup = window.audio.UpdateGroup(req)
    const newBoards = window.audio.GetAllBoards({}).boards
    set({
      boards: newBoards,
      workingFileList: []
    })

    return updatedGroup
  },
  addGroup: (req) => {
    const newGroup = window.audio.CreateGroup(req)
    const newBoards = window.audio.GetAllBoards({}).boards
    set({
      boards: newBoards,
      workingFileList: []
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
