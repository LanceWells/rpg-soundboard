import { useCallback, useState } from 'react'
import { CirclePicker, ColorResult } from 'react-color'

export type ColorPickerProps = {
  color: string
  onColorChange: (color: ColorResult) => void
  title: string
}

export default function ColorPicker(props: ColorPickerProps) {
  const { color, onColorChange, title } = props

  const [pickerOpen, setPickerOpen] = useState(false)

  const handleClickPicker = useCallback(() => {
    setPickerOpen(!pickerOpen)
  }, [pickerOpen, setPickerOpen])

  const handleSelectColor = useCallback(
    (e: ColorResult) => {
      setPickerOpen(false)
      onColorChange(e)
    },
    [setPickerOpen, onColorChange]
  )

  return (
    <div className="relative flex items-center gap-4 mt-4">
      <span className="text-lg">{title}</span>
      <button
        style={{
          background: color,
          borderWidth: 4
        }}
        className="btn btn-circle btn-outline"
        onClick={handleClickPicker}
      />
      <div
        className={`
          absolute
          bg-base-100
          shadow-md
          p-4
          outline
          rounded-lg
          right-0
          z-10
          ${pickerOpen ? 'visible' : 'hidden'}
        `}
      >
        <CirclePicker
          colors={[
            '#16a085',
            '#27ae60',
            '#2980b9',
            '#8e44ad',
            '#2c3e50',
            '#f39c12',
            '#d35400',
            '#c0392b',
            '#bdc3c7',
            '#7f8c8d'
          ]}
          onChange={handleSelectColor}
        />
      </div>
    </div>
  )
}
