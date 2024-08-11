import { SortableContext } from '@dnd-kit/sortable'
import { useMemo } from 'react'
import { BoardID, CategoryID, SoundGroup } from 'src/apis/audio/interface'
import Group from '../group/group'

export type GenericCategoryContainerProps = {
  groups: SoundGroup[]
  boardID: BoardID
  categoryID?: CategoryID
}

export default function GenericCategoryContainer(props: GenericCategoryContainerProps) {
  const { groups, boardID } = props

  const groupIDs = useMemo(() => {
    return groups.map((g) => g.id)
  }, [groups])

  const groupElements = useMemo(() => {
    return groups.map((g) => <Group boardID={boardID} group={g} key={g.id} />)
  }, [groups])

  return <SortableContext items={groupIDs}>{groupElements}</SortableContext>
}
