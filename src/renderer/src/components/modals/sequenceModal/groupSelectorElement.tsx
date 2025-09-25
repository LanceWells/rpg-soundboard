import { useDraggable } from '@dnd-kit/core'
import { IconEffect } from '@renderer/components/effect/icon-effect'
import { SoundGroupSource } from 'src/apis/audio/types/items'
import { CSSProperties } from 'react'

export type SelectorElementProps = { g: SoundGroupSource; style: CSSProperties }

export function SelectorElement(props: SelectorElementProps) {
  const { g, style } = props

  const { attributes, listeners, setNodeRef } = useDraggable({ id: g.id })

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
        mb-2
        absolute
        justify-between
        btn
        `}
    >
      <IconEffect size={32} icon={g.icon} className="w-8 h-8" />
      <span className="select-none">{g.name}</span>
    </button>
  )
}
