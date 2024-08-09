import { useAudioStore } from '@renderer/stores/audioStore'
import EffectModal from './effectModal'
import { useCallback, useMemo, useState } from 'react'
import { CreateGroupRequest } from 'src/apis/audio/interface'
import DeleteButton from '@renderer/components/generic/deleteButton'
import { useShallow } from 'zustand/react/shallow'

export const EditEffectModalId = 'edit-effect-modal'

export default function EditEffectModal() {
  const { editingGroupID, updateGroup, editingMode, setEditingMode, deleteGroup } = useAudioStore(
    useShallow((state) => ({
      editingGroupID: state.editingGroupID,
      updateGroup: state.updateGroup,
      editingMode: state.editingMode,
      setEditingMode: state.setEditingMode,
      deleteGroup: state.deleteGroup
    }))
  )

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const handleSubmit = useCallback(
    (req: CreateGroupRequest) => {
      if (editingGroupID) {
        updateGroup({
          boardID: req.boardID,
          icon: req.icon,
          name: req.name,
          effects: req.effects,
          groupID: editingGroupID,
          repeats: req.repeats,
          fadeIn: req.fadeIn,
          fadeOut: req.fadeOut
        })
      }
    },
    [editingGroupID, updateGroup]
  )

  // If the modal closes, ensure that we revert back to "editing" mode. This will handle events
  // where the user begins to delete an effect, but closes the window instead.
  const handleClose = useCallback(() => {
    setEditingMode('Editing')
    setIsConfirmingDelete(false)
  }, [editingMode, setEditingMode])

  const onDelete = useCallback(() => {
    if (editingGroupID) {
      deleteGroup(editingGroupID)
    }

    setEditingMode('Editing')
  }, [editingGroupID, deleteGroup, setEditingMode])

  const onAskConfirm = useCallback(() => {
    setIsConfirmingDelete(true)
  }, [setIsConfirmingDelete])

  const onCancelDelete = useCallback(() => {
    setIsConfirmingDelete(false)
  }, [setIsConfirmingDelete])

  const deleteButton = useMemo(() => {
    return (
      <DeleteButton
        onAskConfirm={onAskConfirm}
        onCancelDelete={onCancelDelete}
        isConfirming={isConfirmingDelete}
        onDelete={onDelete}
      />
    )
  }, [editingMode, onDelete, isConfirmingDelete])

  return (
    <EffectModal
      modalTitle="Editing Effect"
      actionName="Update"
      handleSubmit={handleSubmit}
      id={EditEffectModalId}
      handleClose={handleClose}
    >
      {deleteButton}
    </EffectModal>
  )
}
