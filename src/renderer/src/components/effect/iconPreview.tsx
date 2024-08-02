import { useAudioStore } from '@renderer/stores/audioStore'
import { IconBody } from '@renderer/utils/fetchIcons'
import { Parser } from 'html-to-react'
import { useCallback } from 'react'

export type IconPreviewProps = {
  icon: IconBody
}

export function IconPreview(props: IconPreviewProps) {
  const { icon } = props

  const { selectedIcon, setSelectedIcon } = useAudioStore((state) => ({
    selectedIcon: state.selectedIcon,
    setSelectedIcon: state.setSelectedIcon
  }))

  const handlePickIcon = useCallback(() => {
    setSelectedIcon(icon.name)
  }, [icon.name, setSelectedIcon])

  const reactNode = Parser().parse(icon.body)

  const readableName = icon.name
    .split('-')
    .map((i) => i[0].toUpperCase() + i.substring(1))
    .join(' ')

  return (
    <div
      className={`
        h-18
        mt-2
        mb-2
        grid
        items-center
        gap-4
        rounded-md
        p-2
        [grid-template-columns:_min-content_1fr_min-content]
        ${selectedIcon === icon.name ? 'bg-base-100' : ''}
      `}
    >
      {reactNode}
      <span>{readableName}</span>
      <button onClick={handlePickIcon} className="btn btn-circle">
        O
      </button>
    </div>
  )
}
