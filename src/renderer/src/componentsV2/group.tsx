import { ISoundGroupSource } from 'src/apis/audio/types/items'
import MusicNote from '@renderer/assets/images/MusicScroll.png'
import WoodenShelf from '@renderer/assets/images/WoodShelf.png'

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
      cursor-pointer
      justify-items-center
      overflow-ellipsis
      overflow-clip
      w-[160px]
      w-max-[160px]
      h-[160px]
      h-max-[160px]
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
      active:border-4
    `}
      onClick={() => {}}
    >
      <img
        className={`
          absolute
          top-0
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
      <img
        className={`
          absolute
          top-25
          z-0
          left-1/2
          transform-[translate(-50%,_0)]
        `}
        src={WoodenShelf}
      />
      <span
        className={`
        max-w-full
        overflow-hidden
        overflow-ellipsis
        text-nowrap
        absolute
        top-30
        w-[140px]
        z-20
        left-1/2
        transform-[translate(-50%,_0)]
        p-1
        pointer-events-none
        text-black
        `}
      >
        Lorem ipsum dolor sit amet. Potato potahtoh
      </span>
    </button>
  )
}
