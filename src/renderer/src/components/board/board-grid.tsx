import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { useCallback, useMemo } from 'react'
import Board from './board'
import { NewBoardModalId } from '../modals/newBoardModal/newBoardModal'
import BoardIcon from '@renderer/assets/icons/board'
import GroupIcon from '@renderer/assets/icons/group'
import CategoryIcon from '@renderer/assets/icons/category'
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
  const boards = useAudioStore((store) => store.boards)
  const activeBoardID = useAudioStore((store) => store.activeBoardID)
  const editingMode = useAudioStore((store) => store.editingMode)
  const setActiveBoardID = useAudioStore((store) => store.setActiveBoardID)
  const setEditingMode = useAudioStore((store) => store.setEditingMode)
  const editBoard = useAudioStore((store) => store.updateEditingBoardV2)
  const editSource = useAudioStore((store) => store.updateEditingSourceV2)

  const onNewBoard = () => {
    editBoard()
    editSource()
    ;(document.getElementById(NewBoardModalId) as HTMLDialogElement).showModal()
  }

  const onNewGroup = () => {
    if (activeBoardID) {
      editSource()
      editBoard({}, activeBoardID)
      ;(document.getElementById(NewGroupSelectModalId) as HTMLDialogElement).showModal()
    }
  }

  const onLinkGroup = () => {
    if (activeBoardID) {
      editBoard({}, activeBoardID)
      ;(document.getElementById(LinkEffectModalId) as HTMLDialogElement).showModal()
    }
  }

  const onNewCategory = () => {
    if (activeBoardID) {
      editBoard({}, activeBoardID)
      ;(document.getElementById(NewCategoryModalId) as HTMLDialogElement).showModal()
    }
  }

  const onClickEdit = () => {
    const newEditingMode: EditingMode = editingMode === 'Off' ? 'Editing' : 'Off'
    setEditingMode(newEditingMode)
  }

  const onBoardEdit = (board: SoundBoard) => {
    editBoard()
    editBoard(board, board.id)
    ;(document.getElementById(EditBoardModalId) as HTMLDialogElement).showModal()
  }

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
            ${b.id === activeBoardID ? 'outline w-full' : ''}
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
        grid-cols-[min-content_1fr]
    `}
    >
      <div className="bg-base-200 w-56 grid grid-rows-[1fr_min-content]">
        <ul className="menu w-full">{boardTabs}</ul>
        <div
          className={`
            grid
            [grid-template-areas:"board_category_link_group"_"edit_edit_edit_edit"]
            gap-y-2
            justify-between
            p-2
            w-full`}
        >
          <div className="tooltip" data-tip="New Board">
            <button className="btn btn-secondary btn-soft p-2" onClick={onNewBoard}>
              <BoardIcon />
            </button>
          </div>
          <div className="tooltip" data-tip="New Category" onClick={onNewCategory}>
            <button className="btn btn-accent btn-soft p-2">
              <CategoryIcon />
            </button>
          </div>
          <div className="tooltip" data-tip="Link Effect" onClick={onLinkGroup}>
            <button className="btn btn-primary btn-soft p-2">
              <LinkIcon />
            </button>
          </div>
          <div className="tooltip" data-tip="New Effect" onClick={onNewGroup}>
            <button className="btn btn-primary btn-soft p-2">
              <GroupIcon />
            </button>
          </div>
          <button
            className={`
              btn
              w-full
              [grid-area:edit]
              ${editingMode === 'Editing' ? 'btn-ghost' : 'btn-soft'}
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
