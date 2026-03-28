import type { SupportedFileTypes } from '../supportedFileTypes'
import type { SoundVariants } from './soundVariants'
import type { EffectID } from './effects'
import type { BoardID } from './boards'
import type { CategoryID } from './categories'
import { GroupID } from './groups'

/**
 * Represents the icon associated with an {@link SoundGroupSource}.
 */
export type SvgSoundIcon = {
  type: 'svg'

  /**
   * The name of the icon to use. This name refers to the name of the icon from the game-icons
   * repository.
   */
  name: string

  /**
   * The hex code for the foreground color to use with the group's icon.
   */
  foregroundColor: string
}

/**
 * Represents an icon sourced from a pixel-art image file rather than an SVG.
 */
export type PixelSoundIcon = {
  type: 'pixel'

  /**
   * The filename or identifier of the pixel icon to render.
   */
  name: string
}

/**
 * A union of all icon variants that can be associated with a sound group.
 */
export type SoundIcon = SvgSoundIcon | PixelSoundIcon

/**
 * Represents an independent sound effect, for use with picking a random sound from a
 * {@link SoundGroupSource}.
 */
export type SoundEffect = {
  /**
   * The ID for the effect.
   */
  id: EffectID

  /**
   * The filepath associated with the given sound effect. Should generally be located in the app
   * directory.
   */
  path: string

  /**
   * The file type associated with this given sound effect.
   */
  format: SupportedFileTypes

  /**
   * The volume associated with the sound effect. Represented by a number from 0 to 200, where 100
   * is the original volume of the audio.
   */
  volume: number

  /**
   * A human-readable label for the sound effect, displayed in the UI.
   */
  name: string
}

/**
 * An extraction of editable fields for {@link SoundEffect}.
 */
export type SoundEffectEditableFields = Omit<SoundEffect, 'id' | 'format'>

/**
 * An ID that refers to a particular element within a {@link SoundGroupSequence}.
 */
export type SequenceElementID = `seq-${string}-${string}-${string}-${string}-${string}`

/**
 * The discriminant values for the different sound group subtypes.
 */
export type SoundGroupTypes = 'sequence' | 'source'

export interface ISoundGroup {
  /**
   * Discriminant field identifying which subtype of {@link ISoundGroup} this object represents.
   */
  type: SoundGroupTypes

  /**
   * The ID for the group.
   */
  id: GroupID

  /**
   * A variant refers to the general behavior for a given sound group type. This will impact items
   * such as:
   *  - fade in/out
   *  - looping
   *  - tempo
   *  - how the associated button reacts when pressed
   */
  variant: SoundVariants

  /**
   * A name used to represent the group. Ideally this should be short, as it will be rendered in
   * small text underneath a small-sized button.
   */
  name: string

  /**
   * The icon that will be displayed as the button for the sound effect.
   */
  icon: SoundIcon

  /**
   * Any tags related to this item. These are primarily used for searching and sorting.
   */
  tags: string[]
}

/**
 * Represents a group of independent sound effects. Note that this is represented by a series of
 * buttons on a soundboard. The effects contained by this group are meant to be a randomization of
 * possible sounds that the group might produce.
 */
export interface SoundGroupSource extends ISoundGroup {
  type: 'source'

  /**
   * A series of sound effects represented by this group. These are a set of sounds that could
   * evenly be played once the button is pressed.
   */
  effects: SoundEffect[]
}

/**
 * A sequence element that pauses playback for a fixed duration before continuing.
 */
export type SoundGroupSequenceDelay = {
  type: 'delay'
  /**
   * The unique identifier for this sequence element.
   */
  id: SequenceElementID
  /**
   * The number of milliseconds to wait before the next element in the sequence is triggered.
   */
  msToDelay: number
}

/**
 * A sequence element that triggers a particular sound group when reached.
 */
export type SoundGroupSequenceGroup = {
  type: 'group'
  /**
   * The unique identifier for this sequence element.
   */
  id: SequenceElementID
  /**
   * The ID of the sound group to trigger.
   */
  groupID: GroupID
}

/**
 * A union of all possible element types that can appear within a {@link SoundGroupSequence}.
 */
export type SoundGroupSequenceElement = SoundGroupSequenceGroup | SoundGroupSequenceDelay

export interface SoundGroupSequence extends ISoundGroup {
  type: 'sequence'
  /**
   * The ordered list of elements to play when this sequence group is triggered.
   */
  sequence: SoundGroupSequenceElement[]
}

/**
 * An extraction of editable fields for {@link SoundGroupSequence}.
 */
export type SoundGroupSequenceEditableFields = Omit<SoundGroupSequence, 'id' | 'variant' | 'type'>

/**
 * An extraction of editable fields for {@link SoundGroupSource}.
 */
export type SoundGroupSourceEditableFields = Omit<SoundGroupSource, 'id' | 'effects'> & {
  /**
   * An extraction of editable fields for sound effects. Created here to represent the set of
   * editable effects for this group.
   */
  effects: SoundEffectEditableFields[]
}

/**
 * A item that represents the editable fields for a given {@link SoundCategory} item.
 */
export type SoundCategoryEditableFields = Omit<SoundCategory, 'id'>
