import { GroupID } from 'src/apis/audio/types/groups'
import { StateCreator } from 'zustand'

export interface EditingSlice {
  groupBeingDeletedID: GroupID | null
  setGroupBeingDeletedID: (id: GroupID) => void
}

export const createEditingSlice: StateCreator<EditingSlice, [], []> = (set) => ({
  groupBeingDeletedID: null,
  setGroupBeingDeletedID(id) {
    set({
      groupBeingDeletedID: id
    })
  }
})
