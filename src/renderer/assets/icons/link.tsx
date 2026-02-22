import { twMerge } from 'tailwind-merge'

export default function LinkIcon(props: { className?: string }) {
  const { className } = props

  const mergedClass = twMerge('stroke-current w-8 h-8', className)

  return (
    <svg className={mergedClass} viewBox="0 0 24 24" fill="none">
      <path
        d="M14 7H16C18.7614 7 21 9.23858 21 12C21 14.7614 18.7614 17 16 17H14M10 7H8C5.23858 7 3 9.23858 3 12C3 14.7614 5.23858 17 8 17H10M8 12H16"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
