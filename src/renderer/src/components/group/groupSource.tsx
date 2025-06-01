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

  const { playGroup, stopGroup, playingGroups, resetEditingGroup, setEditingBoardID } =
    useAudioStore(
      useShallow((state) => ({
        playGroup: state.playGroup,
        stopGroup: state.stopGroup,
        playingGroups: state.playingGroups,
        resetEditingGroup: state.resetEditingGroup,
        setEditingBoardID: state.setEditingBoardID
      }))
    )

  const isPlaying = playingGroups.includes(group.id)

  const onClickPlay = useCallback(() => {
    if (group.variant !== 'Rapid' && isPlaying) {
      stopGroup(group.id)
    } else {
      playGroup(group.id)
    }
  }, [group, isPlaying])

  const onClickEdit = useCallback(() => {
    resetEditingGroup(group)
    stopGroup(group.id)
    setEditingBoardID(boardID)
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
