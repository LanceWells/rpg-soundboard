import { useAudioStore } from '@renderer/stores/audio/audioStore'

export function SearchBox() {
  const search = useAudioStore((store) => store.searchText)
  const setSearch = useAudioStore((store) => store.setSearchText)
  const updatePinnedSearches = useAudioStore((store) => store.updatePinnedSearches)
  const pinnedSearches = useAudioStore((store) => store.pinnedSearches)

  const addPin = () => {
    if (!search || search.length === 0) {
      return
    }

    const pins = new Set([...pinnedSearches, search]).values()
    updatePinnedSearches([...pins])
  }

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
        value={search}
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
