import { ChangeEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import SoundIcon from '@renderer/assets/icons/sound'
import CloseIcon from '@renderer/assets/icons/close'
import StopIcon from '@renderer/assets/icons/stop'
import { useShallow } from 'zustand/react/shallow'
import { SoundEffectEditableFields } from 'src/apis/audio/types/items'
import { NewSoundContainer } from '@renderer/utils/soundContainer/util'

export type FileSelectInputProps = {
  className?: string
  error?: string
}

export function FileSelectInput(props: FileSelectInputProps) {
  const { className, error } = props

  const { addWorkingFiles } = useAudioStore(
    useShallow((state) => ({
      addWorkingFiles: state.addWorkingFiles
    }))
  )

  const fileInputRef = useRef<HTMLInputElement>(null)

  const onAddFile = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      if (!e.target.files || e.target.files.length === 0) {
        return
      }

      const newFile = e.target.files.item(0)!
      const { webUtils } = require('electron')
      const newPath = webUtils.getPathForFile(newFile)

      addWorkingFiles({
        path: newPath,
        volume: 100,
        name: newFile.name
      })
    },
    [fileInputRef, addWorkingFiles]
  )

  return (
    <div className={`form-control max-w-80 ${className}`}>
      <div className="label">
        <span className="label-text">New File</span>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        onChange={onAddFile}
        accept="audio/*"
        className={`
          file-input
          file-input-bordered
          ${error ? 'file-input-error' : ''}
        `}
      />
      <div className="label">
        <span className="label-text-alt text-error">{error ?? ''}</span>
      </div>
    </div>
  )
}

export type FileSelectListProps = {
  className?: string
}

export default function FileSelectList(props: FileSelectListProps) {
  const { className } = props
  const { editingGroup, removeWorkingFile } = useAudioStore(
    useShallow((state) => ({
      editingGroup: state.editingGroup,
      removeWorkingFile: state.removeWorkingFile
    }))
  )

  const onRemoveFile = useCallback((i: number) => {
    removeWorkingFile(i)
  }, [])

  const fileEntries = useMemo(
    () =>
      editingGroup?.effects.map((f, i) => (
        <FileEntry name={f.name} onClick={onRemoveFile} index={i} file={f} key={`file-${f.path}`} />
      )) ?? [],
    [editingGroup]
  )

  return (
    <div
      className={`
        bg-base-200
        max-w-80
        w-80
        max-h-[340px]
        h-[340px]
        overflow-x-hidden
        overflow-y-scroll
        rounded-lg
        flex
        flex-col
        gap-y-4
        ${className}
      `}
    >
      {fileEntries}
    </div>
  )
}

type FileEntryProps = {
  file: SoundEffectEditableFields
  name: string
  index: number
  onClick: (i: number) => void
}

function FileEntry(props: FileEntryProps) {
  const { file, index, onClick } = props

  const [playState, setPlayState] = useState<'Loading' | 'Playing' | 'Stopped'>('Loading')

  const { updateWorkingFile } = useAudioStore(
    useShallow((state) => ({
      updateWorkingFile: state.updateWorkingFile
    }))
  )

  const stopHandler = useRef<() => void>(null)
  const volumeHandler = useRef<(volume: number) => void>(null)
  const playHandler = useRef<() => void>(null)

  useEffect(() => {
    async function loadSound() {
      const soundData = await window.audio.Sounds.Preview({
        effect: {
          path: file.path,
          volume: file.volume,
          name: file.name
        }
      })

      const handleStop = () => {
        setPlayState('Stopped')
      }

      const handleLoaded = () => {
        setPlayState('Stopped')
      }

      // const sound = NewSoundContainer('Default', {
      //   format: soundData.format,
      //   src: soundData.soundB64,
      //   volume: file.volume,
      //   stopHandler: {
      //     id: undefined,
      //     handler: handleStop
      //   },
      //   loadedHandler: {
      //     handler: handleLoaded
      //   },
      //   // Preview sounds are data URLs, so don't use html5.
      //   useHtml5: false
      // })

      const sound = NewSoundContainer('Default', undefined, {
        effects: [
          {
            format: soundData.format,
            path: soundData.soundB64,
            volume: soundData.volume,
            id: 'eff-1-1-1-1-1',
            name: 'preview',
            useHtml5: false
          }
        ],
        loadedHandler: {
          handler: handleLoaded
        },
        stopHandler: {
          id: undefined,
          handler: handleStop
        }
      })

      stopHandler.current = () => sound.Stop()
      volumeHandler.current = (volume: number) => sound.ChangeVolume(volume)
      playHandler.current = () => sound.Play()
    }

    if (file.path) {
      loadSound()
    }
  }, [file.path, file.volume, setPlayState])

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

      updateWorkingFile(index, volToSet)

      if (playState === 'Playing' && volumeHandler.current) {
        volumeHandler.current(volToSet)
      }
    },
    [file.volume, index, updateWorkingFile, volumeHandler, playState]
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
        grid-cols-[minmax(0,_1fr)_min-content]
        w-full
        max-w-80
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
        [grid-area:_title]
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
        [grid-area:_delete]
        `}
      >
        <CloseIcon />
      </button>
      <input
        type="range"
        min="0"
        max="100"
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
        [grid-area:_preview]
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
