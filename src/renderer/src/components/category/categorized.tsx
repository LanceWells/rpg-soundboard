import { useAudioStore } from '@renderer/stores/audioStore'
import { useShallow } from 'zustand/react/shallow'
import GenericCategoryContainer from './genericCategoryContainer'
import { CSS } from '@dnd-kit/utilities'
import { useCallback } from 'react'
import { EditCategoryModalId } from '../modals/editCategoryModal/editCategoryModal'
import PencilIcon from '@renderer/assets/icons/pencil'
import MoveIcon from '@renderer/assets/icons/move'
import { useSortable } from '@dnd-kit/sortable'
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
  const { category, boardID, beingDragged } = props

  const { getGroupsForCategory, setEditingBoardID, prepEditingCategory, editingMode, draggingID } =
    useAudioStore(
      useShallow((state) => ({
        getGroupsForCategory: state.getGroupsForCategory,
        editingMode: state.editingMode,
        setEditingBoardID: state.setEditingBoardID,
        prepEditingCategory: state.prepEditingCategory,
        draggingID: state.draggingID
      }))
    )

  const groups = getGroupsForCategory(category.id)

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: category.id
  })

  const { over } = useDndContext()

  const style = {
    transform: CSS.Transform.toString({
      scaleX: 1.0,
      scaleY: 1.0,
      x: transform?.x ?? 0,
      y: transform?.y ?? 0
    }),
    transition
  }

  const onClickEdit = useCallback(() => {
    prepEditingCategory(boardID, category.id)
    setEditingBoardID(boardID)
    ;(document.getElementById(EditCategoryModalId) as HTMLDialogElement).showModal()
  }, [category, boardID])

  return (
    <div
      {...attributes}
      ref={setNodeRef}
      style={style}
      role="button"
      className={`
        ${draggingID === category.id && !beingDragged ? 'opacity-0' : 'opacity-100'}
      `}
    >
      <div
        className={`
        relative
        outline-dashed
        rounded-lg
        p-6
        pt-10
        min-w-36
        justify-center
    `}
      >
        <h3 className="prose text-xl absolute top-0 left-0 w-full max-w-full text-center">
          {category.name}
        </h3>
        <div
          {...listeners}
          className={`
            ${editingMode === 'Off' ? 'hidden' : 'visible'}
            rounded-full
            absolute
            -bottom-4
            -left-5
            bg-primary
        `}
        >
          <MoveIcon />
        </div>
        <div
          className={`
          flex flex-row flex-wrap gap-6 z-0
          `}
        >
          <GenericCategoryContainer boardID={boardID} groups={groups} />
        </div>
        <div
          className={`
          bg-[rgb(255_255_255_/_10%)]
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
          -top-8
          -right-8
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
    </div>
  )
}
