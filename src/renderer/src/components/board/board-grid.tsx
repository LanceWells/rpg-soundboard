import { EditingMode, useAudioStore } from '@renderer/stores/audioStore'
import { useCallback, useMemo } from 'react'
import Board from './board'
import { NewBoardModalId } from '../modals/newBoardModal/newBoardModal'
import { useShallow } from 'zustand/react/shallow'
import BoardIcon from '@renderer/assets/icons/board'
import GroupIcon from '@renderer/assets/icons/group'
import CategoryIcon from '@renderer/assets/icons/category'
import { NewEffectModalId } from '../modals/newEffectModal/newEffectModal'
import { NewCategoryModalId } from '../modals/newCategoryModal/newCategoryModal'
import PencilIcon from '@renderer/assets/icons/pencil'

/**
 * A root-level component that is used to render every various soundboard, along with a means to
 * switch between boards.
 */
export default function BoardGrid() {
  const {
    boards,
    activeBoardID,
    editingMode,
    setActiveBoardID,
    setEditingBoardID,
    resetEditingGroup,
    resetEditingBoard,
    setEditingMode
  } = useAudioStore(
    useShallow((state) => ({
      boards: state.boards,
      activeBoardID: state.activeBoard?.id,
      resetEditingGroup: state.resetEditingGroup,
      resetEditingBoard: state.resetEditingBoard,
      setActiveBoardID: state.setActiveBoard,
      setEditingBoardID: state.setEditingBoardID,
      editingMode: state.editingMode,
      setEditingMode: state.setEditingMode
    }))
  )

  const onNewBoard = useCallback(() => {
    resetEditingGroup()
    resetEditingBoard()
    ;(document.getElementById(NewBoardModalId) as HTMLDialogElement).showModal()
  }, [])

  const onNewGroup = useCallback(() => {
    if (activeBoardID) {
      setEditingBoardID(activeBoardID)
      ;(document.getElementById(NewEffectModalId) as HTMLDialogElement).showModal()
    }
  }, [activeBoardID])

  const onNewCategory = useCallback(() => {
    if (activeBoardID) {
      setEditingBoardID(activeBoardID)
      ;(document.getElementById(NewCategoryModalId) as HTMLDialogElement).showModal()
    }
  }, [activeBoardID])

  const onClickEdit = useCallback(() => {
    const newEditingMode: EditingMode = editingMode === 'Off' ? 'Editing' : 'Off'
    setEditingMode(newEditingMode)
  }, [editingMode])

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
        <li
          key={`selector-${b.id}`}
          onClick={() => setActiveBoardID(b.id)}
          className={`
          w-full
          rounded-lg
          ${b.id === activeBoardID ? 'outline' : ''}
          `}
        >
          <a>{b.name}</a>
        </li>
      )
    })

    return {
      boardNodes,
      boardTabs
    }
  }, [boards, activeBoardID])

  return (
    <div
      className={`
        grid
        h-full
        relative
        w-full
        max-h-full
        overflow-hidden
        [grid-template-columns:_min-content_1fr]
    `}
    >
      <div className="bg-base-200 w-56 grid [grid-template-rows:_1fr_min-content]">
        <ul className="menu">{boardTabs}</ul>
        <div
          className={`
            grid
            [grid-template-areas:_"board_category_group"_"edit_edit_edit"]
            gap-2
            m-2`}
        >
          <div className="tooltip" data-tip="New Board">
            <button className="btn btn-secondary" onClick={onNewBoard}>
              <BoardIcon />
            </button>
          </div>
          <div className="tooltip" data-tip="New Category" onClick={onNewCategory}>
            <button className="btn btn-accent">
              <CategoryIcon />
            </button>
          </div>
          <div className="tooltip" data-tip="New Effect" onClick={onNewGroup}>
            <button className="btn btn-primary">
              <GroupIcon />
            </button>
          </div>
          <button
            className={`
              btn
              w-full
              [grid-area:edit]
              ${editingMode === 'Editing' ? 'btn-ghost' : 'btn-outline'}
            `}
            onClick={onClickEdit}
          >
            <PencilIcon />
            Edit Mode
          </button>
        </div>
      </div>
      <div className="max-h-full overflow-y-scroll">{boardNodes}</div>
    </div>
  )
}
