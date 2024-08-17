import { soundboardIcons } from '@renderer/utils/fetchIcons'
import { Parser } from 'html-to-react'
import { SoundIcon } from 'src/apis/audio/types/items'

/**
 * Props for {@link IconEffect}.
 */
export type IconEffectProps = {
  /**
   * Information about the icon to be rendered.
   */
  icon: SoundIcon

  /**
   * Optional class name, will be rendered on the root element after other, required classes.
   */
  className?: string
}

/**
 * The base container for rendering a particular icon. This class should be preferred for rendering
 * any sound icon. The justification is that this class will look up the icon's html svg data, and
 * will convert that data to a react node.
 *
 * @param props See {@link IconEffectProps}.
 */
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
