import CloseIcon from '@renderer/assets/icons/close'
import { useAudioStore } from '@renderer/stores/audioStore'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'

export const NewBoardModalId = 'new-board-modal'

type NewBoardForm = {
  name: string
}

export default function NewBoardModal() {
  const addBoard = useAudioStore((state) => state.addBoard)

  const { register, handleSubmit } = useForm<NewBoardForm>({})

  const onSubmit = useCallback(
    (data: NewBoardForm) => {
      addBoard({
        name: data.name
      })
      ;(document.getElementById(NewBoardModalId) as HTMLDialogElement).close()
    },
    [addBoard]
  )

  return (
    <dialog id={NewBoardModalId} className="modal">
      <div className="modal-box overflow-visible">
        <h3 className="font-bold text-lg">New Board</h3>
        <div className="flex justify-center w-full">
          <form className="w-fit flex flex-col">
            <div className="label-text w-fit mt-4">Name</div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              placeholder="New Board"
              {...register('name', { required: true })}
            />
          </form>
        </div>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-primary" onClick={handleSubmit(onSubmit)}>
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
