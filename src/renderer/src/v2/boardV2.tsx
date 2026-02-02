import Group, { GroupProps } from '@renderer/components/group/group'
import { SelectorElementProps } from '@renderer/components/modals/sequenceModal/groupSelectorElement'
import VirtualizedSearch from '@renderer/components/search/virtualizedSearch'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { CSSProperties, JSX, useMemo } from 'react'
import { BoardID } from 'src/apis/audio/types/boards'

export function BoardV2() {
  // const boards = useAudioStore((state) => state.boards)

  // const groupElements = useMemo(() => {
  //   return boards.flatMap((b) => b.groups.map((g) => <Group boardID={b.id} group={g} key={g.id} />))
  // }, [boards])

  // return (
  //   <div
  //     className={`
  //       h-full
  //       max-h-full
  //       w-full
  //       max-w-full
  //       grid
  //       align-middle
  //   `}
  //   >
  //     <label
  //       className={`
  //         input
  //         m-4
  //       `}
  //     >
  //       <input
  //         type="search"
  //         placeholder="Search"
  //         className={`
  //           grow
  //       `}
  //       />
  //     </label>
  //     <div
  //       className={`
  //         relative
  //         flex
  //         flex-wrap
  //         gap-6
  //         justify-center
  //     `}
  //     >
  //       {...groupElements}
  //     </div>
  //   </div>
  // )

  const searchForGroups = useAudioStore((store) => store.searchForGroups)

  const onSearch = (searchText: string) =>
    searchForGroups(searchText, ['source', 'reference', 'sequence']).map(
      (i) =>
        ({
          boardID: 'brd-search-board' as BoardID,
          group: i,
          style: {
            margin: '16px'
          }
        }) as GroupProps & JSX.IntrinsicAttributes
    )

  return (
    <VirtualizedSearch
      className={`h-full flex-wrap`}
      onSearch={onSearch}
      RenderItem={GroupWithSpace}
      estimateSize={() => 96}
    />
  )
}

function GroupWithSpace(props: GroupProps) {
  return (
    <div
      className={`
      m-2
      relative
      indicator
    `}
    >
      <Group {...props} />
    </div>
  )
}
