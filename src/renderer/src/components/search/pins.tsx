import { CloseIcon } from '@renderer/assets/icons'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { PropsWithChildren, useMemo } from 'react'
import { twMerge } from 'tailwind-merge'
import { useShallow } from 'zustand/react/shallow'

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

function PinnedSearch(props: PinnedSearchProps) {
  const { text } = props

  const setSearchText = useAudioStore((store) => store.setSearchText)
  const activeSearch = useAudioStore(useShallow((store) => store.sorting.search))
  const updatePinnedSearches = useAudioStore((store) => store.updatePinnedSearches)
  const pinnedSearches = useAudioStore((store) => store.pinnedSearches)

  const removePin = () => {
    const pins = pinnedSearches.filter((p) => p !== text)
    updatePinnedSearches([...pins])
  }

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
      <button onClick={removePin} className="btn btn-circle btn-xs">
        <CloseIcon className="max-h-5 stroke-white fill-white" />
      </button>
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
