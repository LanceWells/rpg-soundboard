import { UniqueIdentifier, useDroppable } from '@dnd-kit/core'
import { useAudioStore } from '@renderer/stores/audioStore'
import { PropsWithChildren } from 'react'
import { useShallow } from 'zustand/react/shallow'

export type DroppableProps = {
  id: UniqueIdentifier
}

export default function Droppable(props: PropsWithChildren<DroppableProps>) {
  const { id, children } = props

  const { editingMode } = useAudioStore(
    useShallow((state) => ({
      editingMode: state.editingMode
    }))
  )

  const { setNodeRef } = useDroppable({
    id,
    disabled: editingMode === 'Off'
  })

  return <div ref={setNodeRef}>{children}</div>
}
