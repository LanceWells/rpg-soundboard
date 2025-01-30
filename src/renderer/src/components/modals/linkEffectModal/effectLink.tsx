import { useAudioStore } from '@renderer/stores/audioStore'
import { ChangeEventHandler, useCallback, useMemo } from 'react'
import { SoundGroupSource } from 'src/apis/audio/types/items'
import { useShallow } from 'zustand/react/shallow'

export type GroupLinkProps = {
  group: SoundGroupSource
}

export default function GroupLink(props: GroupLinkProps) {
  const { group } = props

  const { activeBoard, addBoardReference, removeBoardReference } = useAudioStore(
    useShallow((state) => ({
      activeBoard: state.boards.find((b) => b.id === state.activeBoardID) ?? null,
      addBoardReference: state.addBoardReference,
      removeBoardReference: state.removeBoardReference
    }))
  )

  const isChecked = useMemo(
    () =>
      activeBoard?.groups.find((g) => g.type === 'reference' && g.id === group.id) !== undefined,
    [activeBoard, group]
  )

  const onChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      if (!activeBoard) {
        return
      }
      if (e.target.checked) {
        addBoardReference(activeBoard.id, group.id)
      } else {
        removeBoardReference(activeBoard.id, group.id)
      }
      e.preventDefault()
    },
    [activeBoard, group]
  )

  return (
    <li className="flex pt-2 gap-2">
      <input onChange={onChange} checked={isChecked} type="checkbox" className="checkbox" />
      {group.name}
    </li>
  )
}
