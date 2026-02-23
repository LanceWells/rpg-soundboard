import { useFormContext } from 'react-hook-form'
import { FormInput } from '../types'
import CloseIcon from '@renderer/assets/icons/close'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { useRef } from 'react'

export function TagInput() {
  const { watch, setValue } = useFormContext<FormInput>()
  const tags = watch('request.tags')

  const getTags = useAudioStore((store) => store.getTags)
  const tagInputRef = useRef<HTMLInputElement | null>(null)
  const allTags = getTags()

  function addTag(newTag: string) {
    const tagInput = tagInputRef.current
    if (!tagInput) {
      return
    }

    const sanitizedTag = newTag.toLowerCase().trim()
    if (sanitizedTag === '') {
      return
    }

    const tagSet = new Set(tags)
    if (tagSet.has(sanitizedTag)) {
      tagInput.value = ''
      return
    }

    setValue('request.tags', [...tags, sanitizedTag])

    tagInput.value = ''
  }

  return (
    <div className="relative grid grid-cols-[320px_1fr] gap-2">
      <input
        ref={tagInputRef}
        id="tags-input"
        className="input"
        onKeyDown={(e) => {
          if (e.key !== 'Enter') {
            return
          }

          addTag(e.currentTarget.value)
          e.preventDefault()
        }}
        type="text"
        list="tag-suggestions"
      />
      <datalist id="tag-suggestions">
        {[...allTags.values()].map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
    </div>
  )
}

type TagProps = {
  text: string
  onRemove: (text: string) => void
}

export function Tag(props: TagProps) {
  const { onRemove, text } = props

  return (
    <button
      onClick={() => onRemove(text)}
      className="badge cursor-pointer flex justify-between badge-soft badge-primary"
    >
      <span>{text}</span>
      <CloseIcon className="max-h-5" />
    </button>
  )
}
