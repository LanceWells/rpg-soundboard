import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { useState } from 'react'
import { CreateSequenceRequest } from 'src/apis/audio/types/groups'
import { useShallow } from 'zustand/react/shallow'
import SequenceItem from './sequenceItem'
import TextField from '@renderer/components/generic/textField'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { produce } from 'immer'
import { SoundGroupSequenceElement } from 'src/apis/audio/types/items'

export type SequenceModalProps = {
  id: string
  handleSubmit: (req: CreateSequenceRequest) => void
  handleClose?: () => void
  actionName: string
  modalTitle: string
}

export default function SequenceModal(props: SequenceModalProps) {
  const { actionName, handleSubmit, id, modalTitle, handleClose } = props

  const { editingSequence, updateSequenceName, updateSequenceOrder } = useAudioStore(
    useShallow((state) => ({
      editingSequence: state.editingSequence,
      updateSequenceName: state.updateSequenceName,
      updateSequenceOrder: state.updateSequenceElements
    }))
  )

  const newBlankElement = () =>
    updateSequenceOrder([
      { type: 'delay', id: `seq-${crypto.randomUUID()}`, msToDelay: 0 },
      ...(editingSequence?.sequence ?? [])
    ])

  const [effectNameErr, setEffectNameErr] = useState('')

  const seq = editingSequence?.sequence ?? []
  const editableItems = seq.map((e) => e.id) ?? []
  const sortableElements = seq.map((s) => <SequenceItem sequence={s} key={s.id} />)

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    console.debug(active)
    console.debug(over)

    const newOrder = produce(seq, (draft) => {
      const activeIndex = draft.findIndex((s) => s.id === active.id)
      const overIndex = draft.findIndex((s) => s.id === over?.id)
      if (activeIndex === -1 || overIndex === -1) {
        return
      }

      const activeObjArr = draft.splice(activeIndex, 1)
      const activeObj = Array.isArray(activeObjArr) ? activeObjArr[0] : activeObjArr

      draft.splice(overIndex, 0, activeObj)
    })

    if (newOrder.length === 0) {
      return
    }

    updateSequenceOrder(newOrder as [SoundGroupSequenceElement, ...SoundGroupSequenceElement[]])
  }

  return (
    <dialog id={id} className="modal">
      <div className="modal-box min-w-fit overflow-visible relative">
        <h3 className="font-bold text-lg">{modalTitle}</h3>
        <div className='[grid-template-areas:""]'>
          <TextField
            required
            className="[grid-area:name]"
            fieldName="Name"
            value={editingSequence?.name}
            error={effectNameErr}
            placeholder="My Sequence"
            onChange={(e) => updateSequenceName(e.target.value)}
          />
          <div>
            <div>
              <DndContext onDragEnd={onDragEnd}>
                <SortableContext strategy={verticalListSortingStrategy} items={editableItems}>
                  {sortableElements}
                </SortableContext>
              </DndContext>
            </div>
            <button className="[grid-area:newbutton] btn btn-secondary" onClick={newBlankElement}>
              New Element
            </button>
          </div>
        </div>
      </div>
    </dialog>
  )
}
