import { Group } from '@renderer/components/groups/group'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { createFileRoute } from '@tanstack/react-router'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef, useState } from 'react'

export const Route = createFileRoute('/')({
  component: RouteComponent
})

function RouteComponent() {
  const parentRef = useRef<HTMLDivElement | null>(null)

  const soughtGroups = useAudioStore((store) => store.soughtGroups)
  const [lanes, setLanes] = useState<number>(1)

  useEffect(() => {
    if (parentRef.current === null) {
      return
    }

    const resizeOberver = new ResizeObserver(() => {
      const cWidth = parentRef.current?.clientWidth ?? 30
      const calcLanes = Math.max(Math.floor((cWidth - 20) / 150), 1)

      setLanes(calcLanes)
    })

    resizeOberver.observe(parentRef.current)
    return () => resizeOberver.disconnect()
  }, [parentRef.current])

  const rowVirtualizer = useVirtualizer({
    count: soughtGroups.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => {
      return 168
    },
    lanes,
    overscan: lanes ? lanes * 2 : 0,
    enabled: true
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

          return (
            <div
              style={{
                transform: `translate(${virtualItem.lane * 150}px, ${virtualItem.start}px)`
              }}
              className={`
                absolute
                top-0
                left-0
              `}
              key={item.id}
            >
              <Group id={item.id} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
