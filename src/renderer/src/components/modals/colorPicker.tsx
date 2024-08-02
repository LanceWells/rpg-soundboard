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
        <CirclePicker onChange={handleSelectColor} />
      </div>
    </div>
  )
}
