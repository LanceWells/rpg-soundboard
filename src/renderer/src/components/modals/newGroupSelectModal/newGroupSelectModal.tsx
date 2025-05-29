import CloseIcon from '@renderer/assets/icons/close'
import MusicNoteIcon from '@renderer/assets/icons/musicnote'
import SequenceIcon from '@renderer/assets/icons/sequence'
import { NewSequenceModalId } from '../sequenceModal/newModal'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { NewEffectModalId } from '../newEffectModal/newEffectModal'

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
            <div className="flex flex-col items-center gap-2">
              <button
                className="btn btn-square h-24 w-24 p-4"
                onClick={() => {
                  resetEditingSequence()
                  ;(document.getElementById(NewSequenceModalId) as HTMLDialogElement).showModal()
                }}
              >
                <SequenceIcon className="w-12 h-12" />
              </button>
              Sequence
            </div>
            <div className="flex flex-col items-center gap-2">
              <button
                className="btn btn-square h-24 w-24 p-4"
                onClick={() => {
                  resetEditingSequence()
                  ;(document.getElementById(NewEffectModalId) as HTMLDialogElement).showModal()
                }}
              >
                <MusicNoteIcon className="w-12 h-12" />
              </button>
              Default
            </div>
            <button className="btn btn-circle absolute text-white font-bold -top-3 -right-3 bg-error">
              <CloseIcon />
            </button>
          </form>
        </div>
      </div>
    </dialog>
  )
}
