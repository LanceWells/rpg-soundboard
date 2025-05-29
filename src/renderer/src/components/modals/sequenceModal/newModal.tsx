import SequenceModal from './modal'

export const NewSequenceModalId = 'new-sequence-modal'

export default function NewSequenceModal() {
  return (
    <SequenceModal
      actionName="Create"
      handleSubmit={() => {}}
      id={NewSequenceModalId}
      modalTitle="Create New Sequence"
      handleClose={() => {}}
    />
  )
}
