import { useAudioStore } from '@renderer/stores/audioStore'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import IconLookup from '../effect/iconLookup'
import { ColorResult } from 'react-color'
import ColorPicker from './colorPicker'
import { IconEffect } from '../effect/icon-effect'

export const NewEffectModalId = 'new-effect-modal'

type NewEffectForm = {
  name: string
  soundFile: FileList
}

export default function NewEffectModal() {
  const { addGroup, boardBeingAddedToId, selectedIcon, setSelectedIcon } = useAudioStore()

  const { register, handleSubmit } = useForm<NewEffectForm>({})

  const handleForegroundSelect = useCallback(
    (c: ColorResult) => {
      setSelectedIcon({
        backgroundColor: selectedIcon.backgroundColor,
        foregroundColor: c.hex,
        name: selectedIcon.name
      })
    },
    [selectedIcon.backgroundColor, selectedIcon.foregroundColor, selectedIcon.name, setSelectedIcon]
  )

  const handleBackgroundSelect = useCallback(
    (c: ColorResult) => {
      setSelectedIcon({
        backgroundColor: c.hex,
        foregroundColor: selectedIcon.foregroundColor,
        name: selectedIcon.name
      })
    },
    [selectedIcon.backgroundColor, selectedIcon.foregroundColor, selectedIcon.name, setSelectedIcon]
  )

  const onSubmit = useCallback(
    (data: NewEffectForm) => {
      if (data.soundFile.length !== 1) {
        return
      }

      const file = data.soundFile.item(0)!

      if (selectedIcon && boardBeingAddedToId) {
        addGroup({
          boardID: boardBeingAddedToId,
          name: data.name,
          soundFilePath: file.path,
          icon: selectedIcon
        })
      }

      ;(document.getElementById(NewEffectModalId) as HTMLDialogElement).close()
    },
    [addGroup, boardBeingAddedToId, selectedIcon]
  )

  return (
    <dialog id={NewEffectModalId} className="modal">
      <div className="modal-box overflow-visible relative">
        <h3 className="font-bold text-lg">New Effect</h3>
        <div className="absolute left-1 bottom-1">
          <IconEffect icon={selectedIcon} />
        </div>
        <div className="flex flex-col items-center w-full">
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
          <IconLookup />
          <div className="flex gap-6 w-fit">
            <ColorPicker
              title="Foreground"
              color={selectedIcon.foregroundColor}
              onColorChange={handleForegroundSelect}
            />
            <ColorPicker
              title="Background"
              color={selectedIcon.backgroundColor}
              onColorChange={handleBackgroundSelect}
            />
          </div>
        </div>
        <div className="modal-action">
          <form method="dialog">
            <button type="submit" className="btn btn-primary" onClick={handleSubmit(onSubmit)}>
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
