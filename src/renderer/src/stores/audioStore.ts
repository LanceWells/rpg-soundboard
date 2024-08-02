import { BoardID, IAudioApi, SoundBoard } from 'src/apis/audio/interface'
import { create } from 'zustand'

export type AudioStore = {
  iconSearch: string
  boards: SoundBoard[]
  boardBeingAddedToId: BoardID | undefined
  setIconSearch: (search: string) => void
  setBoardBeingAddedTo: (id: BoardID) => void
  addGroup: IAudioApi['CreateGroup']
  addBoard: IAudioApi['CreateBoard']
}

export const useAudioStore = create<AudioStore>((set) => ({
  iconSearch: '',
  boards: window.audio.GetAllBoards({}).boards,
  boardBeingAddedToId: undefined,
  setIconSearch(search) {
    set({
      iconSearch: search
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
