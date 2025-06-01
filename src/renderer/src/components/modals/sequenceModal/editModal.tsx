import SequenceModal from './modal'

export const EditSequenceModalId = 'edit-sequence-modal'

export default function EditSequenceModal() {
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
