import { useCallback, useMemo } from 'react'
import { GroupID, SoundBoard } from 'src/apis/audio/interface'
import Group from '../group/group'
import { useAudioStore } from '@renderer/stores/audioStore'
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

export type BoardProps = {
  board: SoundBoard
}

export default function Board(props: BoardProps) {
  const { board } = props
  const { setEditingBoardID, setEditingMode, editingMode, reorderGroups } = useAudioStore()

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor))

  const groups = useMemo(
    () => board.groups.map((g) => <Group boardID={board.id} group={g} key={g.id} />),
    [board, board.groups, board.groups.length]
  )

  const groupIDs = useMemo(() => board.groups.map((g) => g.id), [board.groups])

  const onNewGroup = useCallback(() => {
    setEditingBoardID(board.id)
    ;(document.getElementById(NewEffectModalId) as HTMLDialogElement).showModal()
  }, [])

  const onClickEdit = useCallback(() => {
    setEditingMode(!editingMode)
  }, [editingMode, setEditingMode])

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (over === null) {
        return
      }

      const activeIndex = groupIDs.indexOf(active.id as GroupID)
      const overIndex = groupIDs.indexOf(over.id as GroupID)

      // const newIndex = overIndex > activeIndex ? overIndex - 1 : overIndex

      const arrayCopy = [...Array.from(groupIDs).values()]
      const [movingItem] = arrayCopy.splice(activeIndex, 1)
      arrayCopy.splice(overIndex, 0, movingItem)

      reorderGroups({
        boardID: board.id,
        newOrder: arrayCopy
      })
    },
    [groupIDs]
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
      justify-items-center
      items-center
      justify-between
      flex
      flex-col
    `}
    >
      <div className="flex relative w-full">
        <h3 className="text-center w-full text-xl [grid-area:_title]">{board.name}</h3>
        <button
          onClick={onClickEdit}
          className={`
            absolute
            right-0
            btn
            btn-square
            ${editingMode ? 'btn-secondary' : 'btn-outline'}
            [grid-area:editbutton]
          `}
        >
          <PencilIcon />
        </button>
      </div>
      <div className="rounded-md p-3 flex flex-row items-start flex-wrap gap-4 [grid-area:boards]">
        <DndContext onDragEnd={onDragEnd} sensors={sensors}>
          <SortableContext items={groupIDs}>{groups}</SortableContext>
        </DndContext>
      </div>
      <button
        className={`
          btn-primary
          btn
          place-content-center
          w-40
          [grid-area:_neweff]
        `}
        onClick={onNewGroup}
      >
        <AddIcon />
      </button>
    </div>
  )
}
