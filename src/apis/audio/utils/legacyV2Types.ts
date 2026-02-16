import path from 'path'
import { GetAppDataPath } from '../../../utils/paths'
import { GroupID } from '../types/groups'
import { SoundEffect } from '../types/items'
import { SoundVariants } from '../types/soundVariants'

/**
 * The root object for the audio API, and the storage for all soundboards.
 */
export type AudioApiConfigV2 = {
  /**
   * The set of soundboards that are stored in the relevant config file.
   */
  boards: SoundBoard[]

  version: number
}

/**
 * An ID that refers to a particular soundboard.
 */
export type BoardID = `brd-${string}-${string}-${string}-${string}-${string}`

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
  groups: ISoundGroupV2[]

  /**
   * The set of sound categories that should be represented within this particular soundboard.
   */
  categories: [SoundCategory, ...SoundCategory[]]
}

/**
 * A sound category refers to a visual grouping of {@link SoundGroupSource} objects. These objects should
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
 * An ID that refers to a particular sound category.
 */
export type CategoryID = `cat-${string}-${string}-${string}-${string}-${string}`

export type SoundGroupTypes = 'sequence' | 'source' | 'reference'

export interface ISoundGroupV2 {
  type: SoundGroupTypes

  /**
   * The ID for the group.
   */
  id: GroupID
}

export interface ISoundGroupSource extends ISoundGroupV2 {
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
  icon: SoundIconV2
}

/**
 * Represents a group of independent sound effects. Note that this is represented by a series of
 * buttons on a soundboard. The effects contained by this group are meant to be a randomization of
 * possible sounds that the group might produce.
 */
export interface SoundGroupSource extends ISoundGroupSource {
  type: 'source'

  /**
   * A series of sound effects represented by this group. These are a set of sounds that could
   * evenly be played once the button is pressed.
   */
  effects: SoundEffect[]
}

export interface SoundGroupReference extends ISoundGroupV2 {
  type: 'reference'
  id: GroupID
  category: CategoryID
}

/**
 * Represents the icon associated with an {@link SoundGroupSource}.
 */
export type SoundIconV2 = {
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

const getBoardPath = (boardID: BoardID): string => {
  const appDataPath = GetAppDataPath()
  const boardDir = path.join(appDataPath, 'board-data', boardID)

  return boardDir
}

export const getGroupPath = (boardID: BoardID, groupID: GroupID): string => {
  const grpDir = path.join(getBoardPath(boardID), groupID)

  return grpDir
}
