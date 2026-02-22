import { GroupID } from 'src/apis/audio/types/groups'
import { StateCreator } from 'zustand'

export interface EditingSliceV3 {
  groupBeingDeletedID: GroupID | null
  setGroupBeingDeletedID: (id: GroupID) => void
}

export const createEditingSliceV3: StateCreator<EditingSliceV3, [], []> = (set) => ({
  groupBeingDeletedID: null,
  setGroupBeingDeletedID(id) {
    set({
      groupBeingDeletedID: id
    })
  }
})
