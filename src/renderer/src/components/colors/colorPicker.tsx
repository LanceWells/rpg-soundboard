import { useCallback, useState } from 'react'
import { CirclePicker, ColorResult } from 'react-color'

export const ColorOptions = {
  cyan: '#16a085',
  green: '#27ae60',
  blue: '#2980b9',
  purple: '#8e44ad',
  black: '#2c3e50',
  yellow: '#f39c12',
  orange: '#d35400',
  red: '#c0392b',
  white: '#bdc3c7',
  gray: '#7f8c8d'
}

export type ColorOptions = keyof typeof ColorOptions

export const ColorOptionsHexes = Object.values(ColorOptions)

export type ColorPickerProps = {
  color: string
  onColorChange: (color: ColorResult) => void
  title: string
  className?: string
}

export default function ColorPicker(props: ColorPickerProps) {
  const { color, onColorChange, title, className } = props

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
    <div className={`relative flex items-center gap-4 mt-4 ${className}`}>
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
        <CirclePicker colors={ColorOptionsHexes} onChange={handleSelectColor} />
      </div>
    </div>
  )
}
