import { Group } from '@renderer/components/groups/group'
import { VariantTag } from '@renderer/components/groups/variantTag'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { createFileRoute } from '@tanstack/react-router'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef, useState } from 'react'
import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import SortUp from '@renderer/assets/images/Layout/SortUp.png'
import SortDown from '@renderer/assets/images/Layout/SortDown.png'
import SortLabel from '@renderer/assets/images/Layout/SortingLabel.png'

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
      <FilterTabs />
      <Sortings />
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
              <Group id={item.id} key={item.id} />
            </div>
          )
        })}
      </div>
      <div></div>
    </div>
  )
}

function FilterTabs() {
  return (
    <div
      className={`
      absolute
      -translate-y-full
      flex
      z-20
      gap-2
    `}
    >
      <FilterTag variant="Soundtrack" />
      <FilterTag variant="Rapid" />
      <FilterTag variant="Sequence" />
      <FilterTag variant="Looping" />
    </div>
  )
}

type FilterTagProps = {
  variant: SoundVariants
}

function FilterTag(props: FilterTagProps) {
  const { variant } = props

  const soundTypes = useAudioStore((store) => store.sorting.soundTypes)
  const toggleVariantFilter = useAudioStore((store) => store.toggleVariantFilter)

  const isActive = soundTypes.includes(variant)
  const onClick = () => toggleVariantFilter(variant)

  return (
    <button
      className={`
        ${isActive ? 'translate-y-3' : 'translate-y-0'}
        cursor-pointer
        relative
        before:absolute
        before:w-full
        before:h-full
        before:opacity-0
        before:left-0
        before:top-0
        before:z-30
        before:bg-white
        active:before:bg-blue-500
        before:transition-opacity
        hover:before:opacity-20
    `}
      onClick={onClick}
    >
      <VariantTag variant={variant} />
    </button>
  )
}

function Sortings() {
  return (
    <div
      className={`
      absolute
      right-8
    `}
    >
      <NameSort />
    </div>
  )
}

function NameSort() {
  const sorting = useAudioStore((store) => store.sorting)
  const setSorting = useAudioStore((store) => store.setSorting)

  function getCurrentSortImg() {
    if (sorting.sorting?.type !== 'name') {
      return undefined
    }
    if (sorting.sorting.order === 'asc') {
      return SortUp
    }
    return SortDown
  }

  function toggleSort() {
    if (sorting.sorting === undefined || sorting.sorting.type !== 'name') {
      setSorting({ order: 'asc', type: 'name' })
      return
    }
    if (sorting.sorting.order === 'asc') {
      setSorting({ order: 'desc', type: 'name' })
      return
    }
    setSorting(undefined)
  }

  return (
    <button
      className={`
      -translate-y-full
      cursor-pointer
      relative
      before:absolute
      before:w-full
      before:h-full
      before:opacity-0
      before:left-0
      before:top-0
      before:z-30
      before:bg-white
      active:before:bg-blue-500
      before:transition-opacity
      hover:before:opacity-20
    `}
      onClick={toggleSort}
    >
      <img src={SortLabel} />
      <img className="absolute right-1 top-1" src={getCurrentSortImg()} />
    </button>
  )
}
