import { ComponentType, JSX, useMemo, useRef, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useVirtualizer } from '@tanstack/react-virtual'

export type VirtualizedSearchProps<T extends JSX.IntrinsicAttributes> = {
  className?: string
  onSearch: (searchText: string) => T[]
  RenderItem: ComponentType<T>
  estimateSize: (index: number) => number
}

export default function IconLookup<T extends JSX.IntrinsicAttributes>(
  props: VirtualizedSearchProps<T>
) {
  const { className, onSearch, RenderItem, estimateSize } = props

  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 500)

  const icons = useMemo(() => {
    return onSearch(debouncedSearch)
  }, [debouncedSearch])

  const parentRef = useRef(null)

  const rowVirtualizer = useVirtualizer({
    count: icons.length,
    getScrollElement: () => parentRef.current,
    estimateSize
  })

  return (
    <div className={`min-w-96 flex flex-col ${className}`}>
      <input
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search"
        className="input bg-slate-300 dark:bg-black w-full rounded-b-none z-10"
        value={search}
      />
      <div className="min-h-72 max-h-72 overflow-y-scroll bg-base-300 p-6 rounded-md relative rounded-t-none">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`
          }}
          ref={parentRef}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => (
            <RenderItem {...icons[virtualItem.index]} key={virtualItem.key} />
          ))}
        </div>
        <i
          className={`
            ${debouncedSearch.length > 0 && icons.length === 0 ? 'visible' : 'hidden'}
            absolute
            top-1/2
            left-1/2
            -translate-1/2
          `}
        >
          No results
        </i>
      </div>
    </div>
  )
}
