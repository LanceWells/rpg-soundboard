import { create } from 'zustand'
import { createGroupSlice, GroupSlice } from './groupSlice'
import { createSoundSlice, SoundSlice } from './soundSlice'
import { createEditingSliceV2, EditingSliceV2 } from './editingSliceV2'
import { createEditingSliceV3, EditingSliceV3 } from './editingSliceV3'

type AudioStoreSlice = GroupSlice & SoundSlice & EditingSliceV2 & EditingSliceV3

export const useAudioStore = create<AudioStoreSlice>()((...a) => ({
  ...createEditingSliceV2(...a),
  ...createEditingSliceV3(...a),
  ...createGroupSlice(...a),
  ...createSoundSlice(...a)
}))
