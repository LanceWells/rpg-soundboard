import { useAudioStore } from '@renderer/stores/audioStore'
import { MouseEventHandler, useCallback, useState } from 'react'
import IconLookup from '../../effect/iconLookup'
import { ColorResult } from 'react-color'
import { IconEffect } from '../../effect/icon-effect'
import ColorPicker from './colorPicker'
import TextField from './textField'
import FileSelectList, { FileSelectInput } from './fileSelectList'
import { CreateGroupRequest } from 'src/apis/audio/interface'
import CheckboxField from './checkboxField'

export type EffectModalProps = {
  id: string
  handleSubmit: (req: CreateGroupRequest) => void
  actionName: string
  modalTitle: string
}

export default function EffectModal(props: EffectModalProps) {
  const { id, handleSubmit, actionName, modalTitle } = props

  const {
    setGroupName,
    addGroup,
    effectBoardID: boardBeingAddedToId,
    setSelectedIcon,
    editingGroup
  } = useAudioStore()

  const [effectNameErr, setEffectNameErr] = useState('')
  const [fileListErr, setFileListErr] = useState('')

  const handleForegroundSelect = useCallback(
    (c: ColorResult) => {
      setSelectedIcon({
        backgroundColor: editingGroup.icon.backgroundColor,
        foregroundColor: c.hex,
        name: editingGroup.icon.name
      })
    },
    [editingGroup, setSelectedIcon]
  )

  const handleBackgroundSelect = useCallback(
    (c: ColorResult) => {
      setSelectedIcon({
        backgroundColor: c.hex,
        foregroundColor: editingGroup.icon.foregroundColor,
        name: editingGroup.icon.name
      })
    },
    [editingGroup.icon, setSelectedIcon]
  )

  const onSubmit = useCallback<MouseEventHandler>(
    (e) => {
      let failToSubmit = false

      if (editingGroup.effects.length === 0) {
        failToSubmit = true
        setFileListErr('This field is required')
      } else {
        setFileListErr('')
      }

      if (!editingGroup.name) {
        failToSubmit = true
        setEffectNameErr('This field is required')
      } else {
        setEffectNameErr('')
      }

      if (failToSubmit) {
        e.preventDefault()
        return
      }

      if (editingGroup.icon && boardBeingAddedToId) {
        handleSubmit({
          boardID: boardBeingAddedToId,
          icon: editingGroup.icon,
          name: editingGroup.name,
          soundFilePaths: editingGroup.effects
        })
      }

      ;(document.getElementById(id) as HTMLDialogElement).close()
    },
    [addGroup, boardBeingAddedToId, editingGroup]
  )

  return (
    <dialog id={id} className="modal">
      <div className="modal-box min-w-fit overflow-visible relative">
        <h3 className="font-bold text-lg">{modalTitle}</h3>
        <div
          className={`
            grid
            gap-4
            [grid-template-areas:_"icon_form_fileselect"_"lookup_lookup_files"_"foreground_background_repeat"]
            items-center
            w-full
          `}
        >
          <IconEffect className="[grid-area:_icon]" icon={editingGroup.icon} />
          <TextField
            required
            className="w-fit [grid-area:_form]"
            formName="Name"
            value={editingGroup.name}
            error={effectNameErr}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <FileSelectInput error={fileListErr} className="[grid-area:_fileselect]" />
          <FileSelectList className="[grid-area:_files]" />
          <IconLookup className="[grid-area:_lookup] w-full" />
          <ColorPicker
            title="Foreground"
            color={editingGroup.icon.foregroundColor}
            onColorChange={handleForegroundSelect}
            className="[grid-area:_foreground]"
          />
          <ColorPicker
            title="Background"
            color={editingGroup.icon.backgroundColor}
            onColorChange={handleBackgroundSelect}
            className="[grid-area:_background]"
          />
          <CheckboxField formName="Repeat?" className="[grid-area:repeat]" />
        </div>
        <div className="modal-action">
          <form method="dialog">
            <button type="submit" className="btn btn-primary" onClick={onSubmit}>
              {actionName}
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
