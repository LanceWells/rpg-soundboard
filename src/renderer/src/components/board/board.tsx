import { useCallback, useMemo, useState } from 'react'
import { useAudioStore } from '@renderer/stores/audioStore'
import {
  closestCenter,
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  pointerWithin
} from '@dnd-kit/core'
import DeleteButton from '../generic/deleteButton'
import { useShallow } from 'zustand/react/shallow'
import Category from '../category/categorized'
import { IdIsCategory, IdIsGroup } from '@renderer/utils/id'
import { SortableContext } from '@dnd-kit/sortable'
import { SoundBoard } from 'src/apis/audio/types/items'
import { BoardID } from 'src/apis/audio/types/boards'
import Group from '../group/group'
import { CategoryID } from 'src/apis/audio/types/categories'
import { GroupID } from 'src/apis/audio/types/groups'

/**
 * Props for {@link Board}.
 */
export type BoardProps = {
  /**
   * The soundboard to be represented by this component.
   */
  board: SoundBoard
}

/**
 * A container for a {@link SoundBoard} object. This is the base container that includes all
 * selectable sound effect buttons, as well as the categories that might contain them.
 *
 * @param props See {@link BoardProps}.
 */
export default function Board(props: BoardProps) {
  const { board } = props
  const {
    editingMode,
    setEditingMode,
    reorderGroups,
    deleteBoard,
    updateGroupPartial,
    getGroupsForCategory,
    getUncategorizedGroups,
    reorderCategories,
    draggingID,
    setDraggingID
  } = useAudioStore(
    useShallow((state) => ({
      editingMode: state.editingMode,
      setEditingMode: state.setEditingMode,
      reorderGroups: state.reorderGroups,
      deleteBoard: state.deleteBoard,
      updateGroupPartial: state.updateGroupPartial,
      getGroupsForCategory: state.getGroupsForCategory,
      getUncategorizedGroups: state.getUncategorizedGroups,
      reorderCategories: state.reorderCategories,
      draggingID: state.draggingID,
      setDraggingID: state.setDraggingID
    }))
  )

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const {
    elements: categoryElements,
    categoryIDs,
    groupIDs
  } = useMemo(() => {
    const categories = board.categories ?? []
    const categoryIDs = categories.map((c) => c.id)
    const groupIDs = new Set(board.groups.map((g) => g.id))
    const elements = categories.map((c) => <Category boardID={board.id} category={c} key={c.id} />)

    return {
      categoryIDs,
      groupIDs,
      elements
    }
  }, [board.categories, board.groups, board.id])

  const groupCategories = board.groups.map((g) => g.category)

  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      if (IdIsCategory(draggingID)) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter((c) => IdIsCategory(c.id))
        })
      }

      // This should be the only other possible path, but add this check anyway JIC we decide to add
      // new container types.
      if (IdIsGroup(draggingID)) {
        const intersectingCategories = pointerWithin(args).filter((c) => IdIsCategory(c.id))

        // If we're not over any containers, assume that we're dragging this group into the
        // uncategorized section.
        if (intersectingCategories.length === 0) {
          return []
        }

        const overCategory = intersectingCategories[0]
        const overCategoryGroups = getGroupsForCategory(overCategory.id as CategoryID)
        const overCategoryGroupIDs = overCategoryGroups.map((g) => g.id)

        if (!overCategoryGroupIDs.includes(draggingID)) {
          return [overCategory]
        }

        const closestGroupInCategory = closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter((c) =>
            overCategoryGroupIDs.includes(c.id as GroupID)
          )
        })

        return closestGroupInCategory
      }

      return []
    },
    [draggingID, categoryIDs, groupIDs]
  )

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      const activeID = active.id as string

      setDraggingID(null)
      setEditingMode('Editing')

      // If over is null, it means that we dragged an item into a space that does not collide with
      // any droppable area. When that happens, it's most likely that we're dragging a group out of
      // a container.
      if (over === null) {
        return
      }

      const overID = over.id as string

      // Not sure if this can happen, but if the over target is in a category, and active is in a
      // different category, the primary action should be to change the active item's category to
      // the category for the over item.
      if (IdIsGroup(overID) && IdIsGroup(activeID)) {
        const overGroup = board.groups.find((g) => g.id === overID)
        const activeGroup = board.groups.find((g) => g.id === activeID)

        if (!overGroup || !activeGroup) {
          return
        }

        if (overGroup?.category !== activeGroup?.category) {
          updateGroupPartial(board.id, activeID, {
            category: overGroup?.category
          })
          return
        }

        // Alternatively, if they have the same category, then that means that we want to move the
        // active group into the position of the target group.
        const category = activeGroup.category
        const categoryGroups = category
          ? getGroupsForCategory(category)
          : getUncategorizedGroups({ boardID: board.id }).groups

        const categoryGroupIDs = categoryGroups.map((c) => c.id)
        const activeIndex = categoryGroupIDs.indexOf(activeID)
        const overIndex = categoryGroupIDs.indexOf(overID)

        // Make a copy of the array so that we're not modifying the original.
        const newOrder = [...Array.from(categoryGroupIDs).values()]

        // Remove the item from the array, at the location that it was.
        const [movingItem] = newOrder.splice(activeIndex, 1)

        // Use splice to insert an item at the intended position, not removing anything in the
        // process.
        newOrder.splice(overIndex, 0, movingItem)

        reorderGroups({
          boardID: board.id,
          category,
          newOrder
        })

        return
      }

      // If we're moving a category onto another category, reorganize them.
      if (IdIsCategory(activeID) && IdIsCategory(overID)) {
        const activeIndex = categoryIDs.indexOf(activeID)
        const overIndex = categoryIDs.indexOf(overID)

        // Make a copy of the array so that we're not modifying the original.
        const newOrder = [...Array.from(categoryIDs).values()]

        // Remove the item from the array, at the location that it was.
        const [movingItem] = newOrder.splice(activeIndex, 1)

        // Use splice to insert an item at the intended position, not removing anything in the
        // process.
        newOrder.splice(overIndex, 0, movingItem)

        reorderCategories({
          boardID: board.id,
          newOrder: newOrder
        })
        return
      }

      // If we're moving a group onto a category, and it's different from the group's category, then
      // assign that group to the over category.
      if (IdIsGroup(activeID) && IdIsCategory(overID)) {
        const activeGroup = board.groups.find((g) => g.id === activeID)

        if (activeGroup?.category !== overID) {
          updateGroupPartial(board.id, activeID, {
            category: overID
          })
          return
        }
      }

      return
    },
    [categoryIDs, board.id, board.groups, groupCategories, board.categories, JSON.stringify(board)]
  )

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const activeID = event.active.id

      setEditingMode('Dragging')
      setDraggingID(activeID as string)
    },
    [editingMode, setEditingMode]
  )

  const onDelete = useCallback(() => {
    deleteBoard(board.id)
  }, [deleteBoard, board.id])

  const onAskConfirm = useCallback(() => {
    setIsConfirmingDelete(true)
  }, [setIsConfirmingDelete])

  const onCancelDelete = useCallback(() => {
    setIsConfirmingDelete(false)
  }, [setIsConfirmingDelete])

  return (
    <div
      className={`
        p-4
        rounded-lg
        shadow-sm
        mx-4
        items-center
        grid
        content-between
        relative
        h-full
        max-h-full
        [grid-template-areas:_"categories_categories_categories"_"groups_groups_groups"_"delete_._."]
        [grid-template-columns:_max-content_1fr_min-content]
        [grid-template-rows:_max-content_1fr_80px]
    `}
    >
      <DndContext
        collisionDetection={collisionDetectionStrategy}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="flex flex-col flex-wrap gap-6 justify-center [grid-area:categories]">
          <SortableContext items={categoryIDs} disabled={editingMode == 'Off'}>
            {categoryElements}
          </SortableContext>
        </div>
        <DragOverlay adjustScale={false}>
          {getOverlaidItem({ boardID: board.id, id: draggingID })}
        </DragOverlay>
      </DndContext>
      <DeleteButton
        onAskConfirm={onAskConfirm}
        onCancelDelete={onCancelDelete}
        isConfirming={isConfirmingDelete}
        onDelete={onDelete}
        className={`
          absolute
          bottom-0
          w-max
          justify-self-start
          [grid-area:delete]
        `}
      />
    </div>
  )
}

type getOverlaidItemProps = {
  id: string | null
  boardID: BoardID
}

export function getOverlaidItem(props: getOverlaidItemProps) {
  const { id, boardID } = props

  const { getCategory, getGroup } = useAudioStore(
    useShallow((state) => ({
      getCategory: state.getCategory,
      getGroup: state.getGroup
    }))
  )

  if (id === null) {
    return <></>
  }

  if (IdIsCategory(id)) {
    const { category } = getCategory({ categoryID: id })

    if (!category) {
      return <></>
    }

    return <Category boardID={boardID} category={category} beingDragged={true} />
  }

  if (IdIsGroup(id)) {
    const group = getGroup(id)

    if (!group) {
      return <></>
    }

    return <Group boardID={boardID} group={group} beingDragged={true} />
  }

  return <></>
}
