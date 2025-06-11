import { create } from 'zustand'
import { BoardSlice, createBoardSlice } from './boardSlice'
import { CategorySlice, createCategorySlice } from './categorySlice'
import { createEditingSlice, EditingSlice } from './editingSlice'
import { createGroupSlice, GroupSlice } from './groupSlice'
import { createSoundSlice, SoundSlice } from './soundSlice'
import { createEditingSliceV2, EditingSliceV2 } from './editingSliceV2'

type AudioStoreSlice = BoardSlice &
  CategorySlice &
  EditingSlice &
  GroupSlice &
  SoundSlice &
  EditingSliceV2

export const useAudioStore = create<AudioStoreSlice>()((...a) => ({
  ...createBoardSlice(...a),
  ...createCategorySlice(...a),
  ...createEditingSlice(...a),
  ...createEditingSliceV2(...a),
  ...createGroupSlice(...a),
  ...createSoundSlice(...a)
}))
