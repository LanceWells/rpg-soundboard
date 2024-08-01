import BoardGrid from './components/board/board-grid'
import NewEffectModal from './components/modals/newEffectModal'

export default function App() {
  return (
    <div className="flex flex-col h-full flex-grow">
      <NewEffectModal />
      <h2 className="p-2 text-center text-2xl">Soundboards</h2>
      <BoardGrid />
    </div>
  )
}
