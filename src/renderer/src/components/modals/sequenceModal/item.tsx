import { useSortable } from '@dnd-kit/sortable'
import {
  SoundGroupSequenceDelay,
  SoundGroupSequenceElement,
  SoundGroupSequenceGroup
} from 'src/apis/audio/types/items'
import { CSS } from '@dnd-kit/utilities'
import MoveIcon from '@renderer/assets/icons/move'
import { IconEffect } from '@renderer/components/effect/icon-effect'
import { useAudioStore } from '@renderer/stores/audio/audioStore'

type SequenceItemProps = {
  sequence: SoundGroupSequenceElement
}

export default function SequenceItem(props: SequenceItemProps) {
  const { sequence } = props

  if (sequence.type === 'delay') {
    return <SequenceItemDelay sequence={sequence} />
  } else if (sequence.type === 'group') {
    return <SequenceItemGroup sequence={sequence} />
  }

  return <span>ERROR: Unknown type</span>
}

type SequenceItemDelayProps = {
  sequence: SoundGroupSequenceDelay
}

export function SequenceItemDelay(props: SequenceItemDelayProps) {
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
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex flex-row items-center w-full"
    >
      <div {...listeners}>
        <MoveIcon />
      </div>
      <input
        type="number"
        className="input validator"
        required
        placeholder="Delay (in ms)"
        min="-10000"
        max="10000"
        title="Must be between -10000 and 10000"
      />
    </div>
  )
}

type SequenceItemGroupProps = {
  sequence: SoundGroupSequenceGroup
}

export function SequenceItemGroup(props: SequenceItemGroupProps) {
  const { sequence } = props

  const { attributes, listeners, setNodeRef, transition, transform } = useSortable({
    id: sequence.id
  })

  const getGroup = useAudioStore((state) => state.getGroup)

  const group = getGroup(sequence.groupID)

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
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex flex-row items-center w-full"
    >
      <div {...listeners}>
        <MoveIcon />
      </div>
      <IconEffect size={32} icon={group.icon} className="w-8 h-8" />
      {group.name}
    </div>
  )
}
