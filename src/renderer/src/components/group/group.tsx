import { BoardID, SoundGroup } from 'src/apis/audio/interface'
import { IconEffect } from '../effect/icon-effect'
import { useCallback, useMemo } from 'react'
import { useAudioStore } from '@renderer/stores/audioStore'
import { EditEffectModalId } from '../modals/newEffectModal/editEffectModal'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PencilIcon from '@renderer/assets/icons/pencil'
import RepeatIcon from '@renderer/assets/icons/repeat'

export type GroupProps = {
  group: SoundGroup
  boardID: BoardID
}

export default function Group(props: GroupProps) {
  const { group, boardID } = props

  const {
    playGroup,
    stopGroup,
    playingGroups,
    editingMode,
    setEditingGroupID,
    setSelectedIcon,
    setGroupName,
    resetWorkingFiles,
    setEditingBoardID,
    setGroupRepeating,
    setFadeIn,
    setFadeOut
  } = useAudioStore()

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: group.id,
    disabled: editingMode === 'Off'
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const isPlaying = useMemo(() => {
    return playingGroups.includes(group.id)
  }, [playingGroups, group.id])

  const onClickPlay = useCallback(() => {
    if (isPlaying) {
      stopGroup(group.id)
    } else {
      playGroup(group.id)
    }
  }, [group, isPlaying])

  const onClickEdit = useCallback(() => {
    stopGroup(group.id)
    setEditingGroupID(group.id)
    setSelectedIcon(group.icon)
    setGroupName(group.name)
    resetWorkingFiles(group.effects)
    setEditingBoardID(boardID)
    setGroupRepeating(group.repeats)
    setFadeIn(group.fadeIn)
    setFadeOut(group.fadeOut)
    ;(document.getElementById(EditEffectModalId) as HTMLDialogElement).showModal()
  }, [group, boardID])

  return (
    <div className="relative">
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={onClickPlay}
        role="button"
        className={`
        cursor-pointer
        hover:brightness-125
        hover:drop-shadow-lg
        hover
        z-0
      `}
      >
        <div
          className={`
          indicator
          relative
          z-0
          ${
            isPlaying
              ? `
            before:-top-2
            before:-right-2
            before:-left-2
            before:-bottom-2
            `
              : `
            before:-top-0
            before:-right-0
            before:-left-0
            before:-bottom-0
            `
          }
          before:[transition-property:_all]
          before:[transition-timing-function:_cubic-bezier(0.4,_0,_0.2,_1)]
          before:[transition-duration:_150ms]
          before:-z-10
          before:absolute
          
          before:rounded-xl
          before:animate-radialspin
          before:bg-[radial-gradient(circle_at_center,lightgreen,_rebeccapurple)]
          `}
        >
          <IconEffect icon={group.icon} />
          <span
            className={`
              indicator-item
              rounded-full
              indicator-bottom
              indicator-start
              badge-neutral
              ${group.repeats ? 'visible' : 'hidden'}
            `}
          >
            <RepeatIcon className="h-4 w-4 m-1" />
          </span>
        </div>
        <span className="text-sm flex justify-center">{group.name}</span>
      </div>
      <button
        onClick={editingMode ? onClickEdit : undefined}
        className={`
          absolute
          -top-2
          -right-2
          btn
          btn-circle
          z-10
          btn-secondary
          transition-opacity
          ${editingMode === 'Off' ? 'hidden' : 'visible'}
          ${editingMode === 'Editing' ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <PencilIcon />
      </button>
    </div>
  )
}
