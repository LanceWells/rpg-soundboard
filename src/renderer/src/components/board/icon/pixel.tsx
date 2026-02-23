export type PixelIconProps = {
  src: string
}

export function PixelIcon(props: PixelIconProps) {
  const { src } = props

  return (
    <img
      className={`
          absolute
          top-2
          w-[120px]
          w-max-[120px]
          h-[120px]
          h-max-[120px]
          z-10
          left-1/2
          transform-[translate(-50%,_0)]
      `}
      src={src}
    />
  )
}
