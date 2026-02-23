import { DeleteGroupConfirmationDialog } from './components/dialogs/deleteGroupConfirmationDialog'
import { RootLayout } from './components/layout/root'

/**
 * The base of the application. This is the root of the tree and contains all base-level elements.
 */
export default function App() {
  return (
    <div className="flex flex-col h-full w-full grow overflow-hidden">
      <DeleteGroupConfirmationDialog />
      <RootLayout />
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
