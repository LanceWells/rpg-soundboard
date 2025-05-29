import { useCallback, useRef, useState } from 'react'

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
  pickerID: string
  color: string
  onColorChange: (hex: string) => void
  title: string
  className?: string
}

export default function ColorPicker(props: ColorPickerProps) {
  const { pickerID, color, onColorChange, title, className } = props

  const [pickerOpen, setPickerOpen] = useState(false)

  const handleClickPicker = useCallback(() => {
    setPickerOpen(!pickerOpen)
  }, [pickerOpen, setPickerOpen])

  const popoverTarget = `popover-${pickerID}`
  const anchorTarget = `--anchor-${pickerID}`

  const popoverRef = useRef<HTMLDivElement | null>(null)

  return (
    <div className={`relative flex items-center gap-4 mt-4 ${className}`}>
      <span className="text-lg">{title}</span>
      <button
        popoverTarget={popoverTarget}
        style={
          {
            background: color,
            borderWidth: 4,
            anchorName: anchorTarget
          } as React.CSSProperties
        }
        className="btn btn-circle btn-outline"
        onClick={handleClickPicker}
      />
      <div
        popover="auto"
        id={popoverTarget}
        ref={popoverRef}
        style={{ positionAnchor: anchorTarget } as React.CSSProperties}
        className="card dropdown grid grid-cols-3 gap-2 rounded-box bg-base-200 shadow-sm p-2"
      >
        {ColorOptionsHexes.map((hex) => (
          <button
            key={hex}
            onClick={() => {
              popoverRef.current?.hidePopover()
              onColorChange(hex)
            }}
            className="btn-circle w-8 h-8 btn-outline hover:brightness-150 transition-all cursor-pointer"
            style={{ background: hex }}
          />
        ))}
      </div>
    </div>
  )
}
