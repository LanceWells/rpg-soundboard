import { ChangeEventHandler, useCallback, useMemo, useRef } from 'react'
import { FileSelectListItem, useAudioStore } from '@renderer/stores/audioStore'

export type FileSelectListProps = {
  className?: string
}

export type FileSelectInputProps = {
  className?: string
  error?: string
}

export function FileSelectInput(props: FileSelectInputProps) {
  const { className, error } = props
  const { addWorkingFile } = useAudioStore()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const onAddFile = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      if (!e.target.files || e.target.files.length === 0) {
        return
      }

      const newFile = e.target.files.item(0)!

      addWorkingFile({
        filepath: newFile.path
      })

      // if (fileInputRef.current) {
      //   fileInputRef.current.files = new FileList()
      // }
    },
    [fileInputRef, addWorkingFile]
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

export default function FileSelectList(props: FileSelectListProps) {
  const { className } = props
  const { workingFileList, removeWorkingFile } = useAudioStore()

  const onRemoveFile = useCallback((i: number) => {
    removeWorkingFile(i)
  }, [])

  const fileEntries = useMemo(
    () =>
      workingFileList.map((f, i) => (
        <FileEntry onClick={onRemoveFile} index={i} file={f} key={`file-${f.filepath}`} />
      )),
    [workingFileList]
  )

  return (
    <div
      className={`bg-base-200 max-w-80 overflow-x-hidden overflow-y-scroll h-full rounded-lg ${className}`}
    >
      {fileEntries}
    </div>
  )
}

type FileEntryProps = {
  file: FileSelectListItem
  index: number
  onClick: (i: number) => void
}

function FileEntry(props: FileEntryProps) {
  const { file, index, onClick } = props

  const fileName = useMemo(() => {
    const pathSegments = new Array(...file.filepath.split(/[/\\]/))
    return pathSegments.at(-1) ?? ''
  }, [file])

  const onClickRemove = useCallback(() => {
    onClick(index)
  }, [index, onclick])

  return (
    <div className="grid items-center max-w-80 p-4 gap-2 grid-cols-[minmax(0,_1fr)_min-content]">
      <span className="text-ellipsis overflow-hidden text-nowrap">{fileName}</span>
      <button onClick={onClickRemove} className="btn btn-square btn-error">
        X
      </button>
    </div>
  )
}
