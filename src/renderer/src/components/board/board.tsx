import { useCallback, useMemo } from 'react'
import { SoundBoard } from 'src/apis/audio/interface'
import Group from '../group/group'
import { useAudioStore } from '@renderer/stores/audioStore'
import { NewEffectModalId } from '../modals/newEffectModal'

export type BoardProps = {
  board: SoundBoard
}

export default function Board(props: BoardProps) {
  const { setBoardBeingAddedTo } = useAudioStore()

  const { board } = props

  const groups = useMemo(
    () => board.groups.map((g) => <Group group={g} key={g.id} />),
    [board, board.groups, board.groups.length]
  )

  const onNewGroup = useCallback(() => {
    setBoardBeingAddedTo(board.id)
    ;(document.getElementById(NewEffectModalId) as HTMLDialogElement).showModal()
  }, [])

  return (
    <div className="bg-base-200 w-full flex flex-col p-2 mx-4 rounded-lg shadow-sm justify-between">
      <h3 className="text-center text-xl">{board.name}</h3>
      <div className="rounded-md p-3 flex flex-row items-start flex-wrap gap-4">{groups}</div>
      <button
        className="w-fit min-w-40 self-center bg-primary btn text-white rounded-md"
        onClick={onNewGroup}
      >
        +
      </button>
    </div>
  )
}
