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
  const imgRef = useRef<HTMLImageElement | null>(null)

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

      iCtx.drawImage(svgImg, 0, 0, 16, 16)
      const imgBitmap = iCtx.canvas.transferToImageBitmap()

      ctx.transform(9, 0, 0, 9, 0, 0)
      ctx.drawImage(imgBitmap, 3, 3, 32, 32)
      imgBitmap.close()

      svgImg.removeEventListener('load', onload)
    }

    svgImg.addEventListener('load', onload)

    svgImg.src = dataurl
  }, [imgRef.current, canvasRef.current, canvasRef.current?.getContext('2d')])

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
      <img
        className={`
          absolute
          top-0
          left-0
          z-40
        `}
        src={BookImage}
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
  )
}
