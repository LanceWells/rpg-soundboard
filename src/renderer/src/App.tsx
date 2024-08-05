import BoardGrid from './components/board/board-grid'
import NewBoardModal from './components/modals/newBoardModal/newBoardModal'
import EditEffectModal from './components/modals/newEffectModal/editEffectModal'
import NewEffectModal from './components/modals/newEffectModal/newEffectModal'

export default function App() {
  return (
    <div className="flex flex-col h-full flex-grow">
      <NewEffectModal />
      <EditEffectModal />
      <NewBoardModal />
      <h2 className="p-2 w-full text-center text-2xl">Soundboards</h2>
      <BoardGrid />
    </div>
  )
}
