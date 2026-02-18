import { SoundIcon, SvgSoundIcon } from 'src/apis/audio/types/items'
import BookImage from '@renderer/assets/images/Book.png'
import ScrollImage from '@renderer/assets/images/Scroll.png'
import { memo, useEffect, useRef, useState } from 'react'
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
  if (icon.type === 'svg') {
    return <GroupSvgIcon icon={icon} />
  }

  return null
}

export type GroupSvgIconProps = {
  icon: SvgSoundIcon
}

export function GroupSvgIcon(props: GroupSvgIconProps) {
  const { icon } = props

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (canvasRef.current === null) {
      return
    }

    const ctx = canvasRef.current.getContext('2d')
    if (ctx === null) {
      return
    }

    const imagizerCanvas = new OffscreenCanvas(48, 48)
    const iCtx = imagizerCanvas.getContext('2d')
    if (iCtx === null) {
      return
    }

    iCtx.imageSmoothingEnabled = false
    iCtx.imageSmoothingQuality = 'low'
    ctx.imageSmoothingEnabled = false
    ctx.imageSmoothingQuality = 'low'

    ctx.canvas.style.imageRendering = 'pixelated'

    const iconBody = soundboardIcons.GetIcon(icon.name ?? 'moon')!.body

    const dataurl = svgToData(iconBody)

    const svgImg = new Image()

    svgImg.height = 48
    svgImg.width = 48
    svgImg.style.imageRendering = 'pixelated'

    const onload = () => {
      iCtx.reset()
      iCtx.clearRect(0, 0, iCtx.canvas.width, iCtx.canvas.height)
      iCtx.imageSmoothingEnabled = false

      ctx.reset()
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.imageSmoothingEnabled = false

      iCtx.drawImage(svgImg, 0, 0, 24, 24)
      const imgBitmap = iCtx.canvas.transferToImageBitmap()

      ctx.transform(9, 0, 0, 9, 0, 0)
      ctx.drawImage(imgBitmap, 2, 2, 24, 24)
      imgBitmap.close()

      ctx.globalCompositeOperation = 'source-in'
      ctx.fillStyle = icon.foregroundColor
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      setIsLoading(false)
      svgImg.removeEventListener('load', onload)
    }

    svgImg.addEventListener('load', onload)

    svgImg.src = dataurl
  }, [canvasRef.current, canvasRef.current?.getContext('2d')])

  const [r, g, b] = [
    icon.foregroundColor.substring(1, 3),
    icon.foregroundColor.substring(3, 5),
    icon.foregroundColor.substring(5, 7)
  ]

  const brightness = (Number.parseInt(r, 16) + Number.parseInt(g, 16) + Number.parseInt(b, 16)) / 3
  const bgImg = brightness > 100 ? BookImage : ScrollImage

  return (
    <div
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
    >
      <span
        className={`
          transition-opacity
          ${isLoading ? 'opacity-100' : 'opacity-0'}
      `}
      >
        Loading
      </span>
      <div
        className={`
          transition-opacity
          ${isLoading ? 'opacity-0' : 'opacity-100'}
        `}
      >
        <img
          className={`
          absolute
          top-0
          left-0
          z-40
        `}
          src={bgImg}
          width={144}
          height={144}
        />
        <canvas
          className={`
          absolute
          z-50
          w-full
          h-full
          top-0
          left-0
        `}
          width={144}
          height={144}
          ref={canvasRef}
        />
      </div>
    </div>
  )
}

export const MemoizedGroupIcon = memo(GroupIcon)
