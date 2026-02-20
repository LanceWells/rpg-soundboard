import { GroupID } from 'src/apis/audio/types/groups'
import { StateCreator } from 'zustand'

export interface EditingSliceV3 {
  groupBeingEditedID: GroupID | null
  setGroupBeingEditedID: (id: GroupID) => void
}

export const createEditingSliceV3: StateCreator<EditingSliceV3, [], []> = (set) => ({
  groupBeingEditedID: null,
  setGroupBeingEditedID(id) {
    set({
      groupBeingEditedID: id
    })
  }
})
