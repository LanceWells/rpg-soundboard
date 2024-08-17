import { useAudioStore } from '@renderer/stores/audioStore'
import { useCallback, useMemo } from 'react'
import Board from './board'
import { NewBoardModalId } from '../modals/newBoardModal/newBoardModal'
import { useShallow } from 'zustand/react/shallow'

/**
 * A root-level component that is used to render every various soundboard, along with a means to
 * switch between boards.
 */
export default function BoardGrid() {
  const { boards, editingMode } = useAudioStore(
    useShallow((state) => ({
      boards: state.boards,
      editingMode: state.editingMode
    }))
  )

  const onNewBoard = useCallback(() => {
    ;(document.getElementById(NewBoardModalId) as HTMLDialogElement).showModal()
  }, [])

  const { boardNodes, boardPickerNodes } = useMemo(() => {
    const boardNodes = boards.map((b) => {
      return (
        <div
          key={b.id}
          id={b.id}
          onTouchStart={(e) => console.log('carousel touch' + JSON.stringify(e))}
          onTouchMove={(e) => console.log('carousel touch' + JSON.stringify(e))}
          className="carousel-item relative w-full"
        >
          <Board board={b} key={b.id} />
          <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between" />
        </div>
      )
    })

    const brdArray = new Array(...boards)
    const boardPickerNodes = boards.map((b, i) => {
      const thisBoardID = brdArray.at(i)?.id
      return (
        <a className="btn" key={`selector-${b.id}`} href={`#${thisBoardID}`}>
          {b.name}
        </a>
      )
    })

    return {
      boardNodes,
      boardPickerNodes
    }
  }, [boards, boards.length])

  return (
    <div
      onTouchStart={(e) => console.log('carousel touch' + JSON.stringify(e))}
      onTouchMove={(e) => console.log('carousel touch' + JSON.stringify(e))}
      className="grid h-full gap-2 [grid-template-rows:_1fr_min-content]"
    >
      <div
        className={`
          carousel
          w-full
          flex-grow
          overflow-x-hidden
          ${editingMode === 'Off' ? '' : 'overflow-x-hidden'}
        `}
      >
        {boardNodes}
      </div>
      <div className="flex w-full justify-center gap-2 py-2">
        {boardPickerNodes}
        <button onClick={onNewBoard} className="btn rounded-btn btn-outline">
          New Board
        </button>
      </div>
    </div>
  )
}
