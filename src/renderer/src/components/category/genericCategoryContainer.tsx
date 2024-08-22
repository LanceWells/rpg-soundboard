import { SortableContext } from '@dnd-kit/sortable'
import { useCallback, useMemo } from 'react'
import Group from '../group/group'
import { useAudioStore } from '@renderer/stores/audioStore'
import { BoardID } from 'src/apis/audio/types/boards'
import { SoundGroup } from 'src/apis/audio/types/items'
import { CategoryID } from 'src/apis/audio/types/categories'
import Draggable from '../dnd/draggable'
import Droppable from '../dnd/droppable'
import { DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { IdIsGroup } from '@renderer/utils/id'
import { GroupID } from 'src/apis/audio/types/groups'
import { useShallow } from 'zustand/react/shallow'

export type GenericCategoryContainerProps = {
  groups: SoundGroup[]
  boardID: BoardID
  categoryID?: CategoryID
}

export default function GenericCategoryContainer(props: GenericCategoryContainerProps) {
  const { groups, boardID } = props

  const { draggingID, setDraggingID } = useAudioStore(
    useShallow((state) => ({
      editingMode: state.editingMode,
      draggingID: state.draggingID,
      setDraggingID: state.setDraggingID
    }))
  )

  const groupIDs = useMemo(() => {
    return groups.map((g) => g.id)
  }, [groups])

  // const onDragStart = useCallback((event: DragStartEvent) => {
  //   const thisDraggingID = event.active.id
  //   if (typeof thisDraggingID === 'number') {
  //     return
  //   }

  //   if (!IdIsGroup(thisDraggingID)) {
  //     return
  //   }

  //   setDraggingID(event.active.id as GroupID)
  // }, [])

  // const onDragEnd = useCallback(() => {
  //   setDraggingID(null)
  // }, [])

  const draggingElement = useMemo(() => {
    if (draggingID === null) {
      return null
    }

    const matchingGroup = groups.find((g) => g.id === draggingID)
    if (!matchingGroup) {
      return null
    }

    return <Group boardID={boardID} group={matchingGroup} key={matchingGroup.id} />
  }, [draggingID])

  const groupElements = useMemo(() => {
    return groups.map((g) => (
      <Draggable id={g.id} key={g.id}>
        <Droppable id={g.id}>
          <Group boardID={boardID} group={g} key={g.id} />
        </Droppable>
      </Draggable>
    ))
  }, [groups])

  // return <SortableContext items={groupIDs}>{groupElements}</SortableContext>
  // return <>{groupElements}</>
  return (
    <>
      {groupElements}
      <DragOverlay>{draggingElement}</DragOverlay>
    </>
  )
}

/**
 * import { SortableContext } from '@dnd-kit/sortable'
import { useCallback, useMemo } from 'react'
import Group from '../group/group'
import { useAudioStore } from '@renderer/stores/audioStore'
import { BoardID } from 'src/apis/audio/types/boards'
import { SoundGroup } from 'src/apis/audio/types/items'
import { CategoryID } from 'src/apis/audio/types/categories'
import { DndContext, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { useShallow } from 'zustand/react/shallow'
import { IdIsGroup } from '@renderer/utils/id'
import { GroupID } from 'src/apis/audio/types/groups'
import Draggable from '../draggable/draggable'

export type GenericCategoryContainerProps = {
  groups: SoundGroup[]
  boardID: BoardID
  categoryID?: CategoryID
}

export default function GenericCategoryContainer(props: GenericCategoryContainerProps) {
  const { groups, boardID } = props

  const { draggingID, setDraggingID } = useAudioStore(
    useShallow((state) => ({
      editingMode: state.editingMode,
      draggingID: state.draggingID,
      setDraggingID: state.setDraggingID
    }))
  )

  const groupIDs = useMemo(() => {
    return groups.map((g) => g.id)
  }, [groups])

  const groupElements = useMemo(() => {
    return groups.map((g) => (
      <Draggable key={g.id} id={g.id}>
        <Group boardID={boardID} group={g} key={g.id} />
      </Draggable>
    ))
  }, [groups])

  const onDragStart = useCallback((event: DragStartEvent) => {
    const thisDraggingID = event.active.id
    if (typeof thisDraggingID === 'number') {
      return
    }

    if (!IdIsGroup(thisDraggingID)) {
      return
    }

    setDraggingID(event.active.id as GroupID)
  }, [])

  const onDragEnd = useCallback(() => {
    setDraggingID(null)
  }, [])

  const draggingElement = useMemo(() => {
    if (draggingID === null) {
      return null
    }

    const matchingGroup = groups.find((g) => g.id === draggingID)
    if (!matchingGroup) {
      return null
    }

    return <Group boardID={boardID} group={matchingGroup} key={matchingGroup.id} />
  }, [draggingID])

  return (
    <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      {groupElements}
      <DragOverlay>{draggingElement}</DragOverlay>
    </DndContext>
  )
}

 */
