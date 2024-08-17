import { SoundEffectEditableFields } from './items'
import { SupportedFileTypes } from '../supportedFileTypes'

/**
 * The request object for {@link ISounds.Preview}.
 */
export type PreviewSoundRequest = {
  /**
   * The set of editable fields for a given sound effect. Note that we only require the editable
   * fields as there is no ID, etc. that can be attributed to an unsaved sound.
   */
  effect: SoundEffectEditableFields
}

/**
 * The response object for {@link ISounds.Preview}.
 */
export type PreviewSoundResponse = {
  /**
   * The base64, data URL for a given sound effect.
   */
  soundB64: string

  /**
   * The format for the original sound effect. Note that this is required when playing a sound via
   * a data URL.
   */
  format: SupportedFileTypes

  /**
   * The volume to play for the sound effect. Will range from 0 to 100.
   */
  volume: number

  /**
   * For preview sounds, this will generally be "false". The reason is that sound previews go
   * through a different process from typical group sound fetching. For sound gruops we fetch from
   * the user's application data folder while for previews, we use a data URL from a file loaded
   * anywhere on the user's system.
   *
   * The resulting data URL is trimmed, so the general html5 selection process is different.
   */
  useHtml5: boolean
}

/**
 * A fragment of the larger audio interface.
 *
 * These items refer to sound-related actions that are not part of a particular container type.
 */
export interface ISounds {
  Preview(request: PreviewSoundRequest): Promise<PreviewSoundResponse>
}
