import type { SupportedFileTypes } from '../supportedFileTypes'
import type { SoundVariants } from './soundVariants'
import type { EffectID } from './effects'
import type { BoardID } from './boards'
import type { CategoryID } from './categories'
import { GroupID } from './groups'

/**
 * Represents the icon associated with an {@link SoundGroupSource}.
 */
export type SoundIcon = {
  /**
   * The name of the icon to use. This name refers to the name of the icon from the game-icons
   * repository.
   */
  name: string

  /**
   * The hex code for the background color to use with the group's icon.
   */
  backgroundColor: string

  /**
   * The hex code for the foreground color to use with the group's icon.
   */
  foregroundColor: string
}

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
   * The file type associated with this given sound effect. Used with howler to determine how to
   * play the given audio, considering that the audio will be translated into a base64 data URL.
   */
  format: SupportedFileTypes

  /**
   * The volume associated with the sound effect. Represented by a number from 0 to 100, where 100
   * is the original volume of the audio.
   */
  volume: number

  name: string
}

/**
 * An extraction of editable fields for {@link SoundEffect}.
 */
export type SoundEffectEditableFields = Omit<SoundEffect, 'id' | 'format'>

export type SequenceElementID = `seq-${string}-${string}-${string}-${string}-${string}`

export type SoundGroupTypes = 'sequence' | 'source'

export interface ISoundGroup {
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

export type SoundGroupSequenceDelay = {
  type: 'delay'
  id: SequenceElementID
  msToDelay: number
}

export type SoundGroupSequenceGroup = {
  type: 'group'
  id: SequenceElementID
  groupID: GroupID
}

export type SoundGroupSequenceElement = SoundGroupSequenceGroup | SoundGroupSequenceDelay

export interface SoundGroupSequence extends ISoundGroup {
  type: 'sequence'
  sequence: SoundGroupSequenceElement[]
}

export type SoundGroupSequenceEditableFields = Omit<SoundGroupSequence, 'id'>

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
