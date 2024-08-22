import { UniqueIdentifier, useDraggable } from '@dnd-kit/core'
import { PropsWithChildren } from 'react'
import { CSS } from '@dnd-kit/utilities'
import MoveIcon from '@renderer/assets/icons/move'
import { useAudioStore } from '@renderer/stores/audioStore'
import { useShallow } from 'zustand/react/shallow'

export type DraggableProps = {
  id: UniqueIdentifier
}

export default function Draggable(props: PropsWithChildren<DraggableProps>) {
  const { id, children } = props

  const { editingMode } = useAudioStore(
    useShallow((state) => ({
      editingMode: state.editingMode
    }))
  )

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    disabled: editingMode === 'Off'
  })

  const style = {
    transform: CSS.Transform.toString({
      x: transform?.x ?? 0,
      y: transform?.y ?? 0,
      scaleX: 1.0,
      scaleY: 1.0
    })
  }

  return (
    <div className="relative" ref={setNodeRef} style={style}>
      <div ref={setNodeRef} {...attributes}>
        {children}
      </div>
      <div
        {...listeners}
        className={`
          ${editingMode === 'Off' ? 'hidden' : 'visible'}
          rounded-full
          absolute
          -bottom-4
          -left-5
          bg-primary
          cursor-pointer
        `}
      >
        <MoveIcon />
      </div>
    </div>
  )
}
