import { JSX } from 'react'
import VirtualizedSearch from './virtualizedSearch'
import { IconPreview, IconPreviewProps } from './iconPreview'

/**
 * Props for {@link IconLookup}. Controls the foreground color applied to search results and the selection callback.
 */
export type IconLookupProps = {
  className?: string
  fgColor: string
  onClick: (name: string) => void
}

/**
 * Searchable, virtualized icon picker that queries available icons and renders them as selectable previews.
 */
export function IconLookup(props: IconLookupProps) {
  const { className, fgColor, onClick } = props

  const onSearch = (searchText: string) =>
    window.audio.Icons.Search({ search: searchText }).icons.map((i) => ({
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
