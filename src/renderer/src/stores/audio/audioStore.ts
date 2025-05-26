import { create } from 'zustand'
import { BoardSlice, createBoardSlice } from './boardSlice'
import { CategorySlice, createCategorySlice } from './categorySlice'
import { createEditingSlice, EditingSlice } from './editingSlice'
import { createGroupSlice, GroupSlice } from './groupSlice'
import { createSoundSlice, SoundSlice } from './soundSlice'

type AudioStoreSlice = BoardSlice & CategorySlice & EditingSlice & GroupSlice & SoundSlice

export const useAudioStore = create<AudioStoreSlice>()((...a) => ({
  ...createBoardSlice(...a),
  ...createCategorySlice(...a),
  ...createEditingSlice(...a),
  ...createGroupSlice(...a),
  ...createSoundSlice(...a)
}))
