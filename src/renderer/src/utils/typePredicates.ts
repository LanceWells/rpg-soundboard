import { SoundGroupSource, SoundGroupSequence, ISoundGroup } from 'src/apis/audio/types/items'
import { ISoundtrackContainer } from './soundContainer/interface'

/**
 * Type guard that narrows an ISoundGroup to SoundGroupSource (type === 'source').
 */
export function isSourceGroup(group: ISoundGroup | undefined): group is SoundGroupSource {
  return group?.type === 'source'
}

/**
 * Type guard that narrows an ISoundGroup to SoundGroupSequence (type === 'sequence').
 */
export function isSequenceGroup(group: ISoundGroup | undefined): group is SoundGroupSequence {
  return group?.type === 'sequence'
}

/**
 * Type guard that checks whether an unknown value implements the ISoundtrackContainer interface via duck-typing.
 */
export function isSoundtrackContainer(
  group: unknown | undefined | null
): group is ISoundtrackContainer {
  const testGroup = group as unknown as ISoundtrackContainer
  if (!testGroup['playNextSong'] || typeof testGroup['playNextSong'] !== 'function') {
    return false
  }
  if (!testGroup['getActiveSong'] || typeof testGroup['getActiveSong'] !== 'function') {
    return false
  }
  return true
}
