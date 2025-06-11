import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import GroupCategory from './effectCategory'

export default function EffectTree() {
  const { activeBoardID, boards } = useAudioStore(
    useShallow((state) => ({
      boards: state.boards,
      activeBoardID: state.activeBoardID
    }))
  )

  const groups = useMemo(() => {
    return boards
      .filter((b) => b.id !== activeBoardID)
      .flatMap((b) =>
        b.categories.map((c) => ({
          board: b,
          category: c
        }))
      )
      .map((bc) => {
        return (
          <GroupCategory
            board={bc.board}
            category={bc.category}
            key={`${bc.board.id}-${bc.category.id}`}
          />
        )
      })
  }, [boards, activeBoardID])

  return (
    <div
      className={`
        rounded-lg
        outline-double
        bg-base-200
        w-full
        max-h-96
        overflow-y-scroll
        p-4
        `}
    >
      {groups}
    </div>
  )
}
