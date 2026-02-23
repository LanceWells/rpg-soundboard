import CloseIcon from '@renderer/assets/icons/close'
import SoundIcon from '@renderer/assets/icons/sound'
import StopIcon from '@renderer/assets/icons/stop'
import { ISoundContainer } from '@renderer/utils/soundContainer/interface'
import { NewSoundContainer } from '@renderer/utils/soundContainer/util'
import { useState, useRef, useEffect, useCallback, ChangeEventHandler } from 'react'
import { SoundEffectEditableFields } from 'src/apis/audio/types/items'

export type FileEntryProps = {
  file: SoundEffectEditableFields
  name: string
  index: number
  onClickRemove: (i: number) => void
  onChangeVolume: (i: number, newVolume: number) => void
}

export function FileEntry(props: FileEntryProps) {
  const { file, index, onClickRemove: onClick, onChangeVolume: handleChangeVolume } = props

  const [playState, setPlayState] = useState<'Loading' | 'Playing' | 'Stopped'>('Loading')

  const stopHandler = useRef<() => void>(null)
  const volumeHandler = useRef<(volume: number) => void>(null)
  const playHandler = useRef<() => void>(null)
  const soundRef = useRef<ISoundContainer | null>(null)

  useEffect(() => {
    async function loadSound() {
      const newSoundData = await window.audio.Sounds.Preview({
        effect: {
          path: file.path,
          name: file.name,
          volume: file.volume
        }
      })

      setPlayState('Stopped')

      const handleStop = () => {
        if (soundRef.current) {
          soundRef.current.Stop()
        }
        setPlayState('Stopped')
      }

      volumeHandler.current = (volume: number) => {
        if (soundRef.current) {
          // This is more of a hack, but if we change volume while the sound is playing, then we get
          // a huge amount of multilayering which distorts the audio and blasts the eardrums. This
          // could be fixed by figuring out this lifecycle better, but I'm tired of working on this.
          soundRef.current.Stop()
          soundRef.current.ChangeVolume(volume)
        }
      }

      playHandler.current = () => {
        soundRef.current = NewSoundContainer('Default', undefined, {
          effects: [
            {
              format: newSoundData.format,
              path: newSoundData.soundB64,
              volume: newSoundData.volume,
              id: 'eff-1-1-1-1-1',
              // Preview sounds are shortened and use data URLs. It's not necessary to use a media
              // loader here.
              useHtml5: false,
              name: file.name
            }
          ],
          stopHandler: {
            id: '',
            handler: handleStop
          }
        })

        soundRef.current.Play()
        setPlayState('Playing')
      }

      stopHandler.current = () => {
        if (soundRef.current) {
          soundRef.current.Stop()
        }
      }
    }

    loadSound()
  }, [file.path, file.name, file.volume])

  const onClickRemove = useCallback(() => {
    onClick(index)
  }, [index, onclick])

  const onClickTest = useCallback(async () => {
    if (!playHandler.current) {
      return
    }

    switch (playState) {
      case 'Playing': {
        if (stopHandler.current) {
          stopHandler.current()
        }

        setPlayState('Stopped')
        break
      }
      case 'Stopped': {
        if (playHandler.current) {
          playHandler.current()
        }
        setPlayState('Playing')
        break
      }
      default: {
        break
      }
    }
  }, [playHandler, stopHandler, playState, setPlayState])

  const onChangeVolume = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const parsedVol = parseInt(e.target.value)
      const volToSet = isNaN(parsedVol) ? 100 : parsedVol

      handleChangeVolume(index, volToSet)

      if (playState === 'Playing' && volumeHandler.current) {
        volumeHandler.current(volToSet)
      }
    },
    [file.volume, index, volumeHandler, playState, handleChangeVolume]
  )

  useEffect(() => {
    return () => {
      if (stopHandler.current) {
        stopHandler.current()
      }
    }
  }, [stopHandler])

  return (
    <div
      className={`
        grid
        items-center
        grid-cols-[minmax(0,1fr)_min-content]
        w-full
        p-4
        gap-x-2
        gap-y-4
        [grid-template-areas:"title_delete"_"slider_preview"]
        `}
    >
      <span
        className={`
        text-ellipsis
        overflow-hidden
        text-nowrap
        [grid-area:title]
        `}
      >
        {file.name}
      </span>
      <button
        onClick={onClickRemove}
        className={`
        btn
        btn-square
        btn-error
        [grid-area:delete]
        `}
      >
        <CloseIcon />
      </button>
      <input
        type="range"
        min="0"
        max="200"
        className="range [grid-area:slider]"
        step="10"
        value={file.volume}
        onChange={onChangeVolume}
      />
      <button
        onClick={onClickTest}
        className={`
          btn
          btn-square
          [grid-area:preview]
          ${playState === 'Loading' ? 'disabled btn-disabled' : 'btn btn-secondary'}
      `}
      >
        <SoundIcon className={playState === 'Stopped' ? 'visible' : 'hidden'} />
        <StopIcon className={playState === 'Playing' ? 'visible' : 'hidden'} />
        <span className={playState === 'Loading' ? 'visible loading' : 'hidden'} />
      </button>
    </div>
  )
}
