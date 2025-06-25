import { useCallback } from 'react'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { EditEffectModalId } from '../modals/newEffectModal/editEffectModal'
import { useShallow } from 'zustand/react/shallow'
import { BoardID } from 'src/apis/audio/types/boards'
import type { SoundGroupSource } from 'src/apis/audio/types/items'
import GroupBase from './groupBase'

export type GroupProps = {
  group: SoundGroupSource
  boardID: BoardID
  beingDragged?: boolean
}

export default function Group(props: GroupProps) {
  const { group, boardID, beingDragged } = props

  const { playGroup, stopGroup, isPlaying, resetEditingGroup, editBoard } = useAudioStore(
    useShallow((state) => ({
      playGroup: state.playGroup,
      stopGroup: state.stopGroup,
      isPlaying: state.playingGroups.some((g) => g === group.id),
      resetEditingGroup: state.updateEditingSourceV2,
      editBoard: state.updateEditingBoardV2
    }))
  )

  const onClickPlay = useCallback(() => {
    if (group.variant !== 'Rapid' && isPlaying) {
      stopGroup(group.id)
    } else {
      playGroup(group.id)
    }
  }, [group, isPlaying])

  const onClickEdit = useCallback(() => {
    resetEditingGroup(group, group.id)
    stopGroup(group.id)
    editBoard({}, boardID)
    ;(document.getElementById(EditEffectModalId) as HTMLDialogElement).showModal()
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
