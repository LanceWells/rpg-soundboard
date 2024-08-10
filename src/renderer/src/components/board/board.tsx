import { ChangeEvent, ChangeEventHandler, act, useCallback, useMemo, useState } from 'react'
import { GroupID, SoundBoard } from 'src/apis/audio/interface'
import { EditingMode, useAudioStore } from '@renderer/stores/audioStore'
import { NewEffectModalId } from '../modals/newEffectModal/newEffectModal'
import AddIcon from '@renderer/assets/icons/add'
import PencilIcon from '@renderer/assets/icons/pencil'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import TextField from '../modals/newEffectModal/textField'
import debounce from 'debounce'
import DeleteButton from '../generic/deleteButton'
import { useShallow } from 'zustand/react/shallow'
import { NewCategoryModalId } from '../modals/newCategoryModal/newCategoryModal'
import Category from '../category/categorized'
import { IdIsCategory, IdIsGroup } from '@renderer/utils/id'
import Uncategorized from '../category/uncategorized'
import { SortableContext } from '@dnd-kit/sortable'

const UncategorizedGroupId = 'uncategorized-groups'

export type BoardProps = {
  board: SoundBoard
}

export default function Board(props: BoardProps) {
  const { board } = props
  const {
    editingMode,
    setEditingBoardID,
    setEditingMode,
    reorderGroups,
    updateBoard,
    deleteBoard,
    updateGroupPartial,
    getGroupsForCategory,
    getUncategorizedGroups
  } = useAudioStore(
    useShallow((state) => ({
      editingMode: state.editingMode,
      setEditingBoardID: state.setEditingBoardID,
      setEditingMode: state.setEditingMode,
      reorderGroups: state.reorderGroups,
      updateBoard: state.updateBoard,
      deleteBoard: state.deleteBoard,
      updateGroupPartial: state.updateGroupPartial,
      getGroupsForCategory: state.getGroupsForCategory,
      getUncategorizedGroups: state.getUncategorizedGroups
    }))
  )

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor))

  // const groups = useMemo(
  //   () => board.groups.map((g) => <Group boardID={board.id} group={g} key={g.id} />),
  //   [board, board.groups, board.groups.length, editingMode]
  // )

  // type GroupSorting = {
  //   uncategorized: JSX.Element[]
  //   categorized: {
  //     [key: CategoryID]: {
  //       category: SoundCategory
  //       elements: JSX.Element[]
  //     }
  //   }
  // }

  // const { categorized: categorizedGroups, uncategorized: uncategorizedGroups } = useMemo(() => {
  //   const categories = new Map((board.categories ?? []).map((c) => [c.id, c]))
  //   const sortedGroups = board.groups.reduce<GroupSorting>(
  //     (acc, g) => {
  //       const groupElement = <Group boardID={board.id} group={g} key={g.id} />

  //       if (!g.category || !categories.has(g.category)) {
  //         acc.uncategorized.push(groupElement)
  //         return acc
  //       }

  //       const category = categories.get(g.category)

  //       if (!acc[g.category]) {
  //         acc[g.category] = {
  //           category,
  //           elements: []
  //         }
  //       }

  //       acc[g.category].elements.push(groupElement)
  //       return acc
  //     },
  //     {
  //       categorized: {},
  //       uncategorized: []
  //     } as GroupSorting
  //   )

  //   return sortedGroups
  // }, [board, board.categories, board.groups, board.groups.length, editingMode])

  // const categories = useMemo(() => {
  //   const board.categories?.map((c) => {
  //     const matchingCategoryGroups = categorizedGroups[c.id]
  //     if (matchingCategoryGroups) {
  //       return (<Category  />)
  //     }
  //   }) ?? []
  // }, [])

  // const groupsAndCategories = useMemo(
  //   () => board.groups.map((g) => <Group boardID={board.id} group={g} key={g.id} />),
  //   [board, board.groups, board.groups.length, editingMode]
  // )

  // const { ids: groupCategoryIDs, elements: groupCategoryElements } = useMemo(() => {
  //   // const groups = board.groups.filter((g) => g.category === undefined)
  //   const categories = board.categories ?? []
  //   // const uncategorizedGroups = board.groups.filter((g) => g.category === undefined)

  //   // const groupIDs = groups.map((g) => g.id)
  //   const categoryIDs = categories.map((c) => c.id)
  //   // const groupIDs = uncategorizedGroups.map((g) => g.id)

  //   // const groupElements = groups.map((g) => <Group boardID={board.id} group={g} key={g.id} />)
  //   const categoryElements =
  //     categories.map((c) => <Category boardID={board.id} category={c} key={c.id} />) ?? []

  //   // const groupElements = uncategorizedGroups.map((g) => (
  //   //   <Group boardID={board.id} group={g} key={g.id} />
  //   // ))

  //   // const uncategorizedContainer = (
  //   //   <UncategorizedGroups boardID={board.id} key={UncategorizedGroupId} />
  //   // )

  //   return {
  //     ids: [...categoryIDs],
  //     elements: [...categoryElements]
  //   }

  //   // return {
  //   //   ids: [...categoryIDs, ...groupIDs],
  //   //   elements: [...categoryElements, ...groupElements]
  //   // }

  //   // return {
  //   // ids: [...groupIDs, ...categoryIDs],
  //   // elements: [...groupElements, ...categoryElements]
  //   // }

  //   // return {
  //   //   ids: [...groupIDs, ...categoryIDs],
  //   //   elements: [...groupElements, ...categoryElements]
  //   // }
  // }, [board.groups, board, board.categories, editingMode])

  const { elements: categoryElements, ids: categoryIDs } = useMemo(() => {
    const categories = board.categories ?? []
    const ids = categories.map((c) => c.id)
    const elements = categories.map((c) => <Category boardID={board.id} category={c} key={c.id} />)

    return {
      ids,
      elements
    }
  }, [board.categories, board.groups, board.id])

  // const groupIDs = useMemo(() => board.groups.map((g) => g.id), [board.groups])

  const onNewGroup = useCallback(() => {
    setEditingBoardID(board.id)
    ;(document.getElementById(NewEffectModalId) as HTMLDialogElement).showModal()
  }, [board.id])

  const onNewCategory = useCallback(() => {
    setEditingBoardID(board.id)
    ;(document.getElementById(NewCategoryModalId) as HTMLDialogElement).showModal()
  }, [board.id])

  const onClickEdit = useCallback(() => {
    const newEditingMode: EditingMode = editingMode === 'Off' ? 'Editing' : 'Off'
    setEditingMode(newEditingMode)
  }, [editingMode, setEditingMode])

  const groupCategories = board.groups.map((g) => g.category)

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      const activeID = active.id as string

      // If over is null, it means that we dragged an item into a space that does not collide with
      // any droppable area. When that happens, it's most likely that we're dragging a group out of
      // a container.
      if (over === null) {
        if (IdIsGroup(activeID)) {
          const activeGroup = board.groups.find((g) => g.id === activeID)
          if (activeGroup && activeGroup.category !== undefined) {
            updateGroupPartial(board.id, activeID, {
              category: undefined
            })
          }
        }
        setEditingMode('Editing')
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
          setEditingMode('Editing')
          return
        }

        if (overGroup?.category !== activeGroup?.category) {
          updateGroupPartial(board.id, activeID, {
            category: overGroup?.category
          })
          setEditingMode('Editing')
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

        setEditingMode('Editing')
        return
      }

      // If we're moving a category onto another category, reorganize them.
      if (IdIsCategory(activeID) && IdIsCategory(overID)) {
        // TODO: Reorganize categories.
        setEditingMode('Editing')
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
          setEditingMode('Editing')
          return
        }
      }

      setEditingMode('Editing')
      return

      // if (IdIsCategory(activeID)) {
      //   if (IdIsGroup(overID)) {
      //     // Do nothing. If a category is dropped over a group, that's not a valid action.
      //     setEditingMode('Editing')
      //     return
      //   }
      //   if (IdIsCategory(overID)) {
      //     // Reorder categories. This means that the user reorganized the categories.
      //     setEditingMode('Editing')
      //     return
      //   }
      //   setEditingMode('Editing')
      //   return
      // }

      // if (IdIsGroup(activeID)) {
      //   if (IdIsGroup(overID)) {
      //     const groups = getUncategorizedGroups({ boardID: board.id }).groups
      //     const groupIDs = groups.map((g) => g.id)

      //     const activeIndex = groupIDs.indexOf(activeID)
      //     const overIndex = groupIDs.indexOf()

      //     // reorderGroups({
      //     //   boardID,
      //     //   category: categoryID,
      //     //   newOrder: newOrder
      //     // })

      //     // Reorder groups. This means that the user reorganized the uncategorized groups.
      //     setEditingMode('Editing')
      //     return
      //   }
      //   if (IdIsCategory(overID)) {
      //     // Set category for group. This means that the user dragged a group over a category.
      //     updateGroupPartial(activeID, {
      //       category: overID
      //     })
      //     setEditingMode('Editing')
      //     return
      //   }
      // }

      // const { active, over } = event
      // if (over === null) {
      //   return
      // }
      // const activeIndex = groupIDs.indexOf(active.id as GroupID)
      // const overIndex = groupIDs.indexOf(over.id as GroupID)
      // const arrayCopy = [...Array.from(groupIDs).values()]
      // const [movingItem] = arrayCopy.splice(activeIndex, 1)
      // arrayCopy.splice(overIndex, 0, movingItem)
      // reorderGroups({
      //   boardID: board.id,
      //   newOrder: arrayCopy
      // })
      // setEditingMode('Editing')
    },
    [categoryIDs, board.id, board.groups, groupCategories, board.categories, JSON.stringify(board)]
  )

  const onDragStart = useCallback(() => {
    setEditingMode('Dragging')
  }, [editingMode, setEditingMode])

  const onUpdateTitle = useCallback<ChangeEventHandler<HTMLInputElement>>(
    debounce((e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.value) {
        updateBoard({
          boardID: board.id,
          fields: {
            ...board,
            name: e.target.value
          }
        })
      }
    }, 200),
    [board.name]
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
      bg-base-200
      w-full
      h-full
      p-2
      mx-4
      rounded-lg
      shadow-sm
      items-center
      grid
      [grid-template-areas:_"._title_editbutton"_"groups_groups_groups"_"delete_add_."]
      [grid-template-columns:_1fr_max-content_1fr]
      [grid-template-rows:_min-content_1fr_min-content]
    `}
    >
      <div className="justify-center w-full text-center text-xl [grid-area:title]">
        <h3
          className={`
              h-12
              ${editingMode === 'Off' ? 'visible' : 'hidden'}
          `}
        >
          {board.name}
        </h3>
        <TextField
          className={`
              h-12
              ${editingMode === 'Off' ? 'hidden' : 'visible'}
            `}
          formName="Board Title"
          onChange={onUpdateTitle}
          defaultValue={board.name}
        />
      </div>
      <button
        onClick={onClickEdit}
        className={`
            btn
            justify-self-end
            btn-square
            [grid-area:editbutton]
            ${editingMode === 'Off' ? 'btn-outline' : 'btn-secondary'}
          `}
      >
        <PencilIcon />
      </button>
      <div
        className={`
          rounded-md
          p-3
          flex
          flex-row
          justify-self-center
          flex-wrap
          gap-8
          [grid-area:groups]
      `}
      >
        <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <SortableContext items={categoryIDs} disabled={editingMode == 'Off'}>
            {categoryElements}
          </SortableContext>
          <Uncategorized boardID={board.id} />
        </DndContext>
        {/* <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd} sensors={sensors}>
          <SortableContext items={groupCategoryIDs}>{groupCategoryElements}</SortableContext>
        </DndContext> */}
        {/* <UncategorizedGroups key={UncategorizedGroupId} boardID={board.id} /> */}
      </div>
      <div className="[grid-area:_add] flex flex-row gap-x-4">
        <button
          className={`
          btn-primary
          btn
          w-fit
          justify-self-center
          [grid-area:_add]
        `}
          onClick={onNewGroup}
        >
          <AddIcon className="h-3 w-3" />
          Group
        </button>
        <button
          className={`
          btn-secondary
          btn
          w-fit
          justify-self-center
          [grid-area:_add]
        `}
          onClick={onNewCategory}
        >
          <AddIcon className="h-3 w-3" />
          Category
        </button>
      </div>
      <DeleteButton
        onAskConfirm={onAskConfirm}
        onCancelDelete={onCancelDelete}
        isConfirming={isConfirmingDelete}
        onDelete={onDelete}
        className={`
          justify-self-start
          [grid-area:delete]
        `}
      />
    </div>
  )
}
