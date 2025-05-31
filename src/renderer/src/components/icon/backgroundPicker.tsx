import { useCallback } from 'react'
import ColorPicker, { ColorPickerProps } from './colorPicker'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { useShallow } from 'zustand/shallow'

export default function BackgroundPicker(props: Partial<ColorPickerProps> & { pickerID: string }) {
  const { pickerID, ...otherProps } = props

  const { editingGroup, setSelectedIcon } = useAudioStore(
    useShallow((state) => ({
      editingGroup: state.editingGroup,
      setSelectedIcon: state.setSelectedIcon
    }))
  )

  const handleBackgroundSelect = useCallback(
    (hex: string) => {
      if (editingGroup !== null) {
        setSelectedIcon({
          backgroundColor: hex,
          foregroundColor: editingGroup.icon.foregroundColor,
          name: editingGroup.icon.name
        })
      }
    },
    [editingGroup?.icon, setSelectedIcon]
  )

  return (
    <ColorPicker
      pickerID={pickerID}
      color={editingGroup?.icon.backgroundColor ?? 'gray'}
      onColorChange={handleBackgroundSelect}
      className="[grid-area:background]"
      {...otherProps}
    />
  )
}
