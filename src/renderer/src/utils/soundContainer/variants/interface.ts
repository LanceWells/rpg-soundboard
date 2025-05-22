import { SoundVariants } from 'src/apis/audio/types/soundVariants'

export interface ISoundContainer {
  Variant: SoundVariants
  Play(): void
  Stop(): void
  ChangeVolume(volume: number): void
  Fade(ratio: number): void
}
