import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Group } from './groups/group'

export function Board() {
  const parentRef = useRef<HTMLDivElement | null>(null)

  const soughtGroups = useAudioStore((store) => store.soughtGroups)

  const lanes =
    parentRef.current === null ? 1 : Math.floor(((parentRef.current.clientWidth ?? 30) - 20) / 150)

  const rowVirtualizer = useVirtualizer({
    count: soughtGroups.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => {
      return 168
    },
    lanes,
    overscan: lanes * 2
  })

  return (
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
          const item = soughtGroups[virtualItem.index]
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
              <Group key={item.id} id={item.id} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
