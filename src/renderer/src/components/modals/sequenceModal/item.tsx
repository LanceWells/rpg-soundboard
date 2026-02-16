import {
  SoundGroupSequenceDelay,
  SoundGroupSequenceElement,
  SoundGroupSequenceGroup
} from 'src/apis/audio/types/items'
import { IconEffect } from '@renderer/components/effect/icon-effect'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { produce } from 'immer'
import { DragContainer } from '@renderer/utils/dragContainer'

type SequenceItemProps = {
  sequence: SoundGroupSequenceElement
}

export default function SequenceItem(props: SequenceItemProps) {
  const { sequence } = props

  const getElement = () => {
    if (sequence.type === 'delay') {
      return <SequenceItemDelay sequence={sequence} />
    } else if (sequence.type === 'group') {
      return <SequenceItemGroup sequence={sequence} />
    }

    return <span>ERROR: Unknown type</span>
  }

  return <DragContainer id={sequence.id}>{getElement()}</DragContainer>
}

type SequenceItemDelayProps = {
  sequence: SoundGroupSequenceDelay
}

export function SequenceItemDelay(props: SequenceItemDelayProps) {
  const { sequence } = props

  const updateSequenceElements = useAudioStore((state) => state.updateEditingSequenceV2)
  const sequenceElements = useAudioStore((state) => state?.editingElementsV2?.sequence)

  const updateThisTiming: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const newSequence = produce(sequenceElements, (draft) => {
      const thisElement = draft?.element?.sequence.find((s) => s.id === sequence.id && s.type)
      if (!thisElement || thisElement.type !== 'delay') {
        return
      }

      thisElement.msToDelay = e.target.valueAsNumber
    })

    if (newSequence === null) {
      return
    }

    updateSequenceElements({ sequence: newSequence?.element?.sequence })
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
      value={sequence.msToDelay}
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
