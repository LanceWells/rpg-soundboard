import type { SoundVariants } from 'src/apis/audio/soundVariants'

export const SoundVariant: {
  [T in SoundVariants]: string
} = {
  Looping: 'Looping',
  Default: 'Default',
  Rapid: 'Rapid-Fire'
}
