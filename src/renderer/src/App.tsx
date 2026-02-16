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
