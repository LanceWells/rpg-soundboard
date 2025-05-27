import type {
  SoundVariants,
  // @ts-ignore Import this import being unused so that intellisense works on the descriptions.
  SoundVariantFields
} from 'src/apis/audio/types/soundVariants'

/**
 * An object used to encapsulate user-facing values for the {@link SoundVariants} enum.
 *
 * This is created as a const value, which necessarily has an entry for every sound variant type.
 */
export const SoundVariant: {
  [T in SoundVariants]: string
} = {
  /**
   * See {@link SoundVariantFields.Default}.
   */
  Default: 'Default',

  /**
   * See {@link SoundVariantFields.Looping}.
   */
  Looping: 'Looping',

  /**
   * See {@link SoundVariantFields.Rapid}.
   */
  Rapid: 'Rapid-Fire',

  /**
   * See {@link SoundVariantFields.Soundtrack}.
   */
  Soundtrack: 'Soundtrack',

  Sequence: 'Sequence'
}
