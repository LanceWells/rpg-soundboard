import { useSortable } from '@dnd-kit/sortable'
import {
  SequenceElementID,
  SoundGroupSequenceDelay,
  SoundGroupSequenceElement,
  SoundGroupSequenceGroup
} from 'src/apis/audio/types/items'
import { CSS } from '@dnd-kit/utilities'
import { IconEffect } from '@renderer/components/effect/icon-effect'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import BarsIcon from '@renderer/assets/icons/bars'
import DeleteIcon from '@renderer/assets/icons/delete'
import { produce } from 'immer'

type SequenceItemProps = {
  sequence: SoundGroupSequenceElement
}

export default function SequenceItem(props: SequenceItemProps) {
  const { sequence } = props

  const updateSequenceElements = useAudioStore((state) => state.updateSequenceElements)
  const editingSequence = useAudioStore((state) => state.editingSequence)
  const playingSounds = useAudioStore((state) => state.playingSequenceSounds)

  const { attributes, listeners, setNodeRef, transition, transform } = useSortable({
    id: sequence.id
  })

  const removeGroup = (sequenceID: SequenceElementID) => {
    const newSequence = editingSequence?.sequence.filter((g) => g.id !== sequenceID) ?? []
    updateSequenceElements(newSequence)
  }

  const style = {
    transform: CSS.Transform.toString({
      x: transform?.x ?? 0,
      y: transform?.y ?? 0,
      scaleX: 1.0,
      scaleY: 1.0
    }),
    transition
  }

  const thisSoundPlaying = playingSounds.has(sequence.id)

  const getElement = () => {
    if (sequence.type === 'delay') {
      return <SequenceItemDelay sequence={sequence} />
    } else if (sequence.type === 'group') {
      return <SequenceItemGroup sequence={sequence} />
    }

    return <span>ERROR: Unknown type</span>
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`
        grid
        grid-cols-[min-content_1fr_min-content]
        items-center
        w-full
        gap-2
        p-2
        bg-base-200
        rounded-md
        transition
        ${thisSoundPlaying && 'ring-2 ring-green-700 ring-offset-2'}
      `}
    >
      <button {...listeners}>
        <BarsIcon className="w-4 h-4 stroke-0" />
      </button>
      {getElement()}
      <button onClick={() => removeGroup(sequence.id)} className="btn btn-error btn-circle btn-xs">
        <DeleteIcon />
      </button>
    </div>
  )
}

type SequenceItemDelayProps = {
  sequence: SoundGroupSequenceDelay
}

export function SequenceItemDelay(props: SequenceItemDelayProps) {
  const { sequence } = props

  const updateSequenceElements = useAudioStore((state) => state.updateSequenceElements)
  const sequenceElements = useAudioStore((state) => state.editingSequence)

  const updateThisTiming: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const newSequence = produce(sequenceElements, (draft) => {
      const thisElement = draft?.sequence.find((s) => s.id === sequence.id && s.type)
      if (!thisElement || thisElement.type !== 'delay') {
        return
      }

      thisElement.msToDelay = e.target.valueAsNumber
    })

    if (newSequence === undefined) {
      return
    }

    updateSequenceElements(newSequence.sequence)
  }

  return (
    <input
      type="number"
      className="input validator"
      required
      placeholder="Delay (in ms)"
      min="-10000"
      max="10000"
      title="Must be between -10000 and 10000"
      onChange={updateThisTiming}
    />
  )
}

type SequenceItemGroupProps = {
  sequence: SoundGroupSequenceGroup
}

export function SequenceItemGroup(props: SequenceItemGroupProps) {
  const { sequence } = props

  const getGroup = useAudioStore((state) => state.getGroup)
  const group = getGroup(sequence.groupID)

  return (
    <div className="flex flex-row items-center gap-2">
      <IconEffect size={32} icon={group.icon} className="w-8 h-8" />
      {group.name}
    </div>
  )
}
