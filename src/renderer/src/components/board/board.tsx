import { useCallback, useMemo } from 'react'
import { GroupID, SoundBoard } from 'src/apis/audio/interface'
import Group from '../group/group'
import { useAudioStore } from '@renderer/stores/audioStore'
import { NewEffectModalId } from '../modals/newEffectModal/newEffectModal'
import AddIcon from '@renderer/assets/icons/add'
import PencilIcon from '@renderer/assets/icons/pencil'
import { Reorder } from 'framer-motion'

export type BoardProps = {
  board: SoundBoard
}

export default function Board(props: BoardProps) {
  const { setEditingBoardID, setEditingMode, reorderGroups, editingMode } = useAudioStore()

  const { board } = props

  const groups = useMemo(
    () =>
      board.groups.map((g) => (
        <Reorder.Item value={g.id} key={g.id}>
          <Group boardID={board.id} group={g} />
        </Reorder.Item>
      )),
    [board, board.groups, board.groups.length, editingMode]
  )

  const groupIDs = useMemo(() => board.groups.map((g) => g.id), [board.groups])

  const onNewGroup = useCallback(() => {
    setEditingBoardID(board.id)
    ;(document.getElementById(NewEffectModalId) as HTMLDialogElement).showModal()
  }, [])

  const onClickEdit = useCallback(() => {
    setEditingMode(!editingMode)
  }, [editingMode, setEditingMode])

  const onReorder = useCallback(
    (newGroupOrder: GroupID[]) => {
      reorderGroups({
        boardID: board.id,
        newOrder: newGroupOrder
      })
    },
    [board.groups]
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
        <Reorder.Group onReorder={onReorder} values={groupIDs}>
          {groups}
        </Reorder.Group>
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
