import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { useAudioStore } from '@renderer/stores/audioStore'
import { PropsWithChildren, useCallback } from 'react'
import { BoardID, GroupID } from 'src/apis/audio/interface'
import { useShallow } from 'zustand/react/shallow'

export type CategoryContainerProps = {
  groupIDs: GroupID[]
  boardID: BoardID
  reorderGroups: (request: { boardID: BoardID; newOrder: GroupID[] }) => void
}

export default function CategoryContainer(props: PropsWithChildren<CategoryContainerProps>) {
  const { children, groupIDs, boardID, reorderGroups } = props

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor))

  const { setEditingMode, editingMode } = useAudioStore(
    useShallow((state) => ({
      setEditingMode: state.setEditingMode,
      editingMode: state.editingMode
    }))
  )

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (over === null) {
        return
      }

      const activeIndex = groupIDs.indexOf(active.id as GroupID)
      const overIndex = groupIDs.indexOf(over.id as GroupID)

      const arrayCopy = [...Array.from(groupIDs).values()]
      const [movingItem] = arrayCopy.splice(activeIndex, 1)
      arrayCopy.splice(overIndex, 0, movingItem)

      reorderGroups({ boardID, newOrder: arrayCopy })

      setEditingMode('Editing')
    },
    [groupIDs, boardID, reorderGroups, setEditingMode]
  )

  const onDragStart = useCallback(() => {
    setEditingMode('Dragging')
  }, [editingMode, setEditingMode])

  return (
    <div className={`grid grid-flow-col gap-6`}>
      <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd} sensors={sensors}>
        <SortableContext items={groupIDs}>{children}</SortableContext>
      </DndContext>
    </div>
  )
}
