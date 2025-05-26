import { useAudioStore } from '@renderer/stores/audio/audioStore'
import EffectModal from './effectModal'
import { useCallback, useMemo, useState } from 'react'
import DeleteButton from '@renderer/components/generic/deleteButton'
import { useShallow } from 'zustand/react/shallow'
import { CreateRequest } from 'src/apis/audio/types/groups'
import ChangeBoardSelect from './changeBoardSelect'

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
    (req: CreateRequest) => {
      if (editingGroupID) {
        updateGroup({
          type: 'source',
          boardID: req.boardID,
          icon: req.icon,
          name: req.name,
          effects: req.effects,
          groupID: editingGroupID,
          variant: req.variant,
          category: req.category
        })
      }
    },
    [editingGroupID, updateGroup]
  )

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

  const select = useMemo(() => <ChangeBoardSelect groupID={editingGroupID} />, [editingGroupID])

  return (
    <EffectModal
      modalTitle="Editing Effect"
      actionName="Update"
      handleSubmit={handleSubmit}
      id={EditEffectModalId}
      handleClose={handleClose}
    >
      {deleteButton}
      {select}
    </EffectModal>
  )
}
