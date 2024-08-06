import { useAudioStore } from '@renderer/stores/audioStore'
import EffectModal from './effectModal'
import { MouseEventHandler, useCallback, useMemo } from 'react'
import { CreateGroupRequest } from 'src/apis/audio/interface'
import DeleteIcon from '@renderer/assets/icons/delete'

export const EditEffectModalId = 'edit-effect-modal'

export default function EditEffectModal() {
  const { editingGroupID, updateGroup, editingMode, setEditingMode } = useAudioStore()

  const handleSubmit = useCallback(
    (req: CreateGroupRequest) => {
      if (editingGroupID) {
        updateGroup({
          boardID: req.boardID,
          icon: req.icon,
          name: req.name,
          soundFilePaths: req.soundEffects,
          groupID: editingGroupID
        })
      }
    },
    [editingGroupID, updateGroup]
  )

  // If the modal closes, ensure that we revert back to "editing" mode. This will handle events
  // where the user begins to delete an effect, but closes the window instead.
  const handleClose = useCallback(() => {
    setEditingMode('Editing')
  }, [editingMode, setEditingMode])

  const onDelete = useCallback(() => {
    setEditingMode('Editing')
    // TODO: Call to delete effect
  }, [])

  const deleteButton = useMemo(() => {
    return <DeleteButton onDelete={onDelete} />
  }, [editingMode])

  return (
    <EffectModal
      modalTitle="Editing Effect"
      actionName="Update"
      handleSubmit={handleSubmit}
      id={EditEffectModalId}
      additionalActions={[deleteButton]}
      handleClose={handleClose}
    />
  )
}

type DeleteButtonProps = {
  onDelete: () => void
}

function DeleteButton(props: DeleteButtonProps) {
  const { onDelete } = props

  const { editingMode, setEditingMode } = useAudioStore()

  const onClickDelete = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      e.preventDefault()
      setEditingMode('Deleting')
    },
    [setEditingMode]
  )

  const onClickNope = useCallback<MouseEventHandler>(
    (e) => {
      e.preventDefault()
      setEditingMode('Editing')
    },
    [setEditingMode]
  )

  return (
    <div>
      <button
        onClick={onClickDelete}
        className={`
        ${editingMode === 'Editing' ? 'visible' : 'hidden'}
        btn
        btn-error
      `}
      >
        <DeleteIcon />
        Delete
      </button>
      <div
        className={`
        ${editingMode === 'Deleting' ? 'visible' : 'hidden'}
        flex
        items-center
        gap-4
      `}
      >
        <i>Really delete?</i>
        <button className="btn btn-primary" onClick={onClickNope}>
          Nope
        </button>
        <button className="btn btn-error" onClick={onDelete}>
          Yes, really
        </button>
      </div>
    </div>
  )
}
