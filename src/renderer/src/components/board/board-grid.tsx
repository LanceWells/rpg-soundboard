import { useAudioStore } from '@renderer/stores/audio/audioStore'
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
import { EditBoardModalId } from '../modals/newBoardModal/editBoardModal'
import { SoundBoard } from 'src/apis/audio/types/items'
import LinkIcon from '@renderer/assets/icons/link'
import { LinkEffectModalId } from '../modals/linkEffectModal/linkEffectModal'
import { EditingMode } from '@renderer/stores/audio/editingSlice'
import { NewGroupSelectModalId } from '../modals/newGroupSelectModal/newGroupSelectModal'

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
    setEditingMode,
    setBoardName
  } = useAudioStore(
    useShallow((state) => ({
      boards: state.boards,
      activeBoardID: state.activeBoardID,
      resetEditingGroup: state.resetEditingGroup,
      resetEditingBoard: state.resetEditingBoard,
      setActiveBoardID: state.setActiveBoardID,
      setEditingBoardID: state.setEditingBoardID,
      editingMode: state.editingMode,
      setEditingMode: state.setEditingMode,
      setBoardName: state.setBoardName
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
      resetEditingGroup()
      // TODO: UNDO PLZ
      // ;(document.getElementById(NewEffectModalId) as HTMLDialogElement).showModal()
      ;(document.getElementById(NewGroupSelectModalId) as HTMLDialogElement).showModal()
    }
  }, [activeBoardID])

  const onLinkGroup = useCallback(() => {
    if (activeBoardID) {
      setEditingBoardID(activeBoardID)
      ;(document.getElementById(LinkEffectModalId) as HTMLDialogElement).showModal()
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

  const onBoardEdit = useCallback(
    (board: SoundBoard) => {
      resetEditingBoard()
      setEditingBoardID(board.id)
      setBoardName(board.name)
      ;(document.getElementById(EditBoardModalId) as HTMLDialogElement).showModal()
    },
    [EditBoardModalId]
  )

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
            flex
            justify-center
        `}
        >
          <button
            onClick={() => onBoardEdit(b)}
            className={`
              btn
              btn-circle
              btn-sm
              absolute
              right-0
              btn-primary
              ${
                editingMode !== 'Off' && activeBoardID === b.id
                  ? 'opacity-100 pointer-events-auto'
                  : 'opacity-0 pointer-events-none'
              }
            `}
          >
            <PencilIcon className="w-3 absolute" />
          </button>
          <a
            className={`
            ${b.id === activeBoardID ? 'outline' : ''}
            `}
          >
            {b.name}
          </a>
        </li>
      )
    })

    return {
      boardNodes,
      boardTabs
    }
  }, [boards, activeBoardID, editingMode])

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
        <ul className="menu m-2">{boardTabs}</ul>
        <div
          className={`
            grid
            [grid-template-areas:_"board_category_link_group"_"edit_edit_edit_edit"]
            gap-y-2
            m-2`}
        >
          <div className="tooltip" data-tip="New Board">
            <button className="btn btn-secondary btn-circle" onClick={onNewBoard}>
              <BoardIcon />
            </button>
          </div>
          <div className="tooltip" data-tip="New Category" onClick={onNewCategory}>
            <button className="btn btn-accent btn-circle">
              <CategoryIcon />
            </button>
          </div>
          <div className="tooltip" data-tip="Link Effect" onClick={onLinkGroup}>
            <button className="btn btn-primary btn-circle">
              <LinkIcon />
            </button>
          </div>
          <div className="tooltip" data-tip="New Effect" onClick={onNewGroup}>
            <button className="btn btn-primary btn-circle">
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
