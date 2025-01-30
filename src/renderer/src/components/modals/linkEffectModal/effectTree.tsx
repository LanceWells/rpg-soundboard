import { useAudioStore } from '@renderer/stores/audioStore'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import GroupCategory from './effectCategory'

export default function EffectTree() {
  const { activeBoard, boards, editingBoard } = useAudioStore(
    useShallow((state) => ({
      boards: state.boards,
      activeBoard: state.activeBoard,
      editingBoard: state.editingBoard
    }))
  )

  const groups = useMemo(() => {
    const f = boards
      .filter((b) => b.id !== activeBoard?.id)
      .flatMap((b) =>
        b.categories.map((c) => ({
          board: b,
          category: c
        }))
      )

    return boards
      .filter((b) => b.id !== activeBoard?.id)
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
  }, [boards, activeBoard])

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
