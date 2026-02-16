import { create } from 'zustand'
import { createGroupSlice, GroupSlice } from './groupSlice'
import { createSoundSlice, SoundSlice } from './soundSlice'
import { createEditingSliceV2, EditingSliceV2 } from './editingSliceV2'

type AudioStoreSlice = GroupSlice & SoundSlice & EditingSliceV2

export const useAudioStore = create<AudioStoreSlice>()((...a) => ({
  ...createEditingSliceV2(...a),
  ...createGroupSlice(...a),
  ...createSoundSlice(...a)
}))
