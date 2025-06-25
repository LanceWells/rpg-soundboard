import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { ISoundGroupSource } from 'src/apis/audio/types/items'
import { IconEffect } from '../effect/icon-effect'
import GroupIcon from './groupIcon'
import { useShallow } from 'zustand/shallow'

export type GroupBaseProps = {
  group: ISoundGroupSource
  beingDragged?: boolean
  onClickEdit: () => void
  onClickPlay: () => void
}

export default function GroupBase(props: GroupBaseProps) {
  const { group, onClickEdit, onClickPlay } = props

  const editingMode = useAudioStore((store) => store.editingMode)
  const isPlaying = useAudioStore(
    useShallow((store) => store.playingGroups.some((g) => g === group.id))
  )

  const onClick = editingMode === 'Editing' ? onClickEdit : onClickPlay

  return (
    <div
      onClick={onClick}
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
          before:[transition-property:all]
          before:[transition-timing-function:cubic-bezier(0.4,0,0.2,1)]
          before:[transition-duration:150ms]
          before:-z-10
          before:absolute
          before:rounded-xl
          before:animate-radialspin
          before:bg-[radial-gradient(circle_at_center,lightgreen,rebeccapurple)]
          `
            : `
          before:-top-0
          before:-right-0
          before:-left-0
          before:-bottom-0
          `
        }
      `}
    >
      <IconEffect icon={group.icon} />
      <GroupIcon variant={group.variant} />
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
        {group.name}
      </span>
    </div>
  )
}
