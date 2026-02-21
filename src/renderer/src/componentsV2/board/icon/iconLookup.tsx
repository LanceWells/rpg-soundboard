import { soundboardIcons } from '@renderer/utils/fetchIcons'
import { JSX } from 'react'
import VirtualizedSearch from './virtualizedSearch'
import { IconPreview, IconPreviewProps } from './iconPreview'

export type IconLookupProps = {
  className?: string
  fgColor: string
  onClick: (name: string) => void
}

export function IconLookup(props: IconLookupProps) {
  const { className, fgColor, onClick } = props

  const onSearch = (searchText: string) =>
    soundboardIcons.SearchIcons(searchText).map((i) => ({
      icon: {
        foregroundColor: fgColor,
        name: i.name,
        type: 'svg'
      },
      onClick,
      key: i.name
    })) as (IconPreviewProps & JSX.IntrinsicAttributes)[]

  return (
    <VirtualizedSearch
      estimateSize={() => 114}
      className={className}
      onSearch={onSearch}
      RenderItem={IconPreview}
    />
  )
}
