import { create } from 'zustand'
import { createGroupSlice, GroupSlice } from './groupSlice'
import { createSoundSlice, SoundSlice } from './soundSlice'
import { createEditingSlice, EditingSlice } from './editingSliceV3'

type AudioStoreSlice = GroupSlice & SoundSlice & EditingSlice

export const useAudioStore = create<AudioStoreSlice>()((...a) => ({
  ...createEditingSlice(...a),
  ...createGroupSlice(...a),
  ...createSoundSlice(...a)
}))
