import { CSS } from '@dnd-kit/utilities'
import { useDraggable } from '@dnd-kit/core'
import { IconEffect } from '@renderer/components/effect/icon-effect'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { SoundGroupSource } from 'src/apis/audio/types/items'
import { useShallow } from 'zustand/shallow'

export default function SequenceGroupSelector() {
  const { boards } = useAudioStore(
    useShallow((state) => ({
      boards: state.boards,
      activeBoardID: state.activeBoardID,
      editingBoard: state.editingBoard
    }))
  )

  const groups = boards
    .flatMap((b) => b.groups)
    .filter((g) => g.type === 'source')
    .map((g) => <SelectorElement g={g} key={g.id} />)

  return (
    <div
      className={`
      rounded-md
      flex
      gap-2
      p-2
      bg-base-300
      h-full
      overflow-y-scroll
      overflow-x-hidden
      flex-col
    `}
    >
      {groups}
    </div>
  )
}

export function SelectorElement({ g }: { g: SoundGroupSource }) {
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
      className="flex flex-row gap-2 items-center bg-base-200 rounded-md p-2"
    >
      <IconEffect size={32} icon={g.icon} className="w-8 h-8" />
      <span className="select-none">{g.name}</span>
    </button>
  )
}
