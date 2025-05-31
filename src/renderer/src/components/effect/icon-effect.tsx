import { soundboardIcons } from '@renderer/utils/fetchIcons'
import { Parser, ProcessNodeDefinitions } from 'html-to-react'
import { SoundIcon } from 'src/apis/audio/types/items'
import { twMerge } from 'tailwind-merge'

/**
 * Props for {@link IconEffect}.
 */
export type IconEffectProps = {
  /**
   * Information about the icon to be rendered.
   */
  icon: SoundIcon | undefined

  /**
   * Optional class name, will be rendered on the root element after other, required classes.
   */
  className?: string

  size?: number
}

/**
 * The base container for rendering a particular icon. This class should be preferred for rendering
 * any sound icon. The justification is that this class will look up the icon's html svg data, and
 * will convert that data to a react node.
 *
 * @param props See {@link IconEffectProps}.
 */
export function IconEffect(props: IconEffectProps) {
  const { icon, className, size } = props

  const iconBody = soundboardIcons.GetIcon(icon?.name ?? 'moon')
  const { processDefaultNode } = ProcessNodeDefinitions()

  const reactNode = Parser().parseWithInstructions(iconBody?.body, () => true, [
    {
      shouldProcessNode: (_node) => {
        return true
      },
      processNode: function (node, children, index) {
        if (size && size > 0) {
          node.attribs.height = size?.toString()
          node.attribs.width = size?.toString()
        }
        return processDefaultNode(node, children, index)
      }
    }
  ])

  const mergedClass = twMerge(`rounded-lg w-24 h-24`, className)

  return (
    <div
      style={{
        backgroundColor: icon?.backgroundColor ?? 'white',
        color: icon?.foregroundColor ?? 'black'
      }}
      className={mergedClass}
    >
      {reactNode}
    </div>
  )
}
