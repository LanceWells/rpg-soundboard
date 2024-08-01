import { useAudioStore } from '@renderer/stores/audioStore'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'

export const NewEffectModalId = 'new-effect-modal'

type NewEffectForm = {
  name: string
  soundFile: FileList
}

export default function NewEffectModal() {
  const { addGroup, boardBeingAddedToId } = useAudioStore()

  const { register, handleSubmit } = useForm<NewEffectForm>({})

  const onSubmit = useCallback(
    (data: NewEffectForm) => {
      console.log(data)

      if (data.soundFile.length !== 1) {
        return
      }

      const file = data.soundFile.item(0)!

      if (boardBeingAddedToId) {
        addGroup({
          boardID: boardBeingAddedToId,
          name: data.name,
          soundFilePath: file.path
        })
      }
    },
    [addGroup, boardBeingAddedToId]
  )

  return (
    <dialog id={NewEffectModalId} className="modal">
      <div className="modal-box overflow-visible">
        <h3 className="font-bold text-lg">New Effect</h3>
        <div className="flex justify-center w-full">
          <form className="w-fit flex flex-col">
            <div className="label-text w-fit mt-4">Name</div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              placeholder="My New Sound"
              {...register('name', { required: true })}
            />
            <div className="label-text w-fit mt-4">Sound File</div>
            <input
              type="file"
              className="file-input file-input-bordered w-full max-w-xs"
              {...register('soundFile', { required: true })}
            />
          </form>
        </div>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-primary" onClick={handleSubmit(onSubmit)}>
              Create
            </button>
            <button className="btn btn-circle absolute text-white font-bold -top-3 -right-3 bg-error">
              X
            </button>
          </form>
        </div>
      </div>
    </dialog>
  )
}
