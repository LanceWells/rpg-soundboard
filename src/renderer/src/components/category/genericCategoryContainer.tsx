import { SortableContext } from '@dnd-kit/sortable'
import { useMemo } from 'react'
import Group from '../group/group'
import { useAudioStore } from '@renderer/stores/audioStore'
import { BoardID } from 'src/apis/audio/types/boards'
import { SoundGroup } from 'src/apis/audio/types/items'
import { CategoryID } from 'src/apis/audio/types/categories'

export type GenericCategoryContainerProps = {
  groups: SoundGroup[]
  boardID: BoardID
  categoryID?: CategoryID
}

export default function GenericCategoryContainer(props: GenericCategoryContainerProps) {
  const { groups, boardID } = props

  const editingMode = useAudioStore((state) => state.editingMode)

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
