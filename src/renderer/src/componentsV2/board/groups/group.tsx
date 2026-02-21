import WoodenShelf from '@renderer/assets/images/WoodShelf.png'
import { GroupID } from 'src/apis/audio/types/groups'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { useShallow } from 'zustand/shallow'
import { useCallback, useRef } from 'react'
import { MemoizedGroupIcon } from '../icon/base'
import { VariantTag } from './variantTag'
import PencilIcon from '@renderer/assets/icons/pencil'
import DeleteIcon from '@renderer/assets/icons/delete'
import { useNavigate } from '@tanstack/react-router'
import { DeleteGroupConfirmationDialogId } from '@renderer/componentsV2/dialogs/deleteGroupConfirmationDialog'

export type GroupBaseProps = {
  id: GroupID
}

export function Group(props: GroupBaseProps) {
  const { id } = props

  const getGroup = useAudioStore((store) => store.getGroup)
  const setGroupToDelete = useAudioStore((store) => store.setGroupBeingDeletedID)

  const group = getGroup(id)
  const nav = useNavigate()

  const { playGroup, stopGroup, isPlaying } = useAudioStore(
    useShallow((state) => ({
      playGroup: state.playGroup,
      stopGroup: state.stopGroup,
      isPlaying: state.playingGroups.some((g) => g === group.id)
    }))
  )

  const onClickPlay = useCallback(() => {
    if (group.variant !== 'Rapid' && isPlaying) {
      stopGroup(group.id)
    } else {
      playGroup(group.id)
    }
  }, [group, isPlaying])

  const popoverRef = useRef<HTMLDetailsElement | null>(null)
  const popoverId = `${id}-popover`
  const anchorId = `--anchor-${id.replaceAll('-', '')}`

  return (
    <div
      style={{
        anchorName: anchorId
      }}
    >
      <button
        onContextMenu={() => {
          if (popoverRef?.current) {
            popoverRef.current.open = true
          }
        }}
        data-groupid={group.id}
        className={`
        cursor-pointer
        justify-items-center
        overflow-ellipsis
        overflow-clip
        w-[150px]
        w-max-[150px]
        h-[168px]
        h-max-[168px]
        relative
        before:absolute
        before:w-full
        before:h-full
        before:opacity-0
        before:left-0
        before:top-0
        before:z-30
        before:bg-white
        active:before:bg-blue-500
        before:transition-opacity
        hover:before:opacity-20
        rounded-md
      `}
        onClick={onClickPlay}
      >
        <div
          className={`
            absolute
            left-1/2
            top-2
            transform-[translate(-50%,_0%)]
          `}
        >
          <MemoizedGroupIcon icon={group.icon} />
        </div>
        <img
          className={`
          absolute
          top-0
          left-1/2
          transform-[translate(-50%,_0)]
        `}
          src={WoodenShelf}
        />
        <span
          className={`
        max-w-3/4
        overflow-hidden
        overflow-ellipsis
        text-nowrap
        absolute
        top-32
        w-[140px]
        z-30
        left-3
        p-1
        text-lg
        pointer-events-none
        ${
          isPlaying
            ? 'background-animate bg-gradient-to-r from-indigo-500 via-green-500 to-pink-500 bg-clip-text text-transparent select-none'
            : 'text-white'
        }
        `}
        >
          {group.name}
        </span>
        <VariantTag
          variant={group.variant}
          className={`
          absolute
          bottom-0
          right-0
          z-20
        `}
        />
      </button>
      {/* <div
        className={`
        dropdown
        dropdown-center
        menu
        w-52
        bg-base-100
        shadow-sm
      `}
        ref={popoverRef}
        popover="auto"
        id={popoverId}
        style={{
          positionAnchor: anchorId
        }}
      > */}
      <details ref={popoverRef} className="dropdown">
        <ul className="menu dropdown bg-base-100">
          <li>
            <button
              onClick={() =>
                nav({
                  to: '/sound/$groupId/edit',
                  params: {
                    groupId: id
                  }
                })
              }
              className="btn flex flex-row items-center"
            >
              <PencilIcon className="w-4 h-4" />
              Edit
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                setGroupToDelete(id)
                ;(
                  document.getElementById(DeleteGroupConfirmationDialogId) as HTMLDialogElement
                ).showModal()
              }}
              className="btn btn-error flex flex-row items-center"
            >
              <DeleteIcon className="w-4 h-4" />
              Delete
            </button>
          </li>
        </ul>
      </details>
      {/* </div> */}
    </div>
  )
}
