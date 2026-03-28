import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'
import { GenButtonLoading, GenButtonLoaded } from './genButton'
import { BulkButton } from './types'

/**
 * Props for the BulkButtonList component.
 */
export type BulkButtonListProps = {
  buttons: BulkButton[]
}

/**
 * Virtualized list that renders a collection of bulk upload buttons.
 */
export function BulkButtonList(props: BulkButtonListProps) {
  const { buttons } = props

  const parentRef = useRef<HTMLDivElement | null>(null)

  const rowVirtualizer = useVirtualizer({
    count: buttons.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 2,
    enabled: true
  })

  return (
    <div
      ref={parentRef}
      className={`
      w-full
      flex
    `}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`
        }}
        className={`
          w-full
          min-h-full
          relative
          flex
      `}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const item = buttons[virtualItem.index]

          return (
            <div
              key={virtualItem.key}
              style={{
                transform: `translateY(${virtualItem.start}px)`
              }}
              className={`
                absolute
              `}
            >
              {item.state === 'loading' && <GenButtonLoading />}
              {item.state === 'loaded' && <GenButtonLoaded button={item.button} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
