import { BoardID, GroupID, IAudioApi, SoundBoard, SoundIcon } from 'src/apis/audio/interface'
import { create } from 'zustand'
import { Howl } from 'howler'
import { ColorOptions } from '@renderer/components/modals/newEffectModal/colorPicker'

export type FileSelectListItem = {
  filepath: string
}

export type AudioStore = {
  selectedIcon: SoundIcon
  workingFileList: FileSelectListItem[]
  boards: SoundBoard[]
  boardBeingAddedToId: BoardID | undefined
  addWorkingFile: (list: FileSelectListItem) => void
  removeWorkingFile: (index: number) => void
  setSelectedIcon: (icon: SoundIcon) => void
  setBoardBeingAddedTo: (id: BoardID) => void
  playGroup: (groupID: GroupID) => void
  addGroup: IAudioApi['CreateGroup']
  addBoard: IAudioApi['CreateBoard']
}

export const useAudioStore = create<AudioStore>((set) => ({
  selectedIcon: {
    backgroundColor: ColorOptions.black,
    foregroundColor: ColorOptions.white,
    name: 'moon'
  },
  boards: window.audio.GetAllBoards({}).boards,
  boardBeingAddedToId: undefined,
  workingFileList: [],
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
    new Howl({
      src: [audio.soundB64],
      volume: 1.0,
      autoplay: true,
      format: ['ogg'],
      onload: function (id) {
        console.log(`Loaded ${id}`)
      },
      onplay: function (id) {
        console.log(`Played ${id}`)
      },
      onplayerror: function (id) {
        console.log(`Play err ${id}`)
      },
      onloaderror: function (id, err) {
        console.log(`Load err ${id}; ${err}`)
      }
    })

    return audio
  },
  addGroup: (req) => {
    const newGroup = window.audio.CreateGroup(req)
    const newBoards = window.audio.GetAllBoards({}).boards
    set({
      boards: newBoards
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
