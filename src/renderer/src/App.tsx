import BoardGrid from './components/board/board-grid'
import EditCategoryModal from './components/modals/editCategoryModal/editCategoryModal'
import LinkEffectModal from './components/modals/linkEffectModal/linkEffectModal'
import EditBoardModal from './components/modals/newBoardModal/editBoardModal'
import NewBoardModal from './components/modals/newBoardModal/newBoardModal'
import NewCategoryModal from './components/modals/newCategoryModal/newCategoryModal'
import EditEffectModal from './components/modals/newEffectModal/editEffectModal'
import NewEffectModal from './components/modals/newEffectModal/newEffectModal'
import NewGroupSelectModal from './components/modals/newGroupSelectModal/newGroupSelectModal'
import EditSequenceModal from './components/modals/sequenceModal/editModal'
import NewSequenceModal from './components/modals/sequenceModal/newModal'
import { GroupGrid } from './componentsV2/testing/groupGrid'

/**
 * The base of the application. This is the root of the tree and contains all base-level elements.
 */
export default function App() {
  return (
    <div className="flex flex-col h-full grow">
      <GroupGrid />
      {/* <NewSequenceModal />
      <EditSequenceModal />
      <NewGroupSelectModal />
      <NewEffectModal />
      <EditEffectModal />
      <NewBoardModal />
      <EditBoardModal />
      <NewCategoryModal />
      <EditCategoryModal />
      <LinkEffectModal />
      <BoardGrid /> */}
    </div>
  )
}
