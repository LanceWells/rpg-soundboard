import { useSortable } from '@dnd-kit/sortable'
import { SoundGroupSequenceElement } from 'src/apis/audio/types/items'
import { CSS } from '@dnd-kit/utilities'
import MoveIcon from '@renderer/assets/icons/move'

type SequenceItemProps = {
  sequence: SoundGroupSequenceElement
}

export default function SequenceItem(props: SequenceItemProps) {
  const { sequence } = props

  const { attributes, listeners, setNodeRef, transition, transform } = useSortable({
    id: sequence.id
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

  return (
    <div>
      <div ref={setNodeRef} style={style} {...attributes} className="flex flex-row">
        <div {...listeners}>
          <MoveIcon />
        </div>
        <input />
        <span>{sequence.id}</span>
      </div>
    </div>
  )
}
