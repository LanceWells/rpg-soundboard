import { SoundVariants } from 'src/apis/audio/types/soundVariants'
import LoopingTag from '@renderer/assets/images/Tags/Looping.png'
import RapidTag from '@renderer/assets/images/Tags/Rapid.png'
import SoundtrackTag from '@renderer/assets/images/Tags/Soundtrack.png'
import SequenceTag from '@renderer/assets/images/Tags/Sequence.png'

export type VariantTagProps = {
  variant: SoundVariants
  className: string
}

export function VariantTag(props: VariantTagProps) {
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
