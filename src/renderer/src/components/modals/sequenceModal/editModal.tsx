import { useAudioStore } from '@renderer/stores/audio/audioStore'
import SequenceModal from './modal'

export const EditSequenceModalId = 'edit-sequence-modal'

export default function EditSequenceModal() {
  const f = useAudioStore((state) => state.updateSequenceName)

  return (
    <SequenceModal
      actionName="Edit"
      handleSubmit={() => {}}
      id={EditSequenceModalId}
      modalTitle="Edit Sequence"
      handleClose={() => {}}
    />
  )
}
