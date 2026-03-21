import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'

export function SearchBox() {
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 500)

  const searchForGroups = useAudioStore((store) => store.searchForGroups)
  const updatePinnedSearches = useAudioStore((store) => store.updatePinnedSearches)
  const pinnedSearches = useAudioStore((store) => store.pinnedSearches)

  const addPin = () => {
    if (!debouncedSearch || debouncedSearch.length === 0) {
      return
    }

    const pins = new Set([...pinnedSearches, debouncedSearch]).values()
    updatePinnedSearches([...pins])
  }

  useEffect(() => {
    searchForGroups(debouncedSearch, ['source', 'sequence'])
  }, [debouncedSearch])

  return (
    <div
      className={`
        w-full
        shadow-pixel-md
        grid
        grid-rows-2
        bg-shop-200
        p-2
        [grid-area:search]
      `}
    >
      <div className="flex justify-between">
        <span>Whatchu want?</span>
        <button onClick={addPin} className="btn btn-circle btn-xs">
          📌
        </button>
      </div>
      <input
        onChange={(e) => {
          setSearch(e.target.value)
        }}
        placeholder="Search"
        type="text"
        className={`
          bg-black
          p-1
          border-4
          border-shop-100
        `}
      />
    </div>
  )
}
