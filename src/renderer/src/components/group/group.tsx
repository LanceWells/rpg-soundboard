import { IconEffect } from '../effect/icon-effect'
import { useCallback, useMemo } from 'react'
import { useAudioStore } from '@renderer/stores/audioStore'
import { EditEffectModalId } from '../modals/newEffectModal/editEffectModal'
import RepeatIcon from '@renderer/assets/icons/repeat'
import PistolIcon from '@renderer/assets/icons/pistol'
import { useShallow } from 'zustand/react/shallow'
import { BoardID } from 'src/apis/audio/types/boards'
import { SoundGroup } from 'src/apis/audio/types/items'
import MoveIcon from '@renderer/assets/icons/move'

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
    setGroupVariant,
    setGroupCategory
  } = useAudioStore(
    useShallow((state) => ({
      playGroup: state.playGroup,
      stopGroup: state.stopGroup,
      playingGroups: state.playingGroups,
      editingMode: state.editingMode,
      setEditingGroupID: state.setEditingGroupID,
      setSelectedIcon: state.setSelectedIcon,
      setGroupName: state.setGroupName,
      resetWorkingFiles: state.resetWorkingFiles,
      setEditingBoardID: state.setEditingBoardID,
      setGroupVariant: state.setGroupVariant,
      setGroupCategory: state.setGroupCategory
    }))
  )

  const isPlaying = useMemo(() => {
    return playingGroups.includes(group.id)
  }, [playingGroups, group.id])

  const onClickPlay = useCallback(() => {
    if (group.variant !== 'Rapid' && isPlaying) {
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
    setGroupVariant(group.variant)
    setGroupCategory(group.category)
    ;(document.getElementById(EditEffectModalId) as HTMLDialogElement).showModal()
  }, [group, boardID])

  const variantIcon = useMemo(() => {
    switch (group.variant) {
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
      default: {
        return <></>
      }
    }
  }, [group.variant])

  const clickHandler = useMemo(() => {
    switch (editingMode) {
      case 'Editing': {
        return onClickEdit
      }
      default: {
        return onClickPlay
      }
    }
  }, [editingMode])

  return (
    <div
      // ref={dragProps.setNodeRef}
      // style={style}
      // {...dragProps.attributes}
      // {...attributes}
      // style={style}
      // ref={setNodeRef}
      onClick={clickHandler}
      role="button"
      className={`
        relative
        cursor-pointer
        hover:brightness-125
        hover:drop-shadow-lg
        hover
        z-0
      `}
    >
      <div
        // {...dragProps.listeners}
        // {...listeners}
        className={`
          ${editingMode === 'Off' ? 'hidden' : 'visible'}
          rounded-full
          absolute
          -bottom-4
          -left-5
          bg-primary
        `}
      >
        <MoveIcon />
      </div>
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
        {variantIcon}
      </div>
      <span className="text-sm flex justify-center">{group.name}</span>
    </div>
  )
}
