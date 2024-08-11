import BoardGrid from './components/board/board-grid'
import EditCategoryModal from './components/modals/editCategoryModal/editCategoryModal'
import NewBoardModal from './components/modals/newBoardModal/newBoardModal'
import NewCategoryModal from './components/modals/newCategoryModal/newCategoryModal'
import EditEffectModal from './components/modals/newEffectModal/editEffectModal'
import NewEffectModal from './components/modals/newEffectModal/newEffectModal'

export default function App() {
  return (
    <div className="flex flex-col h-full flex-grow">
      <NewEffectModal />
      <EditEffectModal />
      <NewBoardModal />
      <NewCategoryModal />
      <EditCategoryModal />
      <BoardGrid />
    </div>
  )
}
