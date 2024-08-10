import { useAudioStore } from '@renderer/stores/audioStore'
import { useMemo } from 'react'
import { BoardID } from 'src/apis/audio/interface'
import { useShallow } from 'zustand/react/shallow'
import Group from '../group/group'
import CategoryContainer from './categoryContainer'

export type UncategorizedGroupsProps = {
  boardID: BoardID
}

export default function UncategorizedGroups(props: UncategorizedGroupsProps) {
  const { boardID } = props

  const { reorderGroups, getUncategorizedGroups } = useAudioStore(
    useShallow((state) => ({
      reorderGroups: state.reorderGroups,
      getUncategorizedGroups: state.getUncategorizedGroups
    }))
  )

  const groups = getUncategorizedGroups({ boardID }).groups

  const { groupElements, groupIDs } = useMemo(() => {
    const groupIDs = groups.map((g) => g.id)
    const groupElements = groups.map((g) => <Group boardID={boardID} group={g} key={g.id} />)

    return {
      groupElements,
      groupIDs
    }
  }, [boardID, groups])

  return (
    <CategoryContainer boardID={boardID} groupIDs={groupIDs} reorderGroups={reorderGroups}>
      {groupElements}
    </CategoryContainer>
  )
}
