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
    <div
      data-something="test"
      ref={setNodeRef}
      {...attributes}
      style={style}
      className={`
        z-0
        ${draggingID === id && !beingDragged ? 'opacity-0' : 'opacity-100'}
      `}
    >
      <div
        {...listeners}
        className={`
          z-10
          ${editingMode === 'Off' ? 'hidden' : 'visible'}
          rounded-full
          absolute
          -top-2
          -left-2
          bg-primary
        `}
      >
        <MoveIcon />
      </div>
      {children}
    </div>
  )
}
