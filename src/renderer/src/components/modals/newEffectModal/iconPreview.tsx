import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { IconBody } from '@renderer/utils/fetchIcons'
import { useCallback } from 'react'
import { IconEffect } from '../../effect/icon-effect'
import { ColorOptions } from '../../icon/colorPicker'
import { useShallow } from 'zustand/react/shallow'

export type IconPreviewProps = {
  icon: IconBody
}

export function IconPreview(props: IconPreviewProps) {
  const { icon } = props

  const { editingGroup, setSelectedIcon } = useAudioStore(
    useShallow((state) => ({
      editingGroup: state.editingGroup,
      setSelectedIcon: state.setSelectedIcon
    }))
  )

  const handlePickIcon = useCallback(() => {
    setSelectedIcon({
      name: icon.name,
      backgroundColor: editingGroup?.icon.backgroundColor ?? ColorOptions.black,
      foregroundColor: editingGroup?.icon.foregroundColor ?? ColorOptions.white
    })
  }, [icon.name, editingGroup?.icon, setSelectedIcon])

  const readableName = icon.name
    .split('-')
    .map((i) => i[0].toUpperCase() + i.substring(1))
    .join(' ')

  return (
    <button
      className={`
        mb-2
        grid
        items-center
        gap-4
        rounded-md
        p-2
        grid-cols-[min-content_1fr]
        w-full
        btn
        h-fit
        ${editingGroup?.icon.name === icon.name ? 'bg-base-100' : ''}
      `}
      onClick={handlePickIcon}
    >
      <IconEffect
        icon={{
          name: icon.name,
          backgroundColor: editingGroup?.icon.backgroundColor ?? 'grey',
          foregroundColor: editingGroup?.icon.foregroundColor ?? 'grey'
        }}
      />
      <span>{readableName}</span>
    </button>
  )
}
