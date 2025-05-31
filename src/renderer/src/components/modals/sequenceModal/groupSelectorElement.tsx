import { CSS } from '@dnd-kit/utilities'
import { useDraggable } from '@dnd-kit/core'
import { IconEffect } from '@renderer/components/effect/icon-effect'
import { SoundGroupSource } from 'src/apis/audio/types/items'

export type SelectorElementProps = { g: SoundGroupSource }

export function SelectorElement(props: SelectorElementProps) {
  const { g } = props

  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: g.id })

  const style = {
    transform: CSS.Transform.toString({
      x: transform?.x ?? 0,
      y: transform?.y ?? 0,
      scaleX: 1.0,
      scaleY: 1.0
    })
  }

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`
        flex
        h-12
        max-h-12
        flex-row
        gap-2
        items-center
        bg-base-200
        rounded-md
        p-2
        w-full
        my-2
        `}
    >
      <IconEffect size={32} icon={g.icon} className="w-8 h-8" />
      <span className="select-none">{g.name}</span>
    </button>
  )
}
