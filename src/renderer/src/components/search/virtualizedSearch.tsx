import { ComponentType, CSSProperties, JSX, useMemo, useRef, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useVirtualizer } from '@tanstack/react-virtual'
import { twMerge } from 'tailwind-merge'

export type VirtualizedSearchProps<T extends JSX.IntrinsicAttributes & { style: CSSProperties }> = {
  className?: string
  onSearch: (searchText: string) => T[]
  RenderItem: ComponentType<T>
  estimateSize: (index: number) => number
}

export default function VirtualizedSearch<
  T extends JSX.IntrinsicAttributes & { style: CSSProperties }
>(props: VirtualizedSearchProps<T>) {
  const { className, onSearch, RenderItem, estimateSize } = props

  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 500)
  const parentRef = useRef<HTMLDivElement | null>(null)

  const searchItems = useMemo(() => {
    parentRef.current?.scrollTo({ top: 0 })
    return onSearch(debouncedSearch)
  }, [debouncedSearch])

  const rowVirtualizer = useVirtualizer({
    count: searchItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 20,
    gap: 10
  })

  return (
    <div
      className={twMerge(
        className,
        `
      min-w-96
      h-[340px]
      max-h-[340px]
      grid
      grid-rows-[min-content_1fr]
    `
      )}
    >
      <input
        onChange={(e) => {
          setSearch(e.target.value)
        }}
        placeholder="Search"
        className="input bg-slate-300 dark:bg-black w-full rounded-b-none z-10"
        value={search}
      />
      <div
        ref={parentRef}
        className="overflow-y-scroll bg-base-300 p-6 rounded-md relative rounded-t-none"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative'
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => (
            <RenderItem
              {...searchItems[virtualItem.index]}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`
              }}
              key={virtualItem.key}
            />
          ))}
        </div>
        <i
          className={`
            ${debouncedSearch.length > 0 && searchItems.length === 0 ? 'visible' : 'hidden'}
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
