import CloseIcon from '@renderer/assets/icons/close'
import TextField from '@renderer/components/generic/textField'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { MouseEventHandler, useCallback } from 'react'
import { CreateRequest } from 'src/apis/audio/types/boards'
import { useShallow } from 'zustand/react/shallow'

export const NewBoardModalId = 'new-board-modal'

export type BoardModalProps = {
  id: string
  handleSubmit: (req: CreateRequest) => void
  handleClose?: () => void
  actionName: string
  modalTitle: string
}

export default function BoardModal(props: BoardModalProps) {
  const { id, actionName, handleSubmit, modalTitle, handleClose } = props

  const { setBoardName, editingBoard } = useAudioStore(
    useShallow((state) => ({
      setBoardName: state.setBoardName,
      editingBoard: state.editingBoard
    }))
  )

  const onSubmit = useCallback<MouseEventHandler>(
    (e) => {
      let failToSubmit = false

      if (!editingBoard?.name) {
        failToSubmit = true
      }

      if (failToSubmit) {
        e.preventDefault()
        return
      }

      if (!editingBoard) {
        return
      }

      handleSubmit({
        name: editingBoard.name
      })
      ;(document.getElementById(id) as HTMLDialogElement).close()
    },
    [id, editingBoard]
  )

  const onClose = useCallback(() => {
    if (handleClose) {
      handleClose()
    }
  }, [handleClose])

  return (
    <dialog id={id} className="modal">
      <div className="modal-box overflow-visible">
        <h3 className="font-bold text-lg">{modalTitle}</h3>
        <div className="flex justify-center w-full">
          <div className="w-fit flex flex-col">
            <TextField
              required
              className="w-fit"
              fieldName="Name"
              value={editingBoard?.name}
              placeholder="My Soundboard"
              onChange={(e) => {
                setBoardName(e.target.value)
              }}
            />
          </div>
        </div>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-primary" onClick={onSubmit}>
              {actionName}
            </button>
            <button
              onClick={onClose}
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
