import { IconBody } from '@renderer/utils/fetchIcons'
import { Parser } from 'html-to-react'

export type IconPreviewProps = {
  icon: IconBody
}

export function IconPreview(props: IconPreviewProps) {
  const { icon } = props

  const reactNode = Parser().parse(icon.body)

  const readableName = icon.name
    .split('-')
    .map((i) => i[0].toUpperCase() + i.substring(1))
    .join(' ')

  return (
    <div className="h-16 mt-2 mb-2 grid items-center gap-4 [grid-template-columns:_min-content_1fr_min-content]">
      {reactNode}
      <span>{readableName}</span>
    </div>
  )
}
