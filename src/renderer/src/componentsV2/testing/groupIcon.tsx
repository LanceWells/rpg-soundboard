import { SoundIcon } from 'src/apis/audio/types/items'
import BookImage from '@renderer/assets/images/Book.png'
import { useEffect, useRef } from 'react'
import { soundboardIcons } from '@renderer/utils/fetchIcons'
import { svgToData } from '@iconify/utils'

export type GroupImageProps = {
  src: string
}

export function GroupImage(props: GroupImageProps) {
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

export type GroupIconProps = {
  icon: SoundIcon
}

export function GroupIcon(props: GroupIconProps) {
  const { icon } = props

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (canvasRef.current === null) {
      return
    }

    const ctx = canvasRef.current.getContext('2d')
    if (ctx === null) {
      return
    }

    ctx.imageSmoothingEnabled = false
    ctx.scale(3, 3)

    const iconBody = soundboardIcons.GetIcon(icon.name ?? 'moon')!.body

    const dataurl = svgToData(iconBody)

    const encodedSvg = encodeURIComponent(iconBody)
    const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodedSvg}`

    const svgImg = new Image()
    svgImg.crossOrigin = 'anonymous'
    svgImg.onload = () => {
      ctx.drawImage(svgImg, 0, 0)
      // ctx.drawImage(svgImg, 0, 0, ctx.canvas.width, ctx.canvas.height)
    }

    svgImg.src = dataurl
    // svgImg.src = 'https://www.tutorialspoint.com/images/logo.png'
    // svgImg.src = 'http://upload.wikimedia.org/wikipedia/commons/d/d2/Svg_example_square.svg'
    // svgImg.src = svgDataUrl
    // svgImg.src = `data:image/svg+xml;base64,${Buffer.from(iconBody).toString('base64')}`
    // svgImg.src = `data:image/svg+xml;base64,${Buffer.from(iconBody).toString('base64')}`
    // svgImg.src =
    //   'data:image/png;base64,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'
  }, [canvasRef.current, canvasRef.current?.getContext('2d')])

  return (
    <div
      className={`
      absolute
      top-0
      left-0
    `}
    >
      <img
        className={`
          absolute
          top-0
          left-0
          z-40
        `}
        src={BookImage}
      />
      <canvas
        className={`
          absolute
          z-50
          top-0
          left-0
        `}
        width={144}
        height={144}
        ref={canvasRef}
      />
    </div>
  )
}
