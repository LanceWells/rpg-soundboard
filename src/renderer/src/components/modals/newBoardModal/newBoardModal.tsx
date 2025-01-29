import { useAudioStore } from '@renderer/stores/audioStore'
import BoardModal from './boardModal'

export const NewBoardModalId = 'new-board-modal'

export default function NewBoardModal() {
  const addBoard = useAudioStore((state) => state.addBoard)

  return (
    <BoardModal
      actionName="Create"
      handleSubmit={addBoard}
      id={NewBoardModalId}
      modalTitle="New Board"
    />
  )
}
