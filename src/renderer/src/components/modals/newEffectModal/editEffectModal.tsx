import { useAudioStore } from '@renderer/stores/audioStore'
import EffectModal from './effectModal'
import { useCallback } from 'react'
import { CreateGroupRequest } from 'src/apis/audio/interface'

export const EditEffectModalId = 'edit-effect-modal'

export default function EditEffectModal() {
  const { editingGroupID, updateGroup } = useAudioStore()

  const handleSubmit = useCallback(
    (req: CreateGroupRequest) => {
      if (editingGroupID) {
        updateGroup({
          boardID: req.boardID,
          icon: req.icon,
          name: req.name,
          soundFilePaths: req.soundFilePaths,
          groupID: editingGroupID
        })
      }
    },
    [editingGroupID, updateGroup]
  )

  return (
    <EffectModal
      modalTitle="Editing Effect"
      actionName="Update"
      handleSubmit={handleSubmit}
      id={EditEffectModalId}
    />
  )
}
