export default function CloseIcon(props: { className?: string }) {
  const { className } = props

  return (
    <svg
      className={`fill-current w-8 h-8 ${className}`}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="Menu / Close_MD">
        <path
          stroke="#000000"
          strokeWidth={2}
          id="Vector"
          d="M18 18L12 12M12 12L6 6M12 12L18 6M12 12L6 18"
        />
      </g>
    </svg>
  )
}
