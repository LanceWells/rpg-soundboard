import { soundboardIcons } from '@renderer/utils/fetchIcons'
import { IconPreview, IconPreviewProps } from '../modals/newEffectModal/iconPreview'
import VirtualizedSearch from '../search/virtualizedSearch'
import { JSX } from 'react'

export type IconLookupProps = {
  className?: string
  bgColor: string
  fgColor: string
  onClick: (name: string) => void
}

export default function IconLookup(props: IconLookupProps) {
  const { className, bgColor, fgColor, onClick } = props

  const onSearch = (searchText: string) =>
    soundboardIcons
      .SearchIcons(searchText)
      .map((i) => ({ icon: i, bgColor, fgColor, onClick })) as (IconPreviewProps &
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
