import { IconBody } from '@renderer/utils/fetchIcons'
import { CSSProperties } from 'react'
import { IconEffect } from '../../effect/icon-effect'

export type IconPreviewProps = {
  icon: IconBody
  bgColor: string
  fgColor: string
  style: CSSProperties
  onClick: (iconName: string) => void
}

export function IconPreview(props: IconPreviewProps) {
  const { icon, style, onClick, fgColor } = props

  // const { editingGroup, setSelectedIcon } = useAudioStore(
  //   useShallow((state) => ({
  //     editingGroup: state.editingGroup,
  //     setSelectedIcon: state.setSelectedIcon
  //   }))
  // )

  // const handlePickIcon = () => {
  //   onClick({
  //     name: icon.name,
  //     backgroundColor: editingGroup?.icon.backgroundColor ?? ColorOptions.black,
  //     foregroundColor: editingGroup?.icon.foregroundColor ?? ColorOptions.white
  //   })

  const readableName = icon.name
    .split('-')
    .map((i) => i[0].toUpperCase() + i.substring(1))
    .join(' ')

  return (
    <button
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
      <IconEffect
        icon={{
          type: 'svg',
          name: icon.name,
          foregroundColor: fgColor
        }}
      />
      <span>{readableName}</span>
    </button>
  )
}
// ${editingGroup?.icon.name === icon.name ? 'bg-base-100' : ''}
