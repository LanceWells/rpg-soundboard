import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { useMemo, useState } from 'react'
import { GroupIcon } from '../board/icon/base'
import SweatDrop from '@renderer/assets/images/SweatDrop.png'
import CloseIcon from '@renderer/assets/icons/close'

export const DeleteGroupConfirmationDialogId = 'DeleteGroupConfirmationDialog'

export function DeleteGroupConfirmationDialog() {
  const deleteGroup = useAudioStore((store) => store.deleteGroup)
  const groupBeingDeletedID = useAudioStore((store) => store.groupBeingDeletedID)
  const getGroup = useAudioStore((store) => store.getGroup)

  const [isNervous, setIsNervous] = useState(false)

  const groupBeingDeleted = useMemo(() => {
    if (groupBeingDeletedID === null) {
      return null
    }

    return getGroup(groupBeingDeletedID)
  }, [getGroup, groupBeingDeletedID])

  const groupName = groupBeingDeleted?.name ?? 'N/A'

  return (
    <dialog id={DeleteGroupConfirmationDialogId} className="modal">
      <div className="modal-box overflow-visible relative min-w-fit">
        <h3 className="font-bold text-lg">Delete {groupName}?</h3>
        <p>They're just a lil' guy</p>
        {groupBeingDeleted && (
          <div className="flex justify-center">
            <div className="relative">
              <GroupIcon icon={groupBeingDeleted.icon} />
              <img
                className={`
                absolute
                bottom-0
                right-1
                z-50
                transition-opacity
                ${isNervous ? 'opacity-100 animate-drip' : 'opacity-0'}
              `}
                src={SweatDrop}
              />
            </div>
          </div>
        )}
        <div className="modal-action">
          <form method="dialog" className="w-full h-full flex flex-row gap-4 justify-center">
            <button className="btn btn-primary">No, don't delete {groupName}</button>
            <button
              onMouseOver={() => setIsNervous(true)}
              onMouseLeave={() => setIsNervous(false)}
              onClick={() => {
                if (groupBeingDeletedID) {
                  deleteGroup(groupBeingDeletedID)
                }
                setIsNervous(false)
              }}
              className="btn btn-error"
            >
              Yes, delete {groupName} forever
            </button>
            <button className="btn btn-error btn-circle absolute -top-3 -right-3">
              <CloseIcon />
            </button>
          </form>
        </div>
      </div>
    </dialog>
  )
}
