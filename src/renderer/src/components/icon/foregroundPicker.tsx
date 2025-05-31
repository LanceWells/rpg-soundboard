import { useCallback } from 'react'
import ColorPicker, { ColorPickerProps } from './colorPicker'
import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { useShallow } from 'zustand/shallow'

export default function ForegroundPicker(props: Partial<ColorPickerProps> & { pickerID: string }) {
  const { pickerID, ...otherProps } = props

  const { editingGroup, setSelectedIcon } = useAudioStore(
    useShallow((state) => ({
      editingGroup: state.editingGroup,
      setSelectedIcon: state.setSelectedIcon
    }))
  )

  const handleForegroundSelect = useCallback(
    (hex: string) => {
      if (editingGroup !== null) {
        setSelectedIcon({
          backgroundColor: editingGroup.icon.backgroundColor,
          foregroundColor: hex,
          name: editingGroup.icon.name
        })
      }
    },
    [editingGroup, setSelectedIcon]
  )

  return (
    <ColorPicker
      pickerID={pickerID}
      color={editingGroup?.icon.foregroundColor ?? 'gray'}
      onColorChange={handleForegroundSelect}
      className="[grid-area:foreground]"
      {...otherProps}
    />
  )
}
