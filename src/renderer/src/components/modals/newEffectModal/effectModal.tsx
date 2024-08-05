import { useAudioStore } from '@renderer/stores/audioStore'
import { MouseEventHandler, useCallback, useState } from 'react'
import IconLookup from '../../effect/iconLookup'
import { ColorResult } from 'react-color'
import { IconEffect } from '../../effect/icon-effect'
import ColorPicker from './colorPicker'
import TextField from './textField'
import FileSelectList, { FileSelectInput } from './fileSelectList'
import { BoardID, NewEffectData, SoundIcon } from 'src/apis/audio/interface'

export type EffectModalProps = {
  id: string
  handleSubmit: (req: {
    name: string
    boardID: BoardID
    soundFilePaths: NewEffectData[]
    icon: SoundIcon
  }) => void
  actionName: string
  modalTitle: string
}

export default function EffectModal(props: EffectModalProps) {
  const { id, handleSubmit, actionName, modalTitle } = props

  const {
    groupName,
    setGroupName,
    addGroup,
    boardBeingAddedToId,
    selectedIcon,
    setSelectedIcon,
    workingFileList
  } = useAudioStore()

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

      if (workingFileList.length === 0) {
        failToSubmit = true
        setFileListErr('This field is required')
      } else {
        setFileListErr('')
      }

      if (!groupName) {
        failToSubmit = true
        setEffectNameErr('This field is required')
      } else {
        setEffectNameErr('')
      }

      if (failToSubmit) {
        e.preventDefault()
        return
      }

      if (selectedIcon && boardBeingAddedToId) {
        handleSubmit({
          boardID: boardBeingAddedToId,
          name: groupName,
          soundFilePaths: workingFileList,
          icon: selectedIcon
        })
      }

      ;(document.getElementById(id) as HTMLDialogElement).close()
    },
    [addGroup, boardBeingAddedToId, selectedIcon, groupName, workingFileList]
  )

  return (
    <dialog id={id} className="modal">
      <div className="modal-box min-w-fit overflow-visible relative">
        <h3 className="font-bold text-lg">{modalTitle}</h3>
        <div
          className={`
            grid
            gap-4
            [grid-template-areas:_"icon_form_fileselect"_"lookup_lookup_files"_"foreground_background_files"]
            items-center
            w-full
          `}
        >
          <IconEffect className="[grid-area:_icon]" icon={selectedIcon} />
          <TextField
            required
            className="w-fit [grid-area:_form]"
            formName="Name"
            value={groupName}
            error={effectNameErr}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <FileSelectInput error={fileListErr} className="[grid-area:_fileselect]" />
          <FileSelectList className="[grid-area:_files]" />
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
