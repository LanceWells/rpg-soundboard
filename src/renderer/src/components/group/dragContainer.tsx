import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { PropsWithChildren } from 'react'
import MoveIcon from '@renderer/assets/icons/move'

export function DragContainer({
  id,
  beingDragged,
  children
}: PropsWithChildren<{ id: string; beingDragged?: boolean }>) {
  const draggingID = useAudioStore((store) => store.draggingID)
  const editingMode = useAudioStore((store) => store.editingMode)

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: id
  })

  const style = {
    transform: CSS.Transform.toString({
      scaleX: 1.0,
      scaleY: 1.0,
      x: transform?.x ?? 0,
      y: transform?.y ?? 0
    }),
    transition
  }

  return (
    <div className={`relative ${draggingID === id && !beingDragged ? 'opacity-0' : 'opacity-100'}`}>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        role="button"
        className={`
          cursor-pointer
          hover:brightness-125
          hover:drop-shadow-lg
          hover
          z-0
          touch-none
        `}
      >
        <div
          className={`
            ${editingMode === 'Off' ? 'hidden' : 'visible'}
            absolute
            top-0
            right-0
            rounded-lg
            p-1
            bg-black
            z-10
          `}
          {...listeners}
        >
          <MoveIcon className="stroke-white" />
        </div>
        {children}
      </div>
    </div>
  )
}
