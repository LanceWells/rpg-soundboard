import { CSSProperties } from 'react'
import { GroupIcon } from './base'
import { SoundIcon } from 'src/apis/audio/types/items'

export type IconPreviewProps = {
  icon: SoundIcon
  onClick: (iconName: string) => void
  style: CSSProperties
}

export function IconPreview(props: IconPreviewProps) {
  const { icon, onClick, style } = props

  const readableName = icon.name
    .split('-')
    .map((i) => i[0].toUpperCase() + i.substring(1))
    .join(' ')

  return (
    <div
      style={style}
      className={`
        h-[114px]
        mb-2
        grid
        items-center
        gap-4
        rounded-md
        p-2
        grid-cols-[min-content_1fr]
        w-full
        btn
        absolute
      `}
      onClick={() => onClick(icon.name)}
    >
      <GroupIcon icon={icon} />
      <span>{readableName}</span>
    </div>
  )
}
