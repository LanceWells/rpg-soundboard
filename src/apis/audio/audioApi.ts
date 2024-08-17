import { IAudioApi } from './interface'
import { BoardsAudioAPI } from './methods/boards'
import { CategoriesAudioAPI } from './methods/categories'
import { GroupsAudioAPI } from './methods/groups'
import { SoundsAudioAPI } from './methods/sounds'

/**
 * A root into the various audio APIs available for this project.
 */
export const audioApi: IAudioApi = {
  /**
   * An accessor object for the audio APIs related to SoundBoard objects.
   */
  Boards: BoardsAudioAPI,

  /**
   * An accessor object for the audio APIs related to SoundCategory objects.
   */
  Categories: CategoriesAudioAPI,

  /**
   * An accessor object for the audio APIs related to SoundGroup objects.
   */
  Groups: GroupsAudioAPI,

  /**
   * An accessor object for the audio APIs related to non-object specific methods.
   */
  Sounds: SoundsAudioAPI
}
