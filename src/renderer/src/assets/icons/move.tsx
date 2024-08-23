import { twMerge } from 'tailwind-merge'

export default function MoveIcon(props: { className?: string }) {
  const { className } = props

  const mergedClass = twMerge('fill-current stroke-current w-8 h-8', className)

  return (
    <svg className={mergedClass} viewBox="0 0 24 24">
      <path
        d="M12 3V9M12 3L9 6M12 3L15 6M12 15V21M12 21L15 18M12 21L9 18M3 12H9M3 12L6 15M3 12L6 9M15 12H21M21 12L18 9M21 12L18 15"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
