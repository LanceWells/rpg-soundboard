import { ChangeEvent, ChangeEventHandler, useCallback, useMemo, useState } from 'react'
import { CategoryID, GroupID, SoundBoard, SoundCategory } from 'src/apis/audio/interface'
import Group from '../group/group'
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
import { SortableContext } from '@dnd-kit/sortable'
import TextField from '../modals/newEffectModal/textField'
import debounce from 'debounce'
import DeleteButton from '../generic/deleteButton'
import { useShallow } from 'zustand/react/shallow'
import { NewCategoryModalId } from '../modals/newCategoryModal/newCategoryModal'
import Category from '../category/category'
import UncategorizedGroups from '../category/uncategorizedGroups'

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
    deleteBoard
  } = useAudioStore(
    useShallow((state) => ({
      editingMode: state.editingMode,
      setEditingBoardID: state.setEditingBoardID,
      setEditingMode: state.setEditingMode,
      reorderGroups: state.reorderGroups,
      updateBoard: state.updateBoard,
      deleteBoard: state.deleteBoard
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

  const { ids: groupCategoryIDs, elements: groupCategoryElements } = useMemo(() => {
    // const groups = board.groups.filter((g) => g.category === undefined)
    const categories = board.categories ?? []

    // const groupIDs = groups.map((g) => g.id)
    const categoryIDs = categories.map((c) => c.id)

    // const groupElements = groups.map((g) => <Group boardID={board.id} group={g} key={g.id} />)
    const categoryElements =
      categories.map((c) => <Category boardID={board.id} category={c} key={c.id} />) ?? []

    // const uncategorizedContainer = (
    //   <UncategorizedGroups boardID={board.id} key={UncategorizedGroupId} />
    // )

    return {
      ids: categoryIDs,
      elements: categoryElements
    }

    // return {
    // ids: [...groupIDs, ...categoryIDs],
    // elements: [...groupElements, ...categoryElements]
    // }

    // return {
    //   ids: [...groupIDs, ...categoryIDs],
    //   elements: [...groupElements, ...categoryElements]
    // }
  }, [board.groups, board, board.categories, editingMode])

  const groupIDs = useMemo(() => board.groups.map((g) => g.id), [board.groups])

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

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
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
    [groupCategoryIDs]
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
        <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd} sensors={sensors}>
          <SortableContext items={groupCategoryIDs}>{groupCategoryElements}</SortableContext>
        </DndContext>
        <UncategorizedGroups key={UncategorizedGroupId} boardID={board.id} />
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
