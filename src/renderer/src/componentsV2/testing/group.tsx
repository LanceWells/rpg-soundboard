import WoodenShelf from '@renderer/assets/images/WoodShelf.png'
import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import LoopingTag from '@renderer/assets/images/Tags/Looping.png'
import RapidTag from '@renderer/assets/images/Tags/Rapid.png'
import SoundtrackTag from '@renderer/assets/images/Tags/Soundtrack.png'
import SequenceTag from '@renderer/assets/images/Tags/Sequence.png'
import { MemoizedGroupIcon } from './groupIcon'
import { GroupID } from 'src/apis/audio/types/groups'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { useShallow } from 'zustand/shallow'
import { useCallback } from 'react'

export type GroupBaseProps = {
  id: GroupID
}

export function GroupBase(props: GroupBaseProps) {
  const { id } = props

  const getGroup = useAudioStore((store) => store.getGroup)
  const group = getGroup(id)

  const { playGroup, stopGroup, isPlaying, resetEditingGroup, editBoard } = useAudioStore(
    useShallow((state) => ({
      playGroup: state.playGroup,
      stopGroup: state.stopGroup,
      isPlaying: state.playingGroups.some((g) => g === group.id),
      resetEditingGroup: state.updateEditingSourceV2,
      editBoard: state.updateEditingBoardV2
    }))
  )

  const onClickPlay = useCallback(() => {
    if (group.variant !== 'Rapid' && isPlaying) {
      stopGroup(group.id)
    } else {
      playGroup(group.id)
    }
  }, [group, isPlaying])

  return (
    <button
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
      {/* <img
        className={`
          absolute
          top-2
          w-[120px]
          w-max-[120px]
          h-[120px]
          h-max-[120px]
          z-10
          left-1/2
          transform-[translate(-50%,_0)]
      `}
        src={src}
      /> */}
      <MemoizedGroupIcon
        icon={{
          name: group.icon.name,
          backgroundColor: 'black',
          foregroundColor: group.icon.foregroundColor
        }}
      />
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
        z-20
        left-3
        p-1
        pointer-events-none
        text-black
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
  )
}

export type VariantTagProps = {
  variant: SoundVariants
  className: string
}

function VariantTag(props: VariantTagProps) {
  const { variant, className } = props
  switch (variant) {
    case 'Looping':
      return <img className={className} src={LoopingTag} />
    case 'Rapid':
      return <img className={className} src={RapidTag} />
    case 'Sequence':
      return <img className={className} src={SequenceTag} />
    case 'Soundtrack':
      return <img className={className} src={SoundtrackTag} />
    default:
      return null
  }
}
