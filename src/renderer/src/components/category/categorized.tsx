import { useAudioStore } from '@renderer/stores/audioStore'
import { useShallow } from 'zustand/react/shallow'
import GenericCategoryContainer from './genericCategoryContainer'
import { useCallback } from 'react'
import { EditCategoryModalId } from '../modals/editCategoryModal/editCategoryModal'
import PencilIcon from '@renderer/assets/icons/pencil'
import { BoardID } from 'src/apis/audio/types/boards'
import { SoundCategory } from 'src/apis/audio/types/items'
import Draggable from '../dnd/draggable'
import Droppable from '../dnd/droppable'

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
}

/**
 * A container for a category, that itself should incldue a variety of sound groups.
 * @param props See {@link CategorizedProps}.
 */
export default function Categorized(props: CategorizedProps) {
  const { category, boardID } = props

  const { getGroupsForCategory, setEditingBoardID, prepEditingCategory, editingMode } =
    useAudioStore(
      useShallow((state) => ({
        getGroupsForCategory: state.getGroupsForCategory,
        editingMode: state.editingMode,
        setEditingBoardID: state.setEditingBoardID,
        prepEditingCategory: state.prepEditingCategory
      }))
    )

  const groups = getGroupsForCategory(category.id)

  // const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
  //   id: category.id
  // })

  const onClickEdit = useCallback(() => {
    prepEditingCategory(boardID, category.id)
    setEditingBoardID(boardID)
    ;(document.getElementById(EditCategoryModalId) as HTMLDialogElement).showModal()
  }, [category, boardID])

  return (
    <Droppable id={category.id}>
      <Draggable id={category.id}>
        <div role="button">
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
            {/* <div
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
          </div> */}
            <div className="flex flex-row flex-wrap gap-6">
              <GenericCategoryContainer boardID={boardID} groups={groups} />
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
      </Draggable>
    </Droppable>
  )
}
