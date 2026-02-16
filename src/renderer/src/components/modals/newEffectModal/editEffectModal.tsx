import { useAudioStore } from '@renderer/stores/audio/audioStore'
import EffectModal from './effectModal'
import { useCallback, useMemo, useState } from 'react'
import DeleteButton from '@renderer/components/generic/deleteButton'
import { useShallow } from 'zustand/react/shallow'
import { CreateRequest } from 'src/apis/audio/types/groups'

export const EditEffectModalId = 'edit-effect-modal'

export default function EditEffectModal() {
  const { updateGroup, editingMode, setEditingMode, deleteGroup } = useAudioStore(
    useShallow((state) => ({
      updateGroup: state.updateGroup,
      editingMode: state.editingMode,
      setEditingMode: state.setEditingMode,
      deleteGroup: state.deleteGroup
    }))
  )

  const { source } = useAudioStore((store) => store.editingElementsV2)
  const editingGroupID = source?.id

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const handleSubmit = (req: CreateRequest) => {
    if (editingGroupID) {
      updateGroup({
        type: 'source',
        icon: req.icon,
        name: req.name,
        effects: req.effects,
        groupID: editingGroupID,
        variant: req.variant
      })
    }
  }

  // If the modal closes, ensure that we revert back to "editing" mode. This will handle events
  // where the user begins to delete an effect, but closes the window instead.
  const handleClose = useCallback(() => {
    setIsConfirmingDelete(false)
  }, [setIsConfirmingDelete])

  const onDelete = useCallback(() => {
    if (editingGroupID) {
      deleteGroup(editingGroupID)
    }
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
