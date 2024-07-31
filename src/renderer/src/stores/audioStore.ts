import { BoardID, CreateGroupRequest, IAudioApi, SoundBoard } from 'src/apis/audio/interface'
import { create } from 'zustand'

export type AudioStore = {
  boards: SoundBoard[]
  addGroup: IAudioApi['CreateGroup']
}

export const useAudioStore = create<AudioStore>((set) => ({
  boards: window.audio.GetAllBoards({}).boards,
  addGroup: (req) => {
    const newGroup = window.audio.CreateGroup(req)
    const newBoards = window.audio.GetAllBoards({}).boards
    set({
      boards: newBoards
    })

    return newGroup
  }
}))
