import DeleteIcon from '@renderer/assets/icons/delete'
import { useAudioStore } from '@renderer/stores/audioStore'
import { useCallback, MouseEventHandler } from 'react'
import { useShallow } from 'zustand/react/shallow'

export type DeleteButtonProps = {
  className?: string
  onDelete: () => void
  onAskConfirm: () => void
  onCancelDelete: () => void
  isConfirming: boolean
}

export default function DeleteButton(props: DeleteButtonProps) {
  const { onDelete, onAskConfirm, onCancelDelete, isConfirming, className } = props

  const { editingMode } = useAudioStore(
    useShallow((state) => ({
      editingMode: state.editingMode
    }))
  )

  const onClickDelete = useCallback<MouseEventHandler<HTMLButtonElement>>((e) => {
    e.preventDefault()
    onAskConfirm()
  }, [])

  const onClickNope = useCallback<MouseEventHandler>((e) => {
    e.preventDefault()
    onCancelDelete()
  }, [])

  return (
    <div className={className}>
      <button
        onClick={onClickDelete}
        className={`
        ${editingMode === 'Editing' && !isConfirming ? 'visible' : 'hidden'}
        btn
        btn-error
      `}
      >
        <DeleteIcon />
        Delete
      </button>
      <div
        className={`
        ${editingMode === 'Editing' && isConfirming ? 'visible' : 'hidden'}
        flex
        items-center
        gap-4
      `}
      >
        <i>Really delete?</i>
        <button className="btn btn-primary" onClick={onClickNope}>
          Nope
        </button>
        <button className="btn btn-error" onClick={onDelete}>
          Yes, really
        </button>
      </div>
    </div>
  )
}
