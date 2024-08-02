import { soundboardIcons } from '@renderer/utils/fetchIcons'
import { useMemo, useRef, useState } from 'react'
import { IconPreview } from './iconPreview'
import { useDebounce } from 'use-debounce'
import { useVirtualizer } from '@tanstack/react-virtual'

export default function IconLookup() {
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 500)

  const icons = useMemo(() => {
    return soundboardIcons.SearchIcons(debouncedSearch)
  }, [debouncedSearch])

  const parentRef = useRef(null)

  // The virtualizer
  const rowVirtualizer = useVirtualizer({
    count: icons.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80
  })

  return (
    <div className="min-w-96 max-w-96 flex flex-col pt-6">
      <input
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search"
        className="input bg-black rounded-b-none z-10"
        value={search}
      />
      <div className="min-h-72 max-h-72 overflow-y-scroll bg-base-300 max-w-96 p-6 rounded-md rounded-t-none">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`
          }}
          ref={parentRef}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => (
            <IconPreview icon={icons[virtualItem.index]} key={virtualItem.key} />
          ))}
        </div>
      </div>
    </div>
  )
}
