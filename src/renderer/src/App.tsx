import BoardGrid from './components/board/board-grid'
import EditCategoryModal from './components/modals/editCategoryModal/editCategoryModal'
import NewBoardModal from './components/modals/newBoardModal/newBoardModal'
import NewCategoryModal from './components/modals/newCategoryModal/newCategoryModal'
import EditEffectModal from './components/modals/newEffectModal/editEffectModal'
import NewEffectModal from './components/modals/newEffectModal/newEffectModal'

/**
 * The base of the application. This is the root of the tree and contains all base-level elements.
 */
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
