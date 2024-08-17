import DeleteIcon from '@renderer/assets/icons/delete'
import { useAudioStore } from '@renderer/stores/audioStore'
import { useCallback, MouseEventHandler } from 'react'
import { useShallow } from 'zustand/react/shallow'

/**
 * Props for {@link DeleteButton}.
 */
export type DeleteButtonProps = {
  /**
   * The class name that should be rendered at the root of the element. Will go after necessary
   * classes.
   */
  className?: string

  /**
   * A callback that occurs when the user is confirming that they wish to delete the item.
   */
  onDelete: () => void

  /**
   * A callback that occurs when the user has pressed the delete button, and is not confirming.
   */
  onAskConfirm: () => void

  /**
   * A callback that occurs when the user has decided to not cancel the item, after being asked to
   * confirm their intention.
   */
  onCancelDelete: () => void

  /**
   * If true, this button should be asking the user if they are certain that they wish to delete the
   * given item.
   */
  isConfirming: boolean
}

/**
 * A general-purpose delete button. Includes a confirmation mechanism. As a result of the
 * confirmation mechanism, this component will use a considerable amount of horizontal space.
 * @param props See {@link DeleteButtonProps}.
 */
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
