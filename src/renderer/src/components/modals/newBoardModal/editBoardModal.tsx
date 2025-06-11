import { useCallback } from 'react'
import BoardModal from './boardModal'
import { CreateRequest } from 'src/apis/audio/types/boards'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { useShallow } from 'zustand/react/shallow'

export const EditBoardModalId = 'edit-board-modal'

export default function EditBoardModal() {
  const { editingBoard, updateBoard } = useAudioStore(
    useShallow((state) => ({
      // editingBoardID: state.editingBoardID,
      editingBoard: state.editingElementsV2.board,
      updateBoard: state.updateBoard
    }))
  )

  const editingBoardID = editingBoard?.id

  const handleSubmit = useCallback(
    (req: CreateRequest) => {
      if (editingBoardID) {
        updateBoard({
          boardID: editingBoardID,
          fields: {
            name: req.name
          }
        })
      }
    },
    [editingBoardID]
  )

  return (
    <BoardModal
      modalTitle="Edit Board"
      actionName="Update"
      handleSubmit={handleSubmit}
      id={EditBoardModalId}
    />
  )
}
