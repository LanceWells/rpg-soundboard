import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { useShallow } from 'zustand/shallow'
import SequenceItem from './item'
import { DndContext, DragEndEvent, useDroppable } from '@dnd-kit/core'
import { produce } from 'immer'
import { SoundGroupSequenceElement } from 'src/apis/audio/types/items'
import { SortableContext } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

export default function SequenceEditingZone() {
  const { editingSequence, updateSequenceOrder } = useAudioStore(
    useShallow((state) => ({
      editingSequence: state.editingSequence,
      updateSequenceOrder: state.updateSequenceElements
    }))
  )

  const { setNodeRef, isOver } = useDroppable({
    id: 'sequence-edit-drop-zone'
  })

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

  const seq = editingSequence?.sequence ?? []
  const editableItems = seq.map((e) => e.id) ?? []
  const sortableElements = seq.map((s) => <SequenceItem sequence={s} key={s.id} />)

  return (
    <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
      <SortableContext items={editableItems}>
        <div
          ref={setNodeRef}
          className={`
            bg-base-300
            h-full
            rounded-md
            overflow-y-scroll
            ${isOver && `inset-ring`}
          `}
        >
          {sortableElements}
        </div>
      </SortableContext>
    </DndContext>
  )
}
