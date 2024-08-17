import { SoundVariants } from 'src/apis/audio/types/soundVariants'

export const SoundVariant: {
  [T in SoundVariants]: string
} = {
  Looping: 'Looping',
  Default: 'Default',
  Rapid: 'Rapid-Fire'
}
