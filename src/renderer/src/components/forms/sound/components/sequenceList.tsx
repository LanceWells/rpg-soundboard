import { useFieldArray, useFormContext } from 'react-hook-form'
import { FormInput } from '../types'
import { SequenceEntry } from './sequenceEntry'
import { SequenceElementID } from 'src/apis/audio/types/items'
import { v4 } from 'uuid'
import { SequenceSoundContainer } from '@renderer/utils/soundContainer/variants/sequence'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { useRef, useState } from 'react'
import { Ctx } from '@renderer/rpgAudioEngine'
import { SoundIcon, StopIcon } from '@renderer/assets/icons'
import { produce } from 'immer'

export function SequenceList() {
  const { append } = useFieldArray<FormInput>({
    name: 'request.sequence'
  })

  const { watch } = useFormContext<FormInput>()
  const sequenceElements = watch('request.sequence')

  const [playingElements, setPlayingElements] = useState<Record<SequenceElementID, boolean>>({})
  const entries = (sequenceElements ?? []).map((e, i) => (
    <SequenceEntry index={i} element={e} key={e.id} isPlaying={!!playingElements[e.id]} />
  ))

  const appendDelay = () => {
    append({
      type: 'delay',
      msToDelay: 0,
      id: `seq-${v4()}` as SequenceElementID
    })
  }

  return (
    <div>
      <div role="button">Preview</div>
      <div
        className={`
        h-[340px]
        max-h-[340px]
        overflow-y-scroll
        bg-base-300
        p-6
        rounded-md
        relative
        rounded-t-none
        flex
        flex-col
        gap-8
      `}
      >
        {entries}
      </div>
      <div className="m-2 flex flex-row gap-2">
        <div role="button" className="btn btn-secondary" onClick={appendDelay}>
          Add Delay
        </div>
        <PreviewButton
          setIsElementPlaying={(id, isPlaying) => {
            setPlayingElements((prevState) =>
              produce(prevState, (draft) => {
                draft[id] = isPlaying
              })
            )
          }}
        />
      </div>
    </div>
  )
}

type PreviewButtonProps = {
  setIsElementPlaying: (id: SequenceElementID, isPlaying: boolean) => void
}

function PreviewButton(props: PreviewButtonProps) {
  const { setIsElementPlaying } = props

  const { watch } = useFormContext<FormInput>()
  const sequenceElements = watch('request.sequence')

  const getSounds = useAudioStore((store) => store.getSounds)

  const [isGroupPlaying, setIsGroupPlaying] = useState(false)

  const previewContainerRef = useRef<SequenceSoundContainer | null>(null)

  const previewSound = async () => {
    const effectPromises = SequenceSoundContainer.ApiToSetupElements(sequenceElements, getSounds)

    const effects = await Promise.all(effectPromises)

    const newContainer = new SequenceSoundContainer(
      {
        effectGroups: effects,
        elementPlayingHandler(sequenceElementID) {
          setIsElementPlaying(sequenceElementID, true)
        },
        elementStoppedHandler(sequenceElementID) {
          setIsElementPlaying(sequenceElementID, false)
        },
        stoppedHandler: {
          id: '',
          handler: () => setIsGroupPlaying(false)
        }
      },
      Ctx.Effectless
    )

    await newContainer.Init()

    previewContainerRef.current = newContainer
    newContainer.Play()
    setIsGroupPlaying(true)
  }

  const stopSound = () => {
    previewContainerRef.current?.Stop()
  }

  return (
    <div>
      {!isGroupPlaying && (
        <div
          onClick={previewSound}
          role="button"
          className={`
            btn
            btn-circle
            btn-secondary
          `}
        >
          <SoundIcon />
        </div>
      )}
      {isGroupPlaying && (
        <div
          onClick={stopSound}
          role="button"
          className={`
            btn
            btn-circle
            btn-secondary
          `}
        >
          <StopIcon />
        </div>
      )}
    </div>
  )
}
