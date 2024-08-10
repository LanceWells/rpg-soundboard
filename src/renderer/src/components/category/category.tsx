import { useSortable } from '@dnd-kit/sortable'
import { BoardID, SoundCategory } from 'src/apis/audio/interface'
import { useAudioStore } from '@renderer/stores/audioStore'
import { useShallow } from 'zustand/react/shallow'
import { CSS } from '@dnd-kit/utilities'
import CategoryContainer from './categoryContainer'
import { useMemo } from 'react'
import Group from '../group/group'

export type CategoryProps = {
  category: SoundCategory
  boardID: BoardID
}

export default function Category(props: CategoryProps) {
  const { boardID, category } = props

  const { reorderGroups, getGroupsForCategory, editingMode } = useAudioStore(
    useShallow((state) => ({
      reorderGroups: state.reorderGroups,
      getGroupsForCategory: state.getGroupsForCategory,
      editingMode: state.editingMode
    }))
  )

  const groups = getGroupsForCategory(category.id)

  const { groupElements, groupIDs } = useMemo(() => {
    const groupIDs = groups.map((g) => g.id)
    const groupElements = groups.map((g) => <Group boardID={boardID} group={g} key={g.id} />)

    return {
      groupElements,
      groupIDs
    }
  }, [boardID, groups])

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: category.id,
    disabled: editingMode === 'Off'
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <h4>{category.name}</h4>
      <CategoryContainer boardID={boardID} groupIDs={groupIDs} reorderGroups={reorderGroups}>
        {groupElements}
      </CategoryContainer>
    </div>
  )
}
