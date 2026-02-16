import { ISoundGroup, SoundGroupSequence, SoundGroupSource } from '../types/items'

export function isSourceGroup(group: ISoundGroup): group is SoundGroupSource {
  return group.type === 'source'
}

export function isSequenceGroup(group: ISoundGroup): group is SoundGroupSequence {
  return group.type === 'sequence'
}
