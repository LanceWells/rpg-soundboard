import { GroupID } from 'src/apis/audio/types/groups'
import { StateCreator } from 'zustand'

/**
 * Zustand slice that tracks UI editing state, such as which group is pending deletion.
 */
export interface EditingSlice {
  groupBeingDeletedID: GroupID | null
  setGroupBeingDeletedID: (id: GroupID) => void
}

/**
 * Factory function that creates the editing UI slice for the Zustand store.
 */
export const createEditingSlice: StateCreator<EditingSlice, [], []> = (set) => ({
  groupBeingDeletedID: null,
  setGroupBeingDeletedID(id) {
    set({
      groupBeingDeletedID: id
    })
  }
})
