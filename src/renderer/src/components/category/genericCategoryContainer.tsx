import { SortableContext } from '@dnd-kit/sortable'
import { useMemo } from 'react'
import Group from '../group/group'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { BoardID } from 'src/apis/audio/types/boards'
import { SoundGroup } from 'src/apis/audio/types/items'
import { CategoryID } from 'src/apis/audio/types/categories'
import { useShallow } from 'zustand/react/shallow'

export type GenericCategoryContainerProps = {
  groups: SoundGroup[]
  boardID: BoardID
  categoryID?: CategoryID
}

export default function GenericCategoryContainer(props: GenericCategoryContainerProps) {
  const { groups, boardID } = props

  const { editingMode } = useAudioStore(
    useShallow((state) => ({
      editingMode: state.editingMode,
      playingGroups: state.playingGroups
    }))
  )

  const groupIDs = useMemo(() => {
    return groups.map((g) => g.id)
  }, [groups])

  const groupElements = useMemo(() => {
    return groups.map((g) => <Group boardID={boardID} group={g} key={g.id} />)
  }, [groups])

  return (
    <SortableContext disabled={editingMode === 'Off'} items={groupIDs}>
      {groupElements}
    </SortableContext>
  )
}
