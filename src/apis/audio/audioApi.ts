import { IAudioApi } from './interface'
import { GroupsAudioAPI } from './methods/groups'
import { SoundsAudioAPI } from './methods/sounds'

/**
 * A root into the various audio APIs available for this project.
 */
export const audioApi: IAudioApi = {
  /**
   * An accessor object for the audio APIs related to SoundGroup objects.
   */
  Groups: GroupsAudioAPI,

  /**
   * An accessor object for the audio APIs related to non-object specific methods.
   */
  Sounds: SoundsAudioAPI
}
