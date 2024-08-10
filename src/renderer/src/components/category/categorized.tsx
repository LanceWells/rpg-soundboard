import { useAudioStore } from '@renderer/stores/audioStore'
import { BoardID, CategoryID, SoundCategory } from 'src/apis/audio/interface'
import { useShallow } from 'zustand/react/shallow'
import GenericCategoryContainer from './genericCategoryContainer'
import { useDroppable } from '@dnd-kit/core'

export type CategorizedProps = {
  boardID: BoardID
  category: SoundCategory
}

export default function Categorized(props: CategorizedProps) {
  const { category, boardID } = props

  const { getGroupsForCategory, editingMode } = useAudioStore(
    useShallow((state) => ({
      getGroupsForCategory: state.getGroupsForCategory,
      editingMode: state.editingMode
    }))
  )

  const groups = getGroupsForCategory(category.id)

  const { setNodeRef } = useDroppable({ disabled: editingMode === 'Off', id: category.id })

  return (
    <div ref={setNodeRef}>
      <h3>{category.name}</h3>
      <GenericCategoryContainer boardID={boardID} groups={groups} />
    </div>
  )
}
