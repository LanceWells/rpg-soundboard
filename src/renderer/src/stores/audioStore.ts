import { BoardID, IAudioApi, SoundBoard, SoundIcon } from 'src/apis/audio/interface'
import { create } from 'zustand'

export type AudioStore = {
  selectedIcon: SoundIcon
  boards: SoundBoard[]
  boardBeingAddedToId: BoardID | undefined
  setSelectedIcon: (icon: SoundIcon) => void
  setBoardBeingAddedTo: (id: BoardID) => void
  addGroup: IAudioApi['CreateGroup']
  addBoard: IAudioApi['CreateBoard']
}

export const useAudioStore = create<AudioStore>((set) => ({
  selectedIcon: {
    backgroundColor: 'black',
    foregroundColor: 'white',
    name: 'moon'
  },
  boards: window.audio.GetAllBoards({}).boards,
  boardBeingAddedToId: undefined,
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
