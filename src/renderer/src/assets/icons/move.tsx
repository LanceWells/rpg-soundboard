export default function MoveIcon(props: { className?: string }) {
  const { className } = props

  return (
    <svg className={`fill-current w-8 h-8 ${className}`} viewBox="0 0 24 24">
      <path
        d="M12 3V9M12 3L9 6M12 3L15 6M12 15V21M12 21L15 18M12 21L9 18M3 12H9M3 12L6 15M3 12L6 9M15 12H21M21 12L18 9M21 12L18 15"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}
