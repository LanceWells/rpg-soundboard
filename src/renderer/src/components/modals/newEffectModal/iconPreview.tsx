import { useAudioStore } from '@renderer/stores/audioStore'
import { IconBody } from '@renderer/utils/fetchIcons'
import { useCallback } from 'react'
import { IconEffect } from '../../effect/icon-effect'
import { ColorOptions } from './colorPicker'

export type IconPreviewProps = {
  icon: IconBody
}

export function IconPreview(props: IconPreviewProps) {
  const { icon } = props

  const { editingGroup, setSelectedIcon } = useAudioStore()

  const handlePickIcon = useCallback(() => {
    setSelectedIcon({
      name: icon.name,
      backgroundColor: editingGroup.icon.backgroundColor ?? ColorOptions.black,
      foregroundColor: editingGroup.icon.foregroundColor ?? ColorOptions.white
    })
  }, [icon.name, editingGroup.icon, setSelectedIcon])

  const readableName = icon.name
    .split('-')
    .map((i) => i[0].toUpperCase() + i.substring(1))
    .join(' ')

  return (
    <button
      className={`
        h-18
        mb-2
        grid
        items-center
        gap-4
        rounded-md
        p-2
        [grid-template-columns:_min-content_1fr]
        w-full
        btn
        h-fit
        ${editingGroup.icon.name === icon.name ? 'bg-base-100' : ''}
      `}
      onClick={handlePickIcon}
    >
      <IconEffect
        icon={{
          name: icon.name,
          backgroundColor: editingGroup.icon.backgroundColor,
          foregroundColor: editingGroup.icon.foregroundColor
        }}
      />
      <span>{readableName}</span>
    </button>
  )
}
