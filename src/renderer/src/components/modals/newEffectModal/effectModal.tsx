import { useAudioStore } from '@renderer/stores/audioStore'
import {
  ChangeEventHandler,
  MouseEventHandler,
  PropsWithChildren,
  useCallback,
  useState
} from 'react'
import IconLookup from '../../effect/iconLookup'
import { ColorResult } from 'react-color'
import { IconEffect } from '../../effect/icon-effect'
import ColorPicker from './colorPicker'
import TextField from './textField'
import FileSelectList, { FileSelectInput } from './fileSelectList'
import { CreateGroupRequest } from 'src/apis/audio/interface'
import CheckboxField from './checkboxField'
import CloseIcon from '@renderer/assets/icons/close'
import { useShallow } from 'zustand/react/shallow'

export type EffectModalProps = {
  id: string
  handleSubmit: (req: CreateGroupRequest) => void
  handleClose?: () => void
  actionName: string
  modalTitle: string
}

export default function EffectModal(props: PropsWithChildren<EffectModalProps>) {
  const { id, handleSubmit, actionName, modalTitle, children, handleClose } = props

  const {
    editingBoardID,
    editingGroup,
    setGroupName,
    addGroup,
    setSelectedIcon,
    resetEditingGroup,
    setGroupRepeating,
    setFadeIn,
    setFadeOut
  } = useAudioStore(
    useShallow((state) => ({
      editingBoardID: state.editingBoardID,
      editingGroup: state.editingGroup,
      setGroupName: state.setGroupName,
      addGroup: state.addGroup,
      setSelectedIcon: state.setSelectedIcon,
      resetEditingGroup: state.resetEditingGroup,
      setGroupRepeating: state.setGroupRepeating,
      setFadeIn: state.setFadeIn,
      setFadeOut: state.setFadeOut
    }))
  )

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

  const handleRepeatsCheck = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      setGroupRepeating(e.target.checked)
    },
    [setGroupRepeating, editingGroup.repeats]
  )

  const handleFadeInCheck = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      setFadeIn(e.target.checked)
    },
    [setFadeIn, editingGroup.fadeIn]
  )

  const handleFadeOutCheck = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      setFadeOut(e.target.checked)
    },
    [setFadeOut, editingGroup.fadeOut]
  )

  const onClose = useCallback(() => {
    resetEditingGroup()
    if (handleClose) {
      handleClose()
    }
  }, [resetEditingGroup, editingGroup, handleClose])

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

      if (editingGroup.icon && editingBoardID) {
        handleSubmit({
          boardID: editingBoardID,
          ...editingGroup
        })
      }

      ;(document.getElementById(id) as HTMLDialogElement).close()
    },
    [addGroup, editingBoardID, editingGroup]
  )

  return (
    <dialog id={id} className="modal">
      <div className="modal-box min-w-fit overflow-visible relative">
        <h3 className="font-bold text-lg">{modalTitle}</h3>
        <div
          className={`
            grid
            gap-4
            [grid-template-areas:_"icon_form_fileselect"_"lookup_lookup_files"_"foreground_background_toggles"]
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
            placeholder="My Sound Effect"
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
          <div className="flex [grid-area:toggles]">
            <CheckboxField
              formName="Repeat?"
              className="[grid-area:repeat]"
              checked={editingGroup.repeats}
              onChange={handleRepeatsCheck}
            />
            <CheckboxField
              formName="Fade In?"
              className="[grid-area:repeat]"
              checked={editingGroup.fadeIn}
              onChange={handleFadeInCheck}
            />
            <CheckboxField
              formName="Fade-Out?"
              className="[grid-area:repeat]"
              checked={editingGroup.fadeOut}
              onChange={handleFadeOutCheck}
            />
          </div>
        </div>
        <div className="modal-action">
          <form method="dialog" className="w-full">
            <div className="flex justify-between">
              <div>{children}</div>
              <button type="submit" className="btn btn-primary" onClick={onSubmit}>
                {actionName}
              </button>
            </div>
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
