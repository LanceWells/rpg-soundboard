import { useState, useCallback, ChangeEventHandler, MouseEventHandler, useEffect } from 'react'
import TextField from '../../generic/textField'
import { NewCategoryModalId } from '../newCategoryModal/newCategoryModal'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import CloseIcon from '@renderer/assets/icons/close'
import DeleteButton from '@renderer/components/generic/deleteButton'
import { useShallow } from 'zustand/react/shallow'

export const EditCategoryModalId = 'edit-category-modal'

export default function EditCategoryModal() {
  const { updateCategory, deleteCategory, editingBoard, editingCategory } = useAudioStore(
    useShallow((state) => ({
      updateCategory: state.updateCategory,
      deleteCategory: state.deleteCategory,
      // editingBoardID: state.editingBoardID,
      // editingCategory: state.editingCategory
      editingBoard: state.editingElementsV2.board,
      editingCategory: state.editingElementsV2.category
    }))
  )

  const editingBoardID = editingBoard?.id

  const [name, setName] = useState('')
  const [nameErr, setNameErr] = useState('')
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  useEffect(() => {
    if (editingCategory?.element) {
      setName(editingCategory?.element.name)
    }
  }, [editingCategory])

  const onChangeName = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      setName(e.target.value)
    },
    [setName]
  )

  const onSubmit = useCallback<MouseEventHandler>(
    (e) => {
      let failToSubmit = false

      if (!name || name.length === 0) {
        failToSubmit = true
        setNameErr('This field is required')
      } else {
        setNameErr('')
      }

      if (failToSubmit) {
        e.preventDefault()
        return
      }

      if (!editingCategory?.id) {
        console.error('Editing category ID is not set!')
        return
      }

      if (editingBoardID && editingCategory) {
        updateCategory({
          boardID: editingBoardID,
          categoryID: editingCategory.id,
          name
        })
      }
      ;(document.getElementById(NewCategoryModalId) as HTMLDialogElement).close()
    },
    [editingBoardID, editingCategory, updateCategory, name, setNameErr]
  )

  const onDelete = useCallback(() => {
    if (!editingCategory?.id) {
      console.error('Editing category ID is not set! (del)')
      return
    }

    if (editingBoardID && editingCategory) {
      deleteCategory({ boardID: editingBoardID, categoryID: editingCategory.id })
    }
  }, [deleteCategory, editingBoardID, editingCategory])

  const handleClose = useCallback(() => {
    setIsConfirmingDelete(false)
  }, [setIsConfirmingDelete])

  const onAskConfirm = useCallback(() => {
    setIsConfirmingDelete(true)
  }, [setIsConfirmingDelete])

  const onCancelDelete = useCallback(() => {
    setIsConfirmingDelete(false)
  }, [setIsConfirmingDelete])

  return (
    <dialog id={EditCategoryModalId} className="modal">
      <div className="modal-box overflow-visible">
        <h3>Edit Category</h3>
        <div className="flex justify-center w-full">
          <form className="w-fit flex flex-col">
            <TextField
              required
              placeholder="My Category"
              fieldName="Name"
              onChange={onChangeName}
              error={nameErr}
              value={name}
            />
          </form>
        </div>
        <div className="modal-action">
          <form method="dialog" className="flex justify-between w-full">
            <DeleteButton
              isConfirming={isConfirmingDelete}
              onAskConfirm={onAskConfirm}
              onCancelDelete={onCancelDelete}
              onDelete={onDelete}
              className={`
              `}
            />
            <button className="btn btn-primary" onClick={onSubmit}>
              Update
            </button>
            <button
              onClick={handleClose}
              className="btn btn-circle absolute text-white font-bold -top-3 -right-3 bg-error"
            >
              <CloseIcon />
            </button>
          </form>
        </div>
      </div>
    </dialog>
  )
}
