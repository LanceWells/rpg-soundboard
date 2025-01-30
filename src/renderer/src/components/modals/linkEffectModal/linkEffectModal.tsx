import CloseIcon from '@renderer/assets/icons/close'

export const LinkEffectModalId = 'LinkEffectModal'

export default function LinkEffectModal() {
  return (
    <dialog id={LinkEffectModalId} className="modal">
      <div className="modal-box overflow-visible">
        <h3 className="font-bold text-lg">Link Effects</h3>
        <div className="flex justify-center w-full">Tree goes here.</div>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-primary">Update</button>
            <button className="btn btn-circle absolute text-white font-bold -top-3 -right-3 bg-error">
              <CloseIcon />
            </button>
          </form>
        </div>
      </div>
    </dialog>
  )
}
