import { useCallback, useMemo } from 'react'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { EditEffectModalId } from '../modals/newEffectModal/editEffectModal'
import { useShallow } from 'zustand/react/shallow'
import { BoardID } from 'src/apis/audio/types/boards'
import type { SoundGroupReference } from 'src/apis/audio/types/items'
import { isSequenceGroup, isSourceGroup } from '@renderer/utils/typePredicates'
import GroupBase from './groupBase'

export type GroupReferenceProps = {
  group: SoundGroupReference
  boardID: BoardID
  beingDragged?: boolean
}

export default function GroupReference(props: GroupReferenceProps) {
  const { group, boardID, beingDragged } = props

  const { getGroup, playGroup, stopGroup, isPlaying, resetEditingGroup, resetSequence, editBoard } =
    useAudioStore(
      useShallow((state) => ({
        getGroup: state.getGroup,
        playGroup: state.playGroup,
        stopGroup: state.stopGroup,
        isPlaying: state.playingGroups.some((g) => g === group.id),
        resetEditingGroup: state.updateEditingSourceV2,
        resetSequence: state.updateEditingSequenceV2,
        editBoard: state.updateEditingBoardV2
      }))
    )

  const sourceGroup = useMemo(() => {
    const out = getGroup(group.id)
    return out
  }, [group])

  const onClickPlay = useCallback(() => {
    if (isSourceGroup(sourceGroup) && sourceGroup.variant !== 'Rapid' && isPlaying) {
      stopGroup(group.id)
    } else {
      playGroup(group.id)
    }
  }, [group, isPlaying])

  const onClickEdit = useCallback(() => {
    stopGroup(group.id)
    editBoard({}, boardID)
    if (isSourceGroup(sourceGroup)) {
      resetEditingGroup(sourceGroup)
      ;(document.getElementById(EditEffectModalId) as HTMLDialogElement).showModal()
    } else if (isSequenceGroup(sourceGroup)) {
      resetSequence(sourceGroup)
    }
  }, [group, sourceGroup, boardID])

  return (
    <GroupBase
      group={sourceGroup}
      onClickEdit={onClickEdit}
      onClickPlay={onClickPlay}
      beingDragged={beingDragged}
    />
  )
}
