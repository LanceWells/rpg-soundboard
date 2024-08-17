import { useAudioStore } from '@renderer/stores/audioStore'
import TextField from '../../generic/textField'
import { ChangeEventHandler, MouseEventHandler, useCallback, useState } from 'react'
import CloseIcon from '@renderer/assets/icons/close'

export const NewCategoryModalId = 'new-category-modal'

export default function NewCategoryModal() {
  const { addCategory, editingBoardID } = useAudioStore((state) => ({
    addCategory: state.addCategory,
    editingBoardID: state.editingBoardID
  }))

  const [name, setName] = useState('')
  const [nameErr, setNameErr] = useState('')

  const onChangeName = useCallback<ChangeEventHandler<HTMLInputElement>>((e) => {
    setName(e.target.value)
  }, [])

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

      if (editingBoardID) {
        addCategory({
          name: name,
          boardID: editingBoardID
        })
      }
      ;(document.getElementById(NewCategoryModalId) as HTMLDialogElement).close()
    },
    [editingBoardID, addCategory, name, setNameErr]
  )

  return (
    <dialog id={NewCategoryModalId} className="modal">
      <div className="modal-box overflow-visible">
        <h3 className="font-bold text-lg">New Category</h3>
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
          <form method="dialog">
            <button className="btn btn-primary" onClick={onSubmit}>
              Create
            </button>
            <button className="btn btn-circle absolute text-white font-bold -top-3 -right-3 bg-error">
              <CloseIcon />
            </button>
          </form>
        </div>
      </div>
    </dialog>
  )
}
