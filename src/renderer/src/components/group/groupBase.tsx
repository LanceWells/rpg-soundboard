import { useSortable } from '@dnd-kit/sortable'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { ISoundGroup } from 'src/apis/audio/types/items'
import { CSS } from '@dnd-kit/utilities'
import { IconEffect } from '../effect/icon-effect'
import GroupIcon from './groupIcon'
import MoveIcon from '@renderer/assets/icons/move'

export type GroupBaseProps = {
  group: ISoundGroup
  beingDragged?: boolean
  onClickEdit: () => void
  onClickPlay: () => void
}

export default function GroupBase(props: GroupBaseProps) {
  const { group, beingDragged, onClickEdit, onClickPlay } = props

  const { attributes, listeners, setNodeRef, transition, transform } = useSortable({
    id: group.id
  })

  const draggingID = useAudioStore((store) => store.draggingID)
  const playingGroups = useAudioStore((store) => store.playingGroups)
  const editingMode = useAudioStore((store) => store.editingMode)

  const isPlaying = playingGroups.includes(group.id)

  const onClick = editingMode === 'Editing' ? onClickEdit : onClickPlay

  const style = {
    transform: CSS.Transform.toString({
      x: transform?.x ?? 0,
      y: transform?.y ?? 0,
      scaleX: 1.0,
      scaleY: 1.0
    }),
    transition
  }

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
            before:[transition-property:all]
            before:[transition-timing-function:cubic-bezier(0.4,0,0.2,1)]
            before:[transition-duration:150ms]
            before:-z-10
            before:absolute
            
            before:rounded-xl
            before:animate-radialspin
            before:bg-[radial-gradient(circle_at_center,lightgreen,rebeccapurple)]
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
