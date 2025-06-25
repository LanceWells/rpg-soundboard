import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { useShallow } from 'zustand/react/shallow'
import GenericCategoryContainer from './genericCategoryContainer'
import { memo, useCallback } from 'react'
import { EditCategoryModalId } from '../modals/editCategoryModal/editCategoryModal'
import PencilIcon from '@renderer/assets/icons/pencil'
import { BoardID } from 'src/apis/audio/types/boards'
import { SoundCategory } from 'src/apis/audio/types/items'
import { useDndContext } from '@dnd-kit/core'
import AddIcon from '@renderer/assets/icons/add'
import { IdIsGroup } from '@renderer/utils/id'

/**
 * Props for {@link Categorized}.
 */
export type CategorizedProps = {
  /**
   * The ID for the board that this category is rendered within.
   */
  boardID: BoardID

  /**
   * The category that should be rendered.
   */
  category: SoundCategory

  beingDragged?: boolean
}

/**
 * A container for a category, that itself should incldue a variety of sound groups.
 * @param props See {@link CategorizedProps}.
 */
export default function Categorized(props: CategorizedProps) {
  const { category, boardID } = props

  const { getGroupsForCategory, editBoard, editCategory, editingMode, draggingID } = useAudioStore(
    useShallow((state) => ({
      getGroupsForCategory: state.getGroupsForCategory,
      editingMode: state.editingMode,
      editBoard: state.updateEditingBoardV2,
      editCategory: state.updateEditingCategoryV2,
      draggingID: state.draggingID
    }))
  )

  const groups = getGroupsForCategory(category.id)

  const { over } = useDndContext()

  const onClickEdit = useCallback(() => {
    editCategory(category, category.id)
    editBoard({}, boardID)
    ;(document.getElementById(EditCategoryModalId) as HTMLDialogElement).showModal()
  }, [category, boardID])

  return (
    <div
      className={`
        relative
        rounded-lg
        p-6
        pt-10
        min-w-36
        justify-center
        ${editingMode === 'Editing' ? 'outline' : ''}
    `}
    >
      <h2 className="text-2xl absolute top-0 left-0 w-full max-w-full text-center">
        {category.name}
      </h2>
      <div
        className={`
            justify-items-center
            gap-6
            z-0
            w-full
            flex
            flex-wrap
          `}
      >
        <GenericCategoryContainer boardID={boardID} groups={groups} />
      </div>
      <div
        className={`
          bg-[rgb(255_255_255/10%)]
          absolute w-full
          h-full
          top-0
          left-0
          rounded-md
          backdrop-blur-md
          transition-opacity
          flex
          justify-center
          items-center
          pointer-events-none
          ${IdIsGroup(draggingID) && over?.id === category.id ? 'opacity-100' : 'opacity-0'}
          `}
      >
        <span
          className={`
            text-2xl
            text-white
            font-bold
            bg-black
            p-6
            outline-dashed
            outline-white
            rounded-lg
          `}
        >
          <AddIcon />
        </span>
      </div>
      <button
        onClick={editingMode ? onClickEdit : undefined}
        className={`
          absolute
          -top-2
          -right-2
          btn
          btn-circle
          btn-accent
          transition-opacity
          ${editingMode === 'Off' ? 'hidden' : 'visible'}
          ${editingMode === 'Editing' ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <PencilIcon />
      </button>
    </div>
  )
}

export const MemoizedCategorized = memo(Categorized)
