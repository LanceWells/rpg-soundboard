import { FileEntry } from './fileEntry'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { FormInput } from '../types'

export type FileSelectListProps = {
  className?: string
}

export function FileSelectList(props: FileSelectListProps) {
  const { className } = props
  const { update, remove } = useFieldArray<FormInput>({
    name: 'request.effects'
  })

  const { watch } = useFormContext<FormInput>()
  const effects = watch('request.effects')

  const fileEntries = (effects ?? []).map((f, i) => (
    <FileEntry
      name={f.name}
      index={i}
      file={f}
      key={`file-${f.path}`}
      onChangeVolume={(fi, newVolume) =>
        update(fi, { name: f.name, path: f.path, volume: newVolume })
      }
      onClickRemove={(i) => {
        remove(i)
      }}
    />
  ))

  return (
    <div
      className={`
        bg-base-200
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
