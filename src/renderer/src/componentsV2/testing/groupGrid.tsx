import { GroupBase } from './group'
import TownHero from '@renderer/assets/images/TownHero.png'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { useMemo, useRef, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useVirtualizer } from '@tanstack/react-virtual'

export function GroupGrid() {
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 500)
  const parentRef = useRef<HTMLDivElement | null>(null)

  const searchForGroups = useAudioStore((store) => store.searchForGroups)

  const searchItems = useMemo(() => {
    parentRef.current?.scrollTo({ top: 0 })
    return searchForGroups(debouncedSearch, ['source', 'sequence'])
  }, [debouncedSearch])

  const lanes =
    parentRef.current === null ? 1 : Math.floor(((parentRef.current.clientWidth ?? 30) - 20) / 150)

  const rowVirtualizer = useVirtualizer({
    count: searchItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => {
      return 168
    },
    lanes,
    overscan: lanes * 2
  })

  return (
    <div
      className={`
      w-full
      h-full
      grid
      grid-cols-[288px_1fr]
    `}
    >
      <div
        className={`
        bg-paper-2
        p-2
        shop-wall
        grid
        [grid-template-areas:"header"_"hero"_"."_"search"]
        grid-rows-[min-content_min-content_1fr_min-content]
      `}
      >
        <h1
          className={`
          text-2xl
          w-full
          text-center
        `}
        >
          RPG Soundboard
        </h1>
        <img src={TownHero} />
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
          <span>Whatchu want?</span>
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
      </div>
      <div
        ref={parentRef}
        className={`
          w-full
          shop-border
          flex
          min-h-full
          max-h-full
          box-border
          overflow-y-scroll
          overflow-x-hidden
        `}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`
          }}
          className={`
            w-full
            attach
            shop-shelf
            bg-local
            min-h-full
            relative
          `}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const item = searchItems[virtualItem.index]
            const width = parentRef.current?.clientWidth ?? 0
            const maxCols = Math.floor((width - 20) / 150)
            const row = Math.floor(virtualItem.index / maxCols)
            const col = virtualItem.index % maxCols

            return (
              <div
                style={{
                  transform: `translate(${col * 150}px, ${row * 168}px)`
                }}
                className={`
                absolute
                top-0
                left-0
              `}
              >
                <GroupBase key={item.id} id={item.id} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
