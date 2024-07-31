import { useCallback, useMemo } from 'react'
import { SoundBoard } from 'src/apis/audio/interface'
import Group from '../group/group'
import { useAudioStore } from '@renderer/stores/audioStore'

export type BoardProps = {
  board: SoundBoard
}

export default function Board(props: BoardProps) {
  const { addGroup } = useAudioStore()

  const { board } = props

  const groups = useMemo(
    () => board.groups.map((g) => <Group group={g} key={g.id} />),
    [board, board.groups, board.groups.length]
  )

  const onNewGroup = useCallback(() => {
    addGroup({
      boardID: board.id,
      name: 'New Name'
    })
  }, [addGroup])

  return (
    <div className="bg-slate-100 rounded-sm">
      <h3>{board.name}</h3>
      {groups}
      <button onClick={onNewGroup}>+</button>
    </div>
  )
}
