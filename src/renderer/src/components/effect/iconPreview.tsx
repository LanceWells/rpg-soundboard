import { useAudioStore } from '@renderer/stores/audioStore'
import { IconBody } from '@renderer/utils/fetchIcons'
import { useCallback } from 'react'
import { IconEffect } from './icon-effect'
import { ColorOptions } from '../colors/colorPicker'

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
    setSelectedIcon({
      name: icon.name,
      backgroundColor: selectedIcon?.backgroundColor ?? ColorOptions.black,
      foregroundColor: selectedIcon?.foregroundColor ?? ColorOptions.white
    })
  }, [icon.name, selectedIcon, setSelectedIcon])

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
        ${selectedIcon?.name === icon.name ? 'bg-base-100' : ''}
      `}
      onClick={handlePickIcon}
    >
      <IconEffect
        icon={{
          name: icon.name,
          backgroundColor: selectedIcon.backgroundColor,
          foregroundColor: selectedIcon.foregroundColor
        }}
      />
      <span>{readableName}</span>
      {/* <button onClick={handlePickIcon} className="btn btn-circle">
        O
      </button> */}
    </button>
  )
}
