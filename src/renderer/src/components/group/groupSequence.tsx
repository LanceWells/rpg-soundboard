import { useCallback } from 'react'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { useShallow } from 'zustand/react/shallow'
import type { SoundGroupSequence } from 'src/apis/audio/types/items'
import { EditSequenceModalId } from '../modals/sequenceModal/editModal'
import GroupBase from './groupBase'

export type GroupSequenceProps = {
  group: SoundGroupSequence
  beingDragged?: boolean
}

export default function GroupSequence(props: GroupSequenceProps) {
  const { group, beingDragged } = props

  const { playGroup, stopGroup, isPlaying, resetSequence } = useAudioStore(
    useShallow((state) => ({
      playGroup: state.playGroup,
      stopGroup: state.stopGroup,
      isPlaying: state.playingGroups.some((g) => g === group.id),
      resetSequence: state.updateEditingSequenceV2,
      editingSequence: state.editingElementsV2
    }))
  )

  const onClickPlay = useCallback(() => {
    if (isPlaying) {
      stopGroup(group.id)
    } else {
      playGroup(group.id)
    }
  }, [group, isPlaying])

  const onClickEdit = useCallback(() => {
    resetSequence(group, group.id)
    stopGroup(group.id)
    ;(document.getElementById(EditSequenceModalId) as HTMLDialogElement).showModal()
  }, [group, group])

  return (
    <GroupBase
      group={group}
      onClickEdit={onClickEdit}
      onClickPlay={onClickPlay}
      beingDragged={beingDragged}
    />
  )
}
