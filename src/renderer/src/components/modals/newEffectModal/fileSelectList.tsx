import { ChangeEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAudioStore } from '@renderer/stores/audioStore'
import SoundIcon from '@renderer/assets/icons/sound'
import CloseIcon from '@renderer/assets/icons/close'
import { SoundContainer } from '@renderer/utils/soundContainer'
import { SoundEffectEditableFields } from 'src/apis/audio/interface'
import StopIcon from '@renderer/assets/icons/stop'
import { useShallow } from 'zustand/react/shallow'

export type FileSelectInputProps = {
  className?: string
  error?: string
}

export function FileSelectInput(props: FileSelectInputProps) {
  const { className, error } = props

  const { addWorkingFiles } = useAudioStore((state) => ({
    addWorkingFiles: state.addWorkingFiles
  }))

  const fileInputRef = useRef<HTMLInputElement>(null)

  const onAddFile = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      if (!e.target.files || e.target.files.length === 0) {
        return
      }

      const newFile = e.target.files.item(0)!

      addWorkingFiles({
        path: newFile.path,
        volume: 100
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
      editingGroup.effects.map((f, i) => (
        <FileEntry onClick={onRemoveFile} index={i} file={f} key={`file-${f.path}`} />
      )),
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
  index: number
  onClick: (i: number) => void
}

function FileEntry(props: FileEntryProps) {
  const { file, index, onClick } = props

  const [isPlaying, setIsPlaying] = useState(false)
  const stopHandler = useRef<() => void>()
  const volumeHandler = useRef<(volume: number) => void>()

  const { updateWorkingFile } = useAudioStore((state) => ({
    updateWorkingFile: state.updateWorkingFile
  }))

  const fileName = useMemo(() => {
    const pathSegments = new Array(...file.path.split(/[/\\]/))
    return pathSegments.at(-1) ?? ''
  }, [file])

  const onClickRemove = useCallback(() => {
    onClick(index)
  }, [index, onclick])

  const onClickTest = useCallback(async () => {
    if (!isPlaying) {
      const soundData = await window.audio.Sounds.Preview({
        effect: {
          path: file.path,
          volume: file.volume
        }
      })

      const handleStop = () => {
        setIsPlaying(false)
        stopHandler.current = undefined
      }

      const sound = new SoundContainer<undefined>({
        format: soundData.format,
        src: soundData.soundB64,
        volume: file.volume,
        stopHandler: {
          id: undefined,
          handler: handleStop
        },
        variant: 'Default'
      })

      setIsPlaying(true)

      stopHandler.current = sound.GetStopHandle()
      volumeHandler.current = sound.GetVolumeHandle()

      sound.Play()
    } else {
      if (stopHandler.current) {
        stopHandler.current()
      }

      stopHandler.current = undefined
      setIsPlaying(false)
    }
  }, [file, file.volume, isPlaying, stopHandler])

  const onChangeVolume = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const parsedVol = parseInt(e.target.value)
      const volToSet = isNaN(parsedVol) ? 100 : parsedVol

      updateWorkingFile(index, volToSet)

      if (isPlaying && volumeHandler.current) {
        volumeHandler.current(volToSet)
      }
    },
    [file.volume, index, updateWorkingFile, volumeHandler, isPlaying]
  )

  useEffect(() => {
    return () => {
      if (stopHandler.current) {
        stopHandler.current()
      }
    }
  }, [])

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
        {fileName}
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
        btn-secondary
        [grid-area:_preview]
      `}
      >
        <SoundIcon className={isPlaying ? 'hidden' : 'visible'} />
        <StopIcon className={isPlaying ? 'visible' : 'hidden'} />
      </button>
    </div>
  )
}
