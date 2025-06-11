import { useCallback } from 'react'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { useShallow } from 'zustand/react/shallow'
import { BoardID } from 'src/apis/audio/types/boards'
import type { SoundGroupSequence } from 'src/apis/audio/types/items'
import { EditSequenceModalId } from '../modals/sequenceModal/editModal'
import GroupBase from './groupBase'

export type GroupSequenceProps = {
  group: SoundGroupSequence
  boardID: BoardID
  beingDragged?: boolean
}

export default function GroupSequence(props: GroupSequenceProps) {
  const { group, boardID, beingDragged } = props

  const { playGroup, stopGroup, playingGroups, resetSequence, editBoard } = useAudioStore(
    useShallow((state) => ({
      playGroup: state.playGroup,
      stopGroup: state.stopGroup,
      playingGroups: state.playingGroups,
      // resetSequence: state.resetEditingSequence,
      resetSequence: state.updateEditingSequenceV2,
      // setEditingBoardID: state.setEditingBoardID
      editBoard: state.updateEditingBoardV2,
      editingSequence: state.editingElementsV2
    }))
  )

  const isPlaying = playingGroups.includes(group.id)

  const onClickPlay = useCallback(() => {
    if (isPlaying) {
      stopGroup(group.id)
    } else {
      playGroup(group.id)
    }
  }, [group, isPlaying])

  const onClickEdit = useCallback(() => {
    // resetSequence(group)
    resetSequence(group, group.id)

    stopGroup(group.id)
    editBoard({}, boardID)
    ;(document.getElementById(EditSequenceModalId) as HTMLDialogElement).showModal()
  }, [group, group, boardID])

  return (
    <GroupBase
      group={group}
      onClickEdit={onClickEdit}
      onClickPlay={onClickPlay}
      beingDragged={beingDragged}
    />
  )
}
