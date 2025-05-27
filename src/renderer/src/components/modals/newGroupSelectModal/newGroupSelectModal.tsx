import CloseIcon from '@renderer/assets/icons/close'
import MusicNoteIcon from '@renderer/assets/icons/musicnote'
import SequenceIcon from '@renderer/assets/icons/sequence'
import { NewSequenceModalId } from '../sequenceModal/newSequenceModal'
import { useAudioStore } from '@renderer/stores/audio/audioStore'

export const NewGroupSelectModalId = 'NewGroupSelectModal'

export default function NewGroupSelectModal() {
  const resetEditingSequence = useAudioStore((store) => store.resetEditingSequence)

  return (
    <dialog id={NewGroupSelectModalId} className="modal">
      <div className="modal-box overflow-visible">
        <h3 className="font-bold text-lg">New Button</h3>
        <div className="flex justify-center w-full h-full"></div>
        <div className="modal-action">
          <form method="dialog" className="w-full h-full flex flex-row gap-4 justify-center">
            <button
              className="btn btn-square h-24 w-24 p-4"
              onClick={() => {
                resetEditingSequence()
                ;(document.getElementById(NewSequenceModalId) as HTMLDialogElement).showModal()
              }}
            >
              <SequenceIcon className="w-12 h-12" />
              Sequence
            </button>
            <button className="btn btn-square h-24 w-24 p-4">
              <MusicNoteIcon className="w-12 h-12" />
              Default
            </button>
            <button className="btn btn-circle absolute text-white font-bold -top-3 -right-3 bg-error">
              <CloseIcon />
            </button>
          </form>
        </div>
      </div>
    </dialog>
  )
}
