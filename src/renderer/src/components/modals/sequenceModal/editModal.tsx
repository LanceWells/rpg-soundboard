import SequenceModal from './modal'

export const NewSequenceModalId = 'new-sequence-modal'

export default function NewSequenceModal() {
  return (
    <SequenceModal
      actionName="Edit"
      handleSubmit={() => {}}
      id={NewSequenceModalId}
      modalTitle="Edit Sequence"
      handleClose={() => {}}
    />
  )
}
