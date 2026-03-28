import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { useRef } from 'react'
import { CloseIcon } from '@renderer/assets/icons'

/**
 * Props for {@link TagInput}.
 */
export type TagInput = {
  /**
   * Currently applied tags.
   */
  tags: string[]
  /**
   * Called with the updated tag array when tags are added.
   */
  setTags: (newTags: string[]) => void
}

/**
 * Text input with datalist suggestions for adding tags to a sound button.
 */
export function TagInput(props: TagInput) {
  const { setTags, tags } = props

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

    setTags([...tags, sanitizedTag])

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

/**
 * Props for {@link Tag}.
 */
type TagProps = {
  /**
   * The tag label to display.
   */
  text: string
  /**
   * Called with the tag text when the badge is clicked to remove it.
   */
  onRemove: (text: string) => void
}

/**
 * Displays a removable tag badge.
 */
export function Tag(props: TagProps) {
  const { onRemove, text } = props

  return (
    <div
      role="button"
      onClick={() => onRemove(text)}
      className="badge cursor-pointer flex justify-between badge-soft badge-primary"
    >
      <span>{text}</span>
      <CloseIcon className="max-h-5" />
    </div>
  )
}
