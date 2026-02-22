import { twMerge } from 'tailwind-merge'

export default function PencilIcon(props: { className?: string }) {
  const { className } = props

  const mergedClass = twMerge('fill-current w-8 h-8', className)

  return (
    <svg className={mergedClass} viewBox="0 0 64 64">
      <path
        d="M62.829,16.484L47.513,1.171c-1.562-1.563-4.094-1.563-5.657,0L0,43.031V64h20.973l41.856-41.855
	C64.392,20.577,64.392,18.05,62.829,16.484z M18,56H8V46l0.172-0.172l10,10L18,56z"
      />
    </svg>
  )
}
