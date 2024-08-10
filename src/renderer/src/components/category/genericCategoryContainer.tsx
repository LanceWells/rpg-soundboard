import {
  useSensors,
  useSensor,
  PointerSensor,
  TouchSensor,
  DndContext,
  DragEndEvent,
  useDroppable
} from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { useAudioStore } from '@renderer/stores/audioStore'
import { useCallback, useMemo } from 'react'
import { BoardID, CategoryID, GroupID, SoundGroup } from 'src/apis/audio/interface'
import { useShallow } from 'zustand/react/shallow'
import Group from '../group/group'

export type GenericCategoryContainerProps = {
  groups: SoundGroup[]
  boardID: BoardID
  categoryID?: CategoryID
}

export default function GenericCategoryContainer(props: GenericCategoryContainerProps) {
  const { groups, boardID, categoryID } = props

  const { editingMode, setEditingMode, reorderGroups } = useAudioStore(
    useShallow((state) => ({
      setEditingMode: state.setEditingMode,
      editingMode: state.editingMode,
      getGroupsForCategory: state.getGroupsForCategory,
      reorderGroups: state.reorderGroups
    }))
  )

  const groupIDs = useMemo(() => {
    return groups.map((g) => g.id)
  }, [groups])

  const groupElements = useMemo(() => {
    return groups.map((g) => <Group boardID={boardID} group={g} key={g.id} />)
  }, [groups])

  const onDragStart = useCallback(() => {
    setEditingMode('Dragging')
  }, [editingMode, setEditingMode])

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (over === null) {
        return
      }

      const activeIndex = groupIDs.indexOf(active.id as GroupID)
      const overIndex = groupIDs.indexOf(over.id as GroupID)
      const newOrder = [...Array.from(groupIDs).values()]
      const [movingItem] = newOrder.splice(activeIndex, 1)
      newOrder.splice(overIndex, 0, movingItem)

      reorderGroups({
        boardID,
        category: categoryID,
        newOrder: newOrder
      })

      setEditingMode('Editing')
    },
    [groupIDs, reorderGroups, setEditingMode]
  )

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor))

  return (
    // <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd} sensors={sensors}>
    <SortableContext items={groupIDs}>{groupElements}</SortableContext>
    // </DndContext>
  )
}
