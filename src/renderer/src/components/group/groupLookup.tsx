import VirtualizedSearch from '../search/virtualizedSearch'
import { JSX } from 'react'
import { SelectorElement, SelectorElementProps } from '../modals/sequenceModal/groupSelectorElement'
import { useAudioStore } from '@renderer/stores/audio/audioStore'

export type GroupLookupProps = {
  className?: string
}

export default function GroupLookup(props: GroupLookupProps) {
  const { className } = props

  const searchForGroups = useAudioStore((store) => store.searchForGroups)

  const onSearch = (searchText: string) =>
    searchForGroups(searchText).map(
      (i) =>
        ({
          g: i
        }) as SelectorElementProps & JSX.IntrinsicAttributes
    )
  // soundboardIcons.SearchIcons(searchText).map((i) => ({ icon: i })) as (SelectorElementProps &
  //   JSX.IntrinsicAttributes)[]

  return (
    <VirtualizedSearch
      estimateSize={() => 48}
      className={className}
      onSearch={onSearch}
      RenderItem={SelectorElement}
    />
  )
}
