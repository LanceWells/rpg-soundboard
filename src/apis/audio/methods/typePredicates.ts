import { ISoundGroup, SoundGroupSequence, SoundGroupSource } from '../types/items'

/**
 * Returns true if the provided group is a {@link SoundGroupSource}.
 * @param group The group to check.
 */
export function isSourceGroup(group: ISoundGroup): group is SoundGroupSource {
  return group.type === 'source'
}

/**
 * Returns true if the provided group is a {@link SoundGroupSequence}.
 * @param group The group to check.
 */
export function isSequenceGroup(group: ISoundGroup): group is SoundGroupSequence {
  return group.type === 'sequence'
}
