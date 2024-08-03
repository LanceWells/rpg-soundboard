import BoardGrid from './components/board/board-grid'
import NewBoardModal from './components/modals/newBoardModal'
import NewEffectModal from './components/modals/newEffectModal'

export default function App() {
  return (
    <div className="flex flex-col h-full flex-grow">
      <NewEffectModal />
      <NewBoardModal />
      <h2 className="p-2 text-center text-2xl">Soundboards</h2>
      <BoardGrid />
    </div>
  )
}
