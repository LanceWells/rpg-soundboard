import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { useShallow } from 'zustand/shallow'
import SequenceItem from './item'
import { DndContext, DragEndEvent, useDroppable } from '@dnd-kit/core'
import { produce } from 'immer'
import { SortableContext } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

export const EditingDropZoneID = 'sequence-edit-drop-zone'

export const dropZoneScrollContainerID = 'drop-zone-scroll-container'

export default function SequenceEditingZone() {
  const { editingSequence, updateSequenceOrder } = useAudioStore(
    useShallow((state) => ({
      editingSequence: state.editingSequence,
      updateSequenceOrder: state.updateSequenceElements
    }))
  )

  const { setNodeRef, isOver, active } = useDroppable({
    id: EditingDropZoneID
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

    updateSequenceOrder(newOrder)
  }

  const seq = editingSequence?.sequence ?? []
  const editableItems = seq.map((e) => e.id) ?? []
  const sortableElements = seq.map((s) => <SequenceItem sequence={s} key={s.id} />)

  return (
    <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
      <SortableContext items={editableItems}>
        <div
          className={`
          h-full
          w-full
          max-h-full
          relative
          overflow-hidden
          bg-base-300
          transition-shadow
          border-dashed
          rounded-md
          ${
            isOver &&
            `
              inset-ring
              ring-offset-2
              brightness-125
              after:content-['+']
              after:absolute
              after:top-1/2
              after:left-1/2
              after:z-10
              after:text-9xl
              after:-translate-1/2
            `
          }
        `}
        >
          <div
            ref={setNodeRef}
            id={dropZoneScrollContainerID}
            className={`
            flex
            gap-2
            p-2
            flex-col
            h-full
            max-h-full
            overflow-y-scroll
            overflow-x-hidden
          `}
          >
            {sortableElements}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  )
}
