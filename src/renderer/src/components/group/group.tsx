import { IconEffect } from '../effect/icon-effect'
import { useCallback, useMemo } from 'react'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { EditEffectModalId } from '../modals/newEffectModal/editEffectModal'
import { CSS } from '@dnd-kit/utilities'
import RepeatIcon from '@renderer/assets/icons/repeat'
import PistolIcon from '@renderer/assets/icons/pistol'
import { useShallow } from 'zustand/react/shallow'
import { BoardID } from 'src/apis/audio/types/boards'
import type { SoundGroup } from 'src/apis/audio/types/items'
import { useSortable } from '@dnd-kit/sortable'
import MoveIcon from '@renderer/assets/icons/move'
import MusicNoteIcon from '@renderer/assets/icons/musicnote'
import SequenceIcon from '@renderer/assets/icons/sequence'

export type GroupProps = {
  group: SoundGroup
  boardID: BoardID
  beingDragged?: boolean
}

export default function Group(props: GroupProps) {
  const { group, boardID, beingDragged } = props

  const {
    getGroup,
    playGroup,
    stopGroup,
    playingGroups,
    editingMode,
    setSelectedIcon,
    setGroupName,
    setEditingGroupID,
    resetWorkingFiles,
    setEditingBoardID,
    setGroupVariant,
    setGroupCategory,
    draggingID,
    resetEditingGroup
  } = useAudioStore(
    useShallow((state) => ({
      getGroup: state.getGroup,
      playGroup: state.playGroup,
      stopGroup: state.stopGroup,
      playingGroups: state.playingGroups,
      editingMode: state.editingMode,
      setSelectedIcon: state.setSelectedIcon,
      setGroupName: state.setGroupName,
      setEditingGroupID: state.setEditingGroupID,
      resetWorkingFiles: state.resetWorkingFiles,
      setEditingBoardID: state.setEditingBoardID,
      setGroupVariant: state.setGroupVariant,
      setGroupCategory: state.setGroupCategory,
      draggingID: state.draggingID,
      resetEditingGroup: state.resetEditingGroup
    }))
  )

  const sourceGroup = useMemo(() => {
    const out = group.type === 'source' ? group : getGroup(group.id)
    return out
  }, [group])

  const { attributes, listeners, setNodeRef, transition, transform } = useSortable({
    id: group.id
  })

  const style = {
    transform: CSS.Transform.toString({
      x: transform?.x ?? 0,
      y: transform?.y ?? 0,
      scaleX: 1.0,
      scaleY: 1.0
    }),
    transition
  }

  const isPlaying = useMemo(() => {
    return playingGroups.includes(group.id)
  }, [playingGroups, group.id])

  const onClickPlay = useCallback(() => {
    if (sourceGroup.variant !== 'Rapid' && isPlaying) {
      stopGroup(group.id)
    } else {
      playGroup(group.id)
    }
  }, [group, isPlaying])

  const onClickEdit = useCallback(() => {
    resetEditingGroup()
    stopGroup(group.id)
    setEditingGroupID(group.id)
    setSelectedIcon(sourceGroup.icon)
    setGroupName(sourceGroup.name)
    resetWorkingFiles(sourceGroup.effects)
    setGroupVariant(sourceGroup.variant)
    setGroupCategory(group.category)

    switch (group.type) {
      case 'reference': {
        setEditingBoardID(group.boardID)
        break
      }
      case 'source': {
        setEditingBoardID(boardID)
        break
      }
    }

    ;(document.getElementById(EditEffectModalId) as HTMLDialogElement).showModal()
  }, [group, sourceGroup, boardID])

  const onClick = useMemo(() => {
    if (editingMode === 'Editing') {
      return onClickEdit
    }
    return onClickPlay
  }, [editingMode, onClickEdit, onClickPlay])

  const variantIcon = useMemo(() => {
    switch (sourceGroup.variant) {
      case 'Looping': {
        return (
          <span
            className={`
              indicator-item
              rounded-full
              indicator-bottom
              indicator-start
              badge-neutral
            `}
          >
            <RepeatIcon className="h-4 w-4 m-1" />
          </span>
        )
      }
      case 'Rapid': {
        return (
          <span
            className={`
              indicator-item
              rounded-full
              indicator-bottom
              indicator-start
              badge-neutral
            `}
          >
            <PistolIcon className="h-4 w-4 m-1" />
          </span>
        )
      }
      case 'Soundtrack': {
        return (
          <span
            className={`
            indicator-item
            rounded-full
            indicator-bottom
            indicator-start
            badge-neutral
          `}
          >
            <MusicNoteIcon className="h-4 w-4 m-1" />
          </span>
        )
      }
      case 'Sequence': {
        return (
          <span
            className={`
            indicator-item
            rounded-full
            indicator-bottom
            indicator-start
            badge-neutral
          `}
          >
            <SequenceIcon className="h-4 w-4 m-1" />
          </span>
        )
      }
      default: {
        return <></>
      }
    }
  }, [sourceGroup.variant])

  return (
    <div
      className={`relative ${draggingID === group.id && !beingDragged ? 'opacity-0' : 'opacity-100'}`}
    >
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        onClick={onClick}
        role="button"
        className={`
        cursor-pointer
        hover:brightness-125
        hover:drop-shadow-lg
        hover
        z-0
        touch-none
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
          <IconEffect icon={sourceGroup.icon} />
          {variantIcon}
          <span
            className={`
              select-none
              absolute
              z-10
              w-full
              h-full
              text-sm
              flex
              justify-center
              items-center
              bg-base-300
              p-1
              rounded-md
              opacity-0
              hover:opacity-90
              transition-opacity
            `}
          >
            {sourceGroup.name}
          </span>
        </div>
        <div
          className={`
          ${editingMode === 'Off' ? 'hidden' : 'visible'}
          absolute
          top-0
          right-0
          rounded-lg
          p-1
          bg-black
        `}
          {...listeners}
        >
          <MoveIcon className="stroke-white" />
        </div>
      </div>
    </div>
  )
}
