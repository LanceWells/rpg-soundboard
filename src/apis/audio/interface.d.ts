import { SoundVariant } from './types/soundVariants'
import { SupportedFileTypes } from './supportedFileTypes'

import type { IGroups } from './types/groups'
import type { ISounds } from './types/sounds'
import type { ISoundGroup } from './types/items'
import { IIcons } from './types/icons'

/**
 * The root object for the audio API config, storing all sound groups and user preferences.
 */
export type AudioApiConfig = {
  /**
   * The set of sound groups stored in the relevant config file.
   */
  Groups: ISoundGroup[]

  /**
   * The list of search terms the user has pinned for quick access.
   */
  pinnedSearches: string[]

  /**
   * The schema version of this config. Used to determine which migrations need to be applied.
   */
  version: number
}

/**
 * An interface used to define the set of methods that comprise the "Audio" side of the application.
 */
export interface IAudioApi {
  /**
   * An accessor object for the audio APIs related to SoundGroup objects.
   */
  Groups: IGroups

  /**
   * An accessor object for the audio APIs related to non-object specific methods.
   */
  Sounds: ISounds

  /**
   * An accessor object for the audio APIs related to icon searching and group input generation.
   */
  Icons: IIcons
}
