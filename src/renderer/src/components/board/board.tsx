import { ChangeEvent, ChangeEventHandler, useCallback, useMemo, useState } from 'react'
import { GroupID, SoundBoard } from 'src/apis/audio/interface'
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

export type BoardProps = {
  board: SoundBoard
}

export default function Board(props: BoardProps) {
  const { board } = props
  const { setEditingBoardID, setEditingMode, editingMode, reorderGroups, updateBoard } =
    useAudioStore()

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor))

  const groups = useMemo(
    () => board.groups.map((g) => <Group boardID={board.id} group={g} key={g.id} />),
    [board, board.groups, board.groups.length, editingMode]
  )

  const groupIDs = useMemo(() => board.groups.map((g) => g.id), [board.groups])

  const onNewGroup = useCallback(() => {
    setEditingBoardID(board.id)
    ;(document.getElementById(NewEffectModalId) as HTMLDialogElement).showModal()
  }, [])

  const onClickEdit = useCallback(() => {
    const newEditingMode: EditingMode = editingMode === 'Off' ? 'Editing' : 'Off'
    setEditingMode(newEditingMode)
  }, [editingMode, setEditingMode])

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

      reorderGroups({
        boardID: board.id,
        newOrder: arrayCopy
      })

      setEditingMode('Editing')
    },
    [groupIDs]
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
          <SortableContext items={groupIDs}>{groups}</SortableContext>
        </DndContext>
      </div>
      <button
        className={`
          btn-primary
          btn
          w-40
          justify-self-center
          [grid-area:_add]
        `}
        onClick={onNewGroup}
      >
        <AddIcon />
      </button>
    </div>
  )
}
