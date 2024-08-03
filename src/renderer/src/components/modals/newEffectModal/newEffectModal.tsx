import { useAudioStore } from '@renderer/stores/audioStore'
import { MouseEventHandler, useCallback, useState } from 'react'
import IconLookup from '../../effect/iconLookup'
import { ColorResult } from 'react-color'
import { IconEffect } from '../../effect/icon-effect'
import ColorPicker from './colorPicker'
import FileSelector from './fileSelector'
import TextField from './textField'

export const NewEffectModalId = 'new-effect-modal'

export type NewEffectForm = {
  name: string
  soundFile: FileList
}

export default function NewEffectModal() {
  const { addGroup, boardBeingAddedToId, selectedIcon, setSelectedIcon } = useAudioStore()

  const [effectName, setEffectName] = useState('')
  const [fileList, setFileList] = useState(null as FileList | null)
  const [effectNameErr, setEffectNameErr] = useState('')
  const [fileListErr, setFileListErr] = useState('')

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

  const onSubmit = useCallback<MouseEventHandler>(
    (e) => {
      let failToSubmit = false

      if (fileList === null) {
        failToSubmit = true
        setFileListErr('This field is required')
      }

      if (fileList?.length !== 1) {
        failToSubmit = true
        setFileListErr('This field is required')
      }

      if (!effectName) {
        failToSubmit = true
        setEffectNameErr('This field is required')
      }

      if (failToSubmit) {
        e.preventDefault()
        return
      }

      const file = fileList!.item(0)!

      if (selectedIcon && boardBeingAddedToId) {
        addGroup({
          boardID: boardBeingAddedToId,
          name: effectName,
          soundFilePath: file.path,
          icon: selectedIcon
        })
      }

      ;(document.getElementById(NewEffectModalId) as HTMLDialogElement).close()
    },
    [addGroup, boardBeingAddedToId, selectedIcon, effectName, fileList]
  )

  return (
    <dialog id={NewEffectModalId} className="modal">
      <div className="modal-box min-w-fit overflow-visible relative">
        <h3 className="font-bold text-lg">New Effect</h3>
        <div className='grid [grid-template-areas:_"icon_form_form"_"lookup_lookup_lookup"_"foreground_._background"_"error_error_error"] items-center w-full'>
          <IconEffect className="[grid-area:_icon]" icon={selectedIcon} />
          <form className="w-fit flex flex-col [grid-area:_form]">
            <TextField
              required
              formName="Name"
              value={effectName}
              error={effectNameErr}
              onChange={(e) => setEffectName(e.target.value)}
            />
            <FileSelector
              required
              formName="Sound File"
              error={fileListErr}
              onChange={(e) => setFileList(e.target.files)}
            />
          </form>
          <IconLookup className="[grid-area:_lookup] w-full" />
          <ColorPicker
            title="Foreground"
            color={selectedIcon.foregroundColor}
            onColorChange={handleForegroundSelect}
            className="[grid-area:_foreground]"
          />
          <ColorPicker
            title="Background"
            color={selectedIcon.backgroundColor}
            onColorChange={handleBackgroundSelect}
            className="[grid-area:_background]"
          />
        </div>
        <div className="modal-action">
          <form method="dialog">
            <button type="submit" className="btn btn-primary" onClick={onSubmit}>
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
