import { useAudioStore } from '@renderer/stores/audioStore'
import { BoardID, SoundCategory } from 'src/apis/audio/interface'
import { useShallow } from 'zustand/react/shallow'
import GenericCategoryContainer from './genericCategoryContainer'
import { CSS } from '@dnd-kit/utilities'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useCallback } from 'react'
import { EditCategoryModalId } from '../modals/editCategoryModal/editCategoryModal'
import PencilIcon from '@renderer/assets/icons/pencil'

export type CategorizedProps = {
  boardID: BoardID
  category: SoundCategory
}

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

  const { setNodeRef: dropNodeRef } = useDroppable({
    disabled: editingMode === 'Off',
    id: category.id
  })

  const dragProps = useDraggable({
    id: category.id,
    disabled: editingMode === 'Off'
  })

  const style = {
    transform: CSS.Transform.toString({
      x: dragProps.transform?.x ?? 0,
      y: dragProps.transform?.y ?? 0,
      scaleX: 1.0,
      scaleY: 1.0
    })
  }

  const onClickEdit = useCallback(() => {
    prepEditingCategory(boardID, category.id)
    setEditingBoardID(boardID)
    ;(document.getElementById(EditCategoryModalId) as HTMLDialogElement).showModal()
  }, [category, boardID])

  return (
    <div
      style={style}
      {...dragProps.attributes}
      {...dragProps.listeners}
      ref={dragProps.setNodeRef}
      role="button"
    >
      <div
        ref={dropNodeRef}
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
          z-10
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
