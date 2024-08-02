import { BoardID, GroupID, IAudioApi, SoundBoard, SoundIcon } from 'src/apis/audio/interface'
import { create } from 'zustand'
import { Howl } from 'howler'

export type AudioStore = {
  selectedIcon: SoundIcon
  boards: SoundBoard[]
  boardBeingAddedToId: BoardID | undefined
  setSelectedIcon: (icon: SoundIcon) => void
  setBoardBeingAddedTo: (id: BoardID) => void
  playGroup: IAudioApi['PlayGroup']
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
  async playGroup(req) {
    const audio = await window.audio.PlayGroup({ groupID: req.groupID })
    // const sound = new Audio(audio.soundB64)
    // sound.crossOrigin = 'anonymous'
    // sound.addEventListener('canplaythrough', async () => {
    //   await sound.play()
    // })

    // await sound.play()

    // const group = window.audio.GetGroup({ groupID })
    // if (!group.group || group.group.effects.length === 0) {
    //   return {}
    // }

    // const effects = group.group.effects

    // const effectIndex = effects.length > 1 ? getRandomInt(0, effects.length - 1) : 0
    // const effect = effects[effectIndex]

    // const audio = new Audio(effect.path)
    // audio.play()

    new Howl({
      src: [audio.soundB64],
      volume: 1.0,
      html5: true,
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

    // const id = howl.play()

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
