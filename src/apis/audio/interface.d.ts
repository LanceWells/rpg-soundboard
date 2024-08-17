import { SoundVariant } from './types/soundVariants'
import { SupportedFileTypes } from './supportedFileTypes'

import type { IBoards } from './types/boards'
import type { ICategories } from './types/categories'
import type { IGroups } from './types/groups'
import type { ISounds } from './types/sounds'

/**
 * The root object for the audio API, and the storage for all soundboards.
 */
export type AudioApiConfig = {
  /**
   * The set of soundboards that are stored in the relevant config file.
   */
  boards: SoundBoard[]
}

/**
 * An interface used to define the set of methods that comprise the "Audio" side of the application.
 */
export interface IAudioApi {
  Boards: IBoards
  Groups: IGroups
  Categories: ICategories
  Sounds: ISounds
}
