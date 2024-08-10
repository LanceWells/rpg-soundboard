import { useAudioStore } from '@renderer/stores/audioStore'
import { BoardID } from 'src/apis/audio/interface'
import { useShallow } from 'zustand/react/shallow'
import GenericCategoryContainer from './genericCategoryContainer'

export type UncategorizedProps = {
  boardID: BoardID
}

export default function Uncategorized(props: UncategorizedProps) {
  const { boardID } = props

  const { getUncategorizedGroups } = useAudioStore(
    useShallow((state) => ({
      getUncategorizedGroups: state.getUncategorizedGroups
    }))
  )

  const groups = getUncategorizedGroups({ boardID }).groups

  return <GenericCategoryContainer boardID={boardID} groups={groups} />
}
