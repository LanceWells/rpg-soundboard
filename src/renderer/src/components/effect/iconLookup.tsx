import { soundboardIcons } from '@renderer/utils/fetchIcons'
import { IconPreview, IconPreviewProps } from '../modals/newEffectModal/iconPreview'
import VirtualizedSearch from '../search/virtualizedSearch'
import { JSX } from 'react'

export type IconLookupProps = {
  className?: string
}

export default function IconLookup(props: IconLookupProps) {
  const { className } = props

  const onSearch = (searchText: string) =>
    soundboardIcons.SearchIcons(searchText).map((i) => ({ icon: i })) as (IconPreviewProps &
      JSX.IntrinsicAttributes)[]

  return (
    <VirtualizedSearch
      estimateSize={() => 114}
      className={className}
      onSearch={onSearch}
      RenderItem={IconPreview}
    />
  )
}
