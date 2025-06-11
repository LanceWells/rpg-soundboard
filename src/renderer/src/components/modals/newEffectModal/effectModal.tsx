import { useAudioStore } from '@renderer/stores/audio/audioStore'
import {
  ChangeEventHandler,
  MouseEventHandler,
  PropsWithChildren,
  useCallback,
  useMemo,
  useState
} from 'react'
import IconLookup from '../../effect/iconLookup'
import { IconEffect } from '../../effect/icon-effect'
import TextField from '../../generic/textField'
import FileSelectList, { FileSelectInput } from './fileSelectList'
import CloseIcon from '@renderer/assets/icons/close'
import { useShallow } from 'zustand/react/shallow'
import { SoundVariant } from '@renderer/utils/soundVariants'
import { CreateRequest } from 'src/apis/audio/types/groups'
import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import ColorPicker from '@renderer/components/icon/colorPicker'

export type EffectModalProps = {
  id: string
  handleSubmit: (req: CreateRequest) => void
  handleClose?: () => void
  actionName: string
  modalTitle: string
}

export default function EffectModal(props: PropsWithChildren<EffectModalProps>) {
  const { id, handleSubmit, actionName, modalTitle, children, handleClose } = props

  const {
    editingBoard,
    // editingBoardID,
    editingGroup,
    // setGroupName,
    addGroup,
    editGroup
    // resetEditingGroup,
    // setGroupVariant
  } = useAudioStore(
    useShallow((state) => ({
      // editingBoardID: state.editingBoardID,
      editingBoard: state.editingElementsV2.board,
      editingGroup: state.editingElementsV2.source,
      // editingGroup: state.editingGroup,
      // setGroupName: state.setGroupName,
      addGroup: state.addGroup,
      // resetEditingGroup: state.resetEditingGroup,
      // setGroupVariant: state.setGroupVariant,
      editGroup: state.updateEditingSourceV2
    }))
  )

  const editingBoardID = editingBoard?.id

  const [effectNameErr, setEffectNameErr] = useState('')
  const [fileListErr, setFileListErr] = useState('')

  const onClose = useCallback(() => {
    // resetEditingGroup()
    editGroup({})

    if (handleClose) {
      handleClose()
    }
  }, [editGroup, editingGroup, handleClose])

  const onSubmit = useCallback<MouseEventHandler>(
    (e) => {
      let failToSubmit = false
      if (editingGroup?.element === undefined) {
        failToSubmit = true
        return
      }

      if (editingGroup.element.effects.length === 0) {
        failToSubmit = true
        setFileListErr('This field is required')
      } else {
        setFileListErr('')
      }

      if (!editingGroup.element.name) {
        failToSubmit = true
        setEffectNameErr('This field is required')
      } else {
        setEffectNameErr('')
      }

      if (failToSubmit) {
        e.preventDefault()
        return
      }

      if (editingGroup.element.icon && editingBoardID) {
        // handleSubmit({
        //   ...editingGroup,
        //   boardID: editingBoardID,
        //   variant: editingGroup.variant,
        //   category: editingGroup.category
        // })
        handleSubmit({
          boardID: editingBoardID,
          ...editingGroup.element
        })
      }

      ;(document.getElementById(id) as HTMLDialogElement).close()
    },
    [addGroup, editingBoardID, editingGroup]
  )

  const onChangeVariant = useCallback<ChangeEventHandler<HTMLSelectElement>>(
    (e) => {
      editGroup({
        variant: e.target.value as SoundVariants
      })
      // setGroupVariant(e.target.value as SoundVariants)
    },
    [editGroup]
  )

  const selectOptions = useMemo(
    () =>
      Object.entries(SoundVariant).map(([key, value]) => (
        <option key={`opt-${key}`} value={key}>
          {value}
        </option>
      )),
    [SoundVariant]
  )

  const bgColor = editingGroup?.element?.icon.backgroundColor ?? 'grey'
  const fgColor = editingGroup?.element?.icon.foregroundColor ?? 'grey'
  const iconName = editingGroup?.element?.icon.name ?? 'moon'

  return (
    <dialog id={id} className="modal">
      <div className="modal-box max-h-2/3 min-w-fit overflow-visible relative">
        <h3 className="font-bold text-lg">{modalTitle}</h3>
        <div
          className={`
            grid
            gap-4
            [grid-template-areas:"icon_form_fileselect"_"lookup_lookup_files"_"foreground_background_toggles"]
            items-center
            w-full
          `}
        >
          <IconEffect className="[grid-area:icon]" icon={editingGroup?.element?.icon} />
          <TextField
            required
            className="w-fit [grid-area:form]"
            fieldName="Name"
            value={editingGroup?.element?.name ?? ''}
            error={effectNameErr}
            placeholder="My Sound Effect"
            onChange={(e) => editGroup({ name: e.target.value })}
          />
          <FileSelectInput error={fileListErr} className="[grid-area:fileselect]" />
          <FileSelectList className="[grid-area:files]" />
          <IconLookup
            className="[grid-area:lookup] min-h-84 max-h-84 w-full"
            bgColor={bgColor}
            fgColor={fgColor}
            onClick={(name) =>
              editGroup({
                icon: {
                  backgroundColor: bgColor,
                  foregroundColor: fgColor,
                  name
                }
              })
            }
          />
          {/* <ForegroundPicker pickerID={`default-icon-foreground-${actionName}`} />
          <BackgroundPicker pickerID={`default-icon-background-${actionName}`} /> */}
          <ColorPicker
            pickerID={`effect-foreground-${actionName}`}
            color={fgColor}
            onColorChange={function (hex: string): void {
              editGroup({
                icon: {
                  backgroundColor: bgColor,
                  foregroundColor: hex,
                  name: iconName
                }
              })
            }}
          />
          <ColorPicker
            pickerID={`effect-background-${actionName}`}
            color={bgColor}
            onColorChange={function (hex: string): void {
              editGroup({
                icon: {
                  backgroundColor: hex,
                  foregroundColor: fgColor,
                  name: iconName
                }
              })
            }}
          />
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Sound Variant</span>
            </div>
            <select
              value={editingGroup?.element?.variant ?? 'Default'}
              onChange={onChangeVariant}
              className="select select-bordered"
            >
              {selectOptions}
            </select>
          </label>
        </div>
        <div className="modal-action">
          <form method="dialog" className="w-full">
            <div className="flex justify-between">
              <div className="flex flex-row gap-2">{children}</div>
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
