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
  playingGroups: GroupID[]
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
  playingGroups: [],
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

    const handleHowlStop = (groupID: GroupID, howl: Howl) => {
      set((state) => {
        const filteredGroups = state.playingGroups.filter((g) => g !== groupID)
        howl.off()
        return {
          playingGroups: filteredGroups
        }
      })
    }

    const howl = new Howl({
      src: audio.soundB64,
      volume: 1.0,
      format: audio.format.replace('.', ''),
      autoplay: true
    })

    howl
      .once('end', () => {
        // howl.off()
        handleHowlStop(groupID, howl)
      })
      .once('loaderror', (id, err) => {
        console.error(`Failed to load sound ${id}: ${err}`)
        handleHowlStop(groupID, howl)
        // howl.off()
      })
      .once('playerror', (id, err) => {
        console.error(`Failed to play sound ${id}: ${err}`)
        handleHowlStop(groupID, howl)
        // howl.off()
      })

    set((state) => ({
      playingGroups: [...state.playingGroups, groupID]
    }))

    howl.play()

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
