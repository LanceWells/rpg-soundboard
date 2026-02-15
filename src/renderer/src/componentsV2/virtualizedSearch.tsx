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
    overscan: 20
  })

  return (
    <div
      className={`
        
    `}
    ></div>
  )
}
