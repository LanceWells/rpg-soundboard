import { CloseIcon } from '@renderer/assets/icons'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { useShallow } from 'zustand/react/shallow'

/**
 * Renders the list of pinned search terms as clickable, removable tags.
 */
export function SearchPins() {
  const pinnedSearches = useAudioStore((store) => store.pinnedSearches)

  const pinnedSearchTags = useMemo(() => {
    return pinnedSearches.map((p) => <PinnedSearch key={p} text={p} />)
  }, [pinnedSearches])

  return (
    <div
      className={`
        my-3 flex flex-wrap gap-3
      `}
    >
      {pinnedSearchTags}
    </div>
  )
}

type PinnedSearchProps = {
  text: string
}

type RemoveOpts = 'Idle' | 'Confirming'
type RemoveState = {
  opt: RemoveOpts
  timeout: number | undefined
}

function PinnedSearch(props: PinnedSearchProps) {
  const { text } = props

  const setSearchText = useAudioStore((store) => store.setSearchText)
  const activeSearch = useAudioStore(useShallow((store) => store.sorting.search))
  const updatePinnedSearches = useAudioStore((store) => store.updatePinnedSearches)
  const pinnedSearches = useAudioStore((store) => store.pinnedSearches)

  const [removeState, setRemoveState] = useState<RemoveState>({
    opt: 'Idle',
    timeout: undefined
  })

  const onClickRemove = () => {
    clearTimeout(removeState.timeout)
    switch (removeState.opt) {
      case 'Idle': {
        setRemoveState({
          opt: 'Confirming',
          timeout: window.setTimeout(() => {
            setRemoveState({ opt: 'Idle', timeout: undefined })
          }, 2500)
        })
        break
      }
      case 'Confirming': {
        const pins = pinnedSearches.filter((p) => p !== text)
        updatePinnedSearches([...pins])
        break
      }
    }
  }

  useEffect(() => {
    return () => {
      clearTimeout(removeState.timeout)
    }
  })

  const confirmingRemove = removeState.opt === 'Confirming'

  return (
    <Pin className={activeSearch === text ? 'bg-green-900' : 'bg-base-100'}>
      <span
        className={`
          cursor-pointer
        `}
        role="button"
        onClick={() => setSearchText(text, true)}
      >
        {text}
      </span>
      <div
        className={`
          ${confirmingRemove ? 'tooltip tooltip-open' : ''}
        `}
      >
        {confirmingRemove && (
          <div className="tooltip-content w-24 wrap-break-word z-50">Click again to remove</div>
        )}
        <button
          onClick={onClickRemove}
          className={`
          btn
          btn-circle
          btn-xs
          transition-colors
          ${confirmingRemove ? 'btn-error' : ''}
        `}
        >
          <CloseIcon className="max-h-5 stroke-white fill-white" />
        </button>
      </div>
    </Pin>
  )
}

type PinProps = {
  className: string
}

function Pin(props: PropsWithChildren<PinProps>) {
  const { className, children } = props

  const mergedClassname = twMerge(
    `
    flex
    justify-between
    w-min
    items-center
    p-2
    gap-2
    shadow-pixel-md
    `,
    className
  )

  return <div className={mergedClassname}>{children}</div>
}
