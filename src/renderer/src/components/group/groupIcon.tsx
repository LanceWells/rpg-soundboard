import MusicNoteIcon from '@renderer/assets/icons/musicnote'
import PistolIcon from '@renderer/assets/icons/pistol'
import RepeatIcon from '@renderer/assets/icons/repeat'
import SequenceIcon from '@renderer/assets/icons/sequence'
import { JSX } from 'react'
import { SoundVariants } from 'src/apis/audio/types/soundVariants'

export type GroupIconProps = {
  variant: SoundVariants
}

export default function GroupIcon(props: GroupIconProps) {
  const { variant } = props

  let icon: JSX.Element = <></>
  switch (variant) {
    case 'Looping': {
      icon = <RepeatIcon className="h-4 w-4 m-1" />
      break
    }
    case 'Rapid': {
      icon = <PistolIcon className="h-4 w-4 m-1" />
      break
    }
    case 'Soundtrack': {
      icon = <MusicNoteIcon className="h-4 w-4 m-1" />
      break
    }
    case 'Sequence': {
      icon = <SequenceIcon className="h-4 w-4 m-1" />
      break
    }
  }

  return (
    <span
      className={`
                indicator-item
                rounded-full
                indicator-bottom
                indicator-start
                badge-neutral
              `}
    >
      {icon}
    </span>
  )
}
