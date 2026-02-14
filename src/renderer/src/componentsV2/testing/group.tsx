import WoodenShelf from '@renderer/assets/images/WoodShelf.png'
import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import LoopingTag from '@renderer/assets/images/Tags/Looping.png'
import RapidTag from '@renderer/assets/images/Tags/Rapid.png'
import SoundtrackTag from '@renderer/assets/images/Tags/Soundtrack.png'
import SequenceTag from '@renderer/assets/images/Tags/Sequence.png'
import { SoundIcon } from 'src/apis/audio/types/items'
import { GroupIcon } from './groupIcon'

export type GroupBaseProps = {
  // group: ISoundGroupSource
  // onClickEdit: () => void;
  // onClickPlay: () => void;
  src: string
  variant: SoundVariants
  title: string
  icon?: SoundIcon
}

export function GroupBase(props: GroupBaseProps) {
  const { src, variant, title } = props

  return (
    <button
      className={`
      cursor-pointer
      justify-items-center
      overflow-ellipsis
      overflow-clip
      w-[150px]
      w-max-[150px]
      h-[168px]
      h-max-[168px]
      relative
      before:absolute
      before:w-full
      before:h-full
      before:opacity-0
      before:left-0
      before:top-0
      before:z-30
      before:bg-white
      active:before:bg-blue-500
      before:transition-opacity
      hover:before:opacity-20
      rounded-md
    `}
      onClick={() => {}}
    >
      {/* <img
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
      /> */}
      <GroupIcon icon={{ name: 'warehouse', backgroundColor: 'black', foregroundColor: 'brown' }} />
      <img
        className={`
          absolute
          top-0
          left-1/2
          transform-[translate(-50%,_0)]
        `}
        src={WoodenShelf}
      />
      <span
        className={`
        max-w-3/4
        overflow-hidden
        overflow-ellipsis
        text-nowrap
        absolute
        top-32
        w-[140px]
        z-20
        left-3
        p-1
        pointer-events-none
        text-black
        `}
      >
        {title}
      </span>
      <VariantTag
        variant={variant}
        className={`
          absolute
          bottom-0
          right-0
          z-20
        `}
      />
    </button>
  )
}

export type VariantTagProps = {
  variant: SoundVariants
  className: string
}

function VariantTag(props: VariantTagProps) {
  const { variant, className } = props
  switch (variant) {
    case 'Looping':
      return <img className={className} src={LoopingTag} />
    case 'Rapid':
      return <img className={className} src={RapidTag} />
    case 'Sequence':
      return <img className={className} src={SequenceTag} />
    case 'Soundtrack':
      return <img className={className} src={SoundtrackTag} />
    default:
      return null
  }
}
