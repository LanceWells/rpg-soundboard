import { twMerge } from 'tailwind-merge'

/**
 * Icon representing a close / dismiss action (X mark).
 */
export function CloseIcon(props: { className?: string }) {
  const { className } = props

  const mergedClass = twMerge('stroke-current fill-current w-8 h-8', className)

  return (
    <svg className={mergedClass} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <g id="Menu / Close_MD">
        <path strokeWidth={2} id="Vector" d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18" />
      </g>
    </svg>
  )
}
