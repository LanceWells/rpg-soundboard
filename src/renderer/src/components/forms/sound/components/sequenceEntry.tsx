import { DeleteIcon } from '@renderer/assets/icons'
import { GroupIcon } from '@renderer/components/icon/base'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { SoundGroupSequenceElement, SoundGroupSequenceGroup } from 'src/apis/audio/types/items'
import { useShallow } from 'zustand/shallow'
import { FormInput } from '../types'

/**
 * Props for {@link SequenceEntry}.
 */
export type SequenceEntryProps = {
  /**
   * The sequence element data (group reference or delay) to render.
   */
  element: SoundGroupSequenceElement
  /**
   * Position of this element in the sequence list.
   */
  index: number
  /**
   * Whether this element is currently being previewed.
   */
  isPlaying: boolean
}

/**
 * Renders a single sequence element (group or delay) with remove and reorder controls.
 */
export function SequenceEntry(props: SequenceEntryProps) {
  const { element, index, isPlaying } = props

  const { remove } = useFieldArray<FormInput>({
    name: 'request.sequence'
  })

  return (
    <div
      className={`
      bg-base-200
      p-4
      w-full
      h-[140px]
      flex
      items-center
      justify-between
      relative
      rounded-md
      shadow
      border-2
      ${isPlaying ? 'border-green-50' : 'border-black'}
    `}
    >
      {element.type === 'group' && <SequenceGroupEntry element={element} />}
      {element.type === 'delay' && <SequenceDelayEntry index={index} />}
      <div
        role="button"
        className={`
        btn
        btn-circle
        btn-error
        absolute
        -top-5
        -right-5
      `}
        onClick={() => remove(index)}
      >
        <DeleteIcon />
      </div>
      <SequenceMoveButtons index={index} />
    </div>
  )
}

type SequenceGroupEntryProps = {
  element: SoundGroupSequenceGroup
}

function SequenceGroupEntry(props: SequenceGroupEntryProps) {
  const { element } = props
  const group = useAudioStore(useShallow((store) => store.getGroup(element.groupID)))

  return (
    <>
      <GroupIcon icon={group.icon} />
      {group.name}
    </>
  )
}

type SequenceDelayEntryProps = {
  index: number
}

function SequenceDelayEntry(props: SequenceDelayEntryProps) {
  const { index } = props
  const { register } = useFormContext<FormInput>()

  return (
    <div className="flex flex-col">
      <span>Delay (in ms)</span>
      <input
        type="number"
        placeholder="-15000 <= x <= 15000"
        min="-15000"
        max="15000"
        required
        className={`
        input
        validator
      `}
        {...register(`request.sequence.${index}.msToDelay`)}
      />
      <p className="validator-hint">Must be a valid number between -15000 and 15000</p>
    </div>
  )
}

type SequenceMoveButtonsProps = {
  index: number
}

function SequenceMoveButtons(props: SequenceMoveButtonsProps) {
  const { index } = props

  const { watch } = useFormContext<FormInput>()
  const sequenceLength = watch('request.sequence').length

  const { move } = useFieldArray<FormInput>({
    name: 'request.sequence'
  })

  return (
    <div
      className={`
        max-w-[40px]
        w-[40px]
        p-2
      `}
    >
      <div
        className={`
          btn
          btn-circle
          ${index === 0 ? 'hidden' : 'visible'}
        `}
        role="button"
        onClick={() => move(index, index - 1)}
      >
        👆
      </div>
      <div
        className={`
          btn
          btn-circle
          ${index === sequenceLength - 1 ? 'hidden' : 'visible'}
        `}
        role="button"
        onClick={() => move(index, index + 1)}
      >
        👇
      </div>
    </div>
  )
}
