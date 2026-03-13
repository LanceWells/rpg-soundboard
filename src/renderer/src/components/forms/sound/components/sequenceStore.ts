import { produce } from 'immer'
import { SequenceElementID } from 'src/apis/audio/types/items'
import { create } from 'zustand/react'

export type SequenceStoreState = {
  playingElements: Record<SequenceElementID, boolean>
}

export type SequenceStoreActions = {
  reset: () => void
  setPlaying: (id: SequenceElementID, playing: boolean) => void
  isPlaying: (id: SequenceElementID) => boolean
}

export const useSequenceStore = create<SequenceStoreState & SequenceStoreActions>((set, get) => ({
  playingElements: {},
  reset() {
    set({
      playingElements: {}
    })
  },
  setPlaying(id, playing) {
    const updatedPlayingElements = produce(get().playingElements, (draft) => {
      draft[id] = playing
    })

    set({
      playingElements: updatedPlayingElements
    })
  },
  isPlaying(id) {
    const playingGroups = get().playingElements
    return id in playingGroups && playingGroups[id] === true
  }
}))
