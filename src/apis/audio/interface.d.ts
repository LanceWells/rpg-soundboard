import { SoundVariant } from './types/soundVariants'
import { SupportedFileTypes } from './supportedFileTypes'

import type { IBoards } from './types/boards'
import type { ICategories } from './types/categories'
import type { IGroups } from './types/groups'
import type { ISounds } from './types/sounds'
import type { SoundBoard } from './types/items'

/**
 * The root object for the audio API, and the storage for all soundboards.
 */
export type AudioApiConfig = {
  /**
   * The set of soundboards that are stored in the relevant config file.
   */
  boards: SoundBoard[]

  version: 2
}

/**
 * An interface used to define the set of methods that comprise the "Audio" side of the application.
 */
export interface IAudioApi {
  /**
   * An accessor object for the audio APIs related to SoundBoard objects.
   */
  Boards: IBoards

  /**
   * An accessor object for the audio APIs related to SoundCategory objects.
   */
  Groups: IGroups

  /**
   * An accessor object for the audio APIs related to SoundGroup objects.
   */
  Categories: ICategories

  /**
   * An accessor object for the audio APIs related to non-object specific methods.
   */
  Sounds: ISounds
}
