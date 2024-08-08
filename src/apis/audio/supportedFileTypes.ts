/**
 * A set of all supported audio file types.
 */
export const SupportedFileTypes = {
  '.mp3': 0,
  '.mpeg': 1,
  '.opus': 2,
  '.ogg': 3,
  '.oga': 4,
  '.wav': 5,
  '.aac': 6,
  '.caf': 7,
  '.m4a': 8,
  '.mp4': 9,
  '.weba': 10,
  '.webm': 11,
  '.dolby': 12,
  '.flac': 13
}

/**
 * A type used to indicate the set of supported file types.
 */
export type SupportedFileTypes = keyof typeof SupportedFileTypes
