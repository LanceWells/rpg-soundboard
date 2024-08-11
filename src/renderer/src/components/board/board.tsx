import { ChangeEvent, ChangeEventHandler, useCallback, useMemo, useState } from 'react'
import { SoundBoard } from 'src/apis/audio/interface'
import { EditingMode, useAudioStore } from '@renderer/stores/audioStore'
import { NewEffectModalId } from '../modals/newEffectModal/newEffectModal'
import AddIcon from '@renderer/assets/icons/add'
import PencilIcon from '@renderer/assets/icons/pencil'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import TextField from '../modals/newEffectModal/textField'
import debounce from 'debounce'
import DeleteButton from '../generic/deleteButton'
import { useShallow } from 'zustand/react/shallow'
import { NewCategoryModalId } from '../modals/newCategoryModal/newCategoryModal'
import Category from '../category/categorized'
import { IdIsCategory, IdIsGroup } from '@renderer/utils/id'
import Uncategorized from '../category/uncategorized'
import { SortableContext } from '@dnd-kit/sortable'

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

  const { elements: categoryElements, ids: categoryIDs } = useMemo(() => {
    const categories = board.categories ?? []
    const ids = categories.map((c) => c.id)
    const elements = categories.map((c) => <Category boardID={board.id} category={c} key={c.id} />)

    return {
      ids,
      elements
    }
  }, [board.categories, board.groups, board.id])

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
      content-between
      relative
      [grid-template-areas:_"._title_editbutton"_"categories_categories_categories"_"groups_groups_groups"_"delete_controls_."]
      [grid-template-columns:_min-content_1fr_min-content]
    `}
    >
      <div className="w-full absolute top-0 left-0 text-center pointer-events-none">
        <h3
          className={`
            w-full
            text-2xl
            pt-4
            ${editingMode === 'Off' ? 'visible' : 'hidden'}
          `}
        >
          {board.name}
        </h3>
        <TextField
          className={`
              prose
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
      <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex flex-row flex-wrap gap-6 justify-center [grid-area:categories]">
          <SortableContext items={categoryIDs} disabled={editingMode == 'Off'}>
            {categoryElements}
          </SortableContext>
        </div>
        <div className="flex flex-row flex-wrap gap-6 justify-center [grid-area:groups]">
          <Uncategorized boardID={board.id} />
        </div>
      </DndContext>
      <div className="[grid-area:_controls] absolute w-full justify-center bottom-0 flex flex-row gap-x-4">
        <button
          className={`
          btn-primary
          btn
          w-fit
          justify-self-center
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
