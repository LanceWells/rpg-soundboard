import { useRef, ChangeEventHandler } from 'react'
import { useFieldArray } from 'react-hook-form'
import { FormInput } from '../types'
import { twMerge } from 'tailwind-merge'
import { SoundEffectEditableFields } from 'src/apis/audio/types/items'

export type FileSelectInputProps = {
  className?: string
  error?: string
}

export function FileSelectInput(props: FileSelectInputProps) {
  const { error, className } = props

  const fileInputRef = useRef<HTMLInputElement>(null)
  const effects = useFieldArray<FormInput>({
    name: 'request.effects'
  })

  const onAddFile: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const newFile = e.target.files.item(0)!
    const { webUtils } = require('electron')
    const newPath = webUtils.getPathForFile(newFile)

    effects.append({
      path: newPath,
      volume: 100,
      name: newFile.name
    } as SoundEffectEditableFields)
  }

  return (
    <input
      ref={fileInputRef}
      type="file"
      onChange={onAddFile}
      accept="audio/*"
      className={twMerge(
        `
        file-input
        file-input-bordered
        ${error ? 'file-input-error' : ''}
      `,
        className
      )}
    />
  )
}
