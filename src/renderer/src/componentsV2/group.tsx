import { ISoundGroupSource } from 'src/apis/audio/types/items'
import MusicNote from '@renderer/assets/images/MusicScroll.png'

export type GroupBaseProps = {
  // group: ISoundGroupSource
  // onClickEdit: () => void;
  // onClickPlay: () => void;
  src: string
}

export function GroupBase(props: GroupBaseProps) {
  const { src } = props

  return (
    <button
      className={`
      bg-shop-100
      shadow-pixel-md
      shadow-shop-300
      cursor-pointer
      justify-items-center
      overflow-ellipsis
      overflow-clip
      w-[152px]
      w-max-[152px]
      h-[152px]
      h-max-[152px
      relative
      before:absolute
      before:w-full
      before:h-full
      before:opacity-0
      before:left-0
      before:top-0
      before:bg-white
      before:transition-opacity
      hover:before:opacity-20
      active:border-1
    `}
      onClick={() => {}}
    >
      <img src={src} />
      <span
        className={`
        max-w-full
        overflow-hidden
        overflow-ellipsis
        text-nowrap
        absolute
        bottom-0
        left-0
        p-1
        bg-caption-bg
        pointer-events-none
        `}
      >
        Lorem ipsum dolor sit amet. Potato potahtoh
      </span>
    </button>
  )
}
