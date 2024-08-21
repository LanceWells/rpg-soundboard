import { useAudioStore } from '@renderer/stores/audioStore'
import { useCallback, useMemo, useState } from 'react'
import Board from './board'
import { NewBoardModalId } from '../modals/newBoardModal/newBoardModal'
import { useShallow } from 'zustand/react/shallow'
import AddIcon from '@renderer/assets/icons/add'

/**
 * A root-level component that is used to render every various soundboard, along with a means to
 * switch between boards.
 */
export default function BoardGrid() {
  const { boards } = useAudioStore(
    useShallow((state) => ({
      boards: state.boards
    }))
  )

  const onNewBoard = useCallback(() => {
    ;(document.getElementById(NewBoardModalId) as HTMLDialogElement).showModal()
  }, [])

  const [activeBoardID, setActiveBoardID] = useState(boards[0]?.id)

  const { boardNodes, boardTabs } = useMemo(() => {
    const boardNodes = boards.map((b) => {
      return (
        <div
          key={b.id}
          id={b.id}
          className={`
            ${activeBoardID === b.id ? 'visible' : 'hidden'}
            h-full
            max-h-full
          `}
        >
          <Board board={b} key={b.id} />
        </div>
      )
    })

    const boardTabs = boards.map((b) => {
      return (
        <a
          className={`
            w-fit
            tab
            h-12
            ${activeBoardID === b.id ? 'tab-active' : ''}
          `}
          key={`selector-${b.id}`}
          onClick={() => setActiveBoardID(b.id)}
        >
          {b.name}
        </a>
      )
    })

    return {
      boardNodes,
      boardTabs: boardTabs
    }
  }, [boards, boards.length, activeBoardID])

  return (
    <div className="grid h-full max-h-full gap-2 [grid-template-rows:_min-content_1fr]">
      <div role="tablist" className="tabs tabs-boxed w-full justify-start p-2">
        {boardTabs}
        <button className="btn btn-circle tab h-12" onClick={onNewBoard}>
          <AddIcon />
        </button>
      </div>
      <div className="w-full h-full max-h-full max-w-full overflow-x-hidden">{boardNodes}</div>
    </div>
  )
}
