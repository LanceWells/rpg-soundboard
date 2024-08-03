import { soundboardIcons } from '@renderer/utils/fetchIcons'
import { Parser } from 'html-to-react'
import { SoundIcon } from 'src/apis/audio/interface'

export type IconEffectProps = {
  icon: SoundIcon
  className?: string
}

export function IconEffect(props: IconEffectProps) {
  const { icon, className } = props

  const iconBody = soundboardIcons.GetIcon(icon.name)
  const reactNode = Parser().parse(iconBody?.body ?? '')

  return (
    <div
      style={{
        backgroundColor: icon.backgroundColor,
        color: icon.foregroundColor
      }}
      className={`rounded-lg w-24 h-24 ${className}`}
    >
      {reactNode}
    </div>
  )
}
