import type { SupportedFileTypes } from '../supportedFileTypes'
import type { SoundVariants } from './soundVariants'
import type { EffectID } from './effects'
import type { BoardID } from './boards'
import type { CategoryID } from './categories'
import { GroupID } from './groups'

/**
 * Represents the icon associated with an {@link SoundGroup}.
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
 * {@link SoundGroup}.
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
}

/**
 * An extraction of editable fields for {@link SoundEffect}.
 */
export type SoundEffectEditableFields = Omit<SoundEffect, 'id' | 'format'>

/**
 * Represents a group of independent sound effects. Note that this is represented by a series of
 * buttons on a soundboard. The effects contained by this group are meant to be a randomization of
 * possible sounds that the group might produce.
 */
export type SoundGroup = {
  /**
   * The ID for the group.
   */
  id: GroupID

  /**
   * A name used to represent the group. Ideally this should be short, as it will be rendered in
   * small text underneath a small-sized button.
   */
  name: string

  /**
   * A series of sound effects represented by this group. These are a set of sounds that could
   * evenly be played once the button is pressed.
   */
  effects: SoundEffect[]

  /**
   * The icon that will be displayed as the button for the sound effect.
   */
  icon: SoundIcon

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
   * An optional identifier for a category for this particular sound group. Note that this is not a
   * required field. If the field is not specified, it implies that the sound group is
   * "uncategorized", and should not be rendered visibly within any category container.
   */
  category: CategoryID
}

export type SoundGroupReference = {
  groupID: GroupID
  boardID: BoardID
}

/**
 * An extraction of editable fields for {@link SoundGroup}.
 */
export type SoundGroupEditableFields = Omit<SoundGroup, 'id' | 'effects'> & {
  /**
   * An extraction of editable fields for sound effects. Created here to represent the set of
   * editable effects for this group.
   */
  effects: SoundEffectEditableFields[]
}

/**
 * A sound category refers to a visual grouping of {@link SoundGroup} objects. These objects should
 * be rendered in close proximity, and ought to use some form of Gestalt psychology to make the
 * items appear related.
 */
export type SoundCategory = {
  /**
   * The unique identifier for the category.
   */
  id: CategoryID

  /**
   * The name for the category that should be rendered visibly.
   */
  name: string
}

/**
 * A item that represents the editable fields for a given {@link SoundCategory} item.
 */
export type SoundCategoryEditableFields = Omit<SoundCategory, 'id'>

/**
 * Represents an individual sound board object. The sound board is the "root" container for all
 * sounds, and should change the entire view to represent its collection of sound effects, once the
 * board has been selected.
 *
 * A board contains groups, which themselves contain effects. The hierarchy being:
 * ```
 * board -> group A -> effect A
 *       |          |  effect B
 *       |
 *       -> group B -> effect C
 * ```
 */
export type SoundBoard = {
  /**
   * The ID for the sound board.
   */
  id: BoardID

  /**
   * The name for the sound board. Used as the primary identifier for a given sound board.
   */
  name: string

  /**
   * The set of groups represented by this sound board. Each group should be represented as an
   * individual button on a given soundboard.
   */
  groups: SoundGroup[]

  references: SoundGroupReference[]

  /**
   * The set of sound categories that should be represented within this particular soundboard.
   */
  categories: [SoundCategory, ...SoundCategory[]]
}

/**
 * A set of editable fields as a subset of a {@link SoundBoard}.
 */
export type SoundBoardEditableFields = Omit<SoundBoard, 'id' | 'groups'>
