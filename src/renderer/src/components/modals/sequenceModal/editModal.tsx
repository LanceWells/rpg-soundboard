import { useAudioStore } from '@renderer/stores/audio/audioStore'
import SequenceModal from './modal'
import { CreateSequenceRequest } from 'src/apis/audio/types/groups'

export const EditSequenceModalId = 'edit-sequence-modal'

export default function EditSequenceModal() {
  // const editingID = useAudioStore((store) => store.editingGroupID)
  const { sequence } = useAudioStore((store) => store.editingElementsV2)
  const updateSequence = useAudioStore((state) => state.updateSequencePartial)
  const editingID = sequence?.id

  const handleSubmit = (req: CreateSequenceRequest) => {
    if (!editingID) {
      return
    }

    updateSequence(editingID, req)
  }

  return (
    <SequenceModal
      actionName="Edit"
      handleSubmit={handleSubmit}
      id={EditSequenceModalId}
      modalTitle="Edit Sequence"
      handleClose={() => {}}
    />
  )
}
