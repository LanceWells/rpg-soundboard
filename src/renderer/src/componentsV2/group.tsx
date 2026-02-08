import { ISoundGroupSource } from 'src/apis/audio/types/items'
import MusicNote from '@renderer/assets/images/MusicScroll.png'

export type GroupBaseProps = {
  // group: ISoundGroupSource
  // onClickEdit: () => void;
  // onClickPlay: () => void;
}

export function GroupBase(props: GroupBaseProps) {
  return (
    <button
      className={`
      bg-shop-100
      shadow-pixel-md
      shadow-shop-300
      p-4
      cursor-pointer
      grid
      grid-rows-[96px_1fr]
      justify-items-center
      overflow-ellipsis
      overflow-clip
      w-[152px]
      w-max-[152px]
      h-[152px]
      h-max-[152px
      relative
      after:absolute
      after:w-full
      after:h-full
      after:opacity-0
      after:bg-white
      after:transition-opacity
      hover:after:opacity-10
    `}
      onClick={() => {}}
    >
      <img src={MusicNote} />
      <span
        className={`
        max-w-full
        overflow-hidden
        overflow-ellipsis
        text-nowrap
        `}
      >
        Lorem ipsum dolor sit amet. Potato potahtoh
      </span>
    </button>
  )
}
