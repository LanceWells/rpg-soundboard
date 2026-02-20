/**
 * The types of sounds that a single button (group) might represent. These define the overall
 * behavior of a particular button.
 */
export const SoundVariants = {
  /**
   * A standard approach to sound effects. After a sound for this group is chosen at random, it will
   * play once. If pressed again, the sound effect will stop playing.
   */
  Default: 'Default',

  /**
   * Useful for background sound effects. When pressing the button, the effect will start with a
   * short fade-in time. When pressing the button again, the effect will stop, again with a short
   * fade time.
   */
  Looping: 'Looping',

  /**
   * Useful for effects that need to overlap with itself. When pressed, a random sound effect will
   * be played. If pressed again, a new effect will be chosen and will overlap the original sound.
   *
   * Effects that are played this way will also have a random pitch adjustment, which adds variety
   * to the output sound effect.
   *
   * For example, if this button were used for the sound of a gun firing, the group could contain
   * 3 effects, and when pressed, one sound would be chosen at random with a variable pitch. This
   * allows the user to rapidly press the button, getting a unique sound each time.
   */
  Rapid: 'Rapid',

  Soundtrack: 'Soundtrack',

  Sequence: 'Sequence'
}

/**
 * The types of sounds that a single button (group) might represent. These define the overall
 * behavior of a particular button.
 *
 * Note :: This is exported as a keyof type such that it allows for more explicit documentation for
 * each effect type on the originating "fields" type.
 */
export type SoundVariants = keyof typeof SoundVariants
