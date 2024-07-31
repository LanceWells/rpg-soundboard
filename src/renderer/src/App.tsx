import { useMemo } from 'react'
import Board from './components/board/board'
import { useAudioStore } from './stores/audioStore'

export default function App() {
  const { boards } = useAudioStore()

  const boardNodes = useMemo(
    () => boards.map((b) => <Board board={b} key={b.id} />),
    [boards, boards.length]
  )

  return (
    <div>
      <h2>Boards</h2>
      {boardNodes}
    </div>
  )
}
