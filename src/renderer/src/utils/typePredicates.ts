import { SoundGroupSource, SoundGroupSequence, ISoundGroup } from 'src/apis/audio/types/items'
import { ISoundtrackContainer } from './soundContainer/interface'

export function isSourceGroup(group: ISoundGroup | undefined): group is SoundGroupSource {
  return group?.type === 'source'
}

export function isSequenceGroup(group: ISoundGroup | undefined): group is SoundGroupSequence {
  return group?.type === 'sequence'
}

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
