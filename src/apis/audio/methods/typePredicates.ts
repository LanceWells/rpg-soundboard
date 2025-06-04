import {
  ISoundGroup,
  SoundGroupReference,
  SoundGroupSequence,
  SoundGroupSource
} from '../types/items'

export function isSourceGroup(group: ISoundGroup): group is SoundGroupSource {
  return group.type === 'source'
}

export function isReferenceGroup(
  group: ISoundGroup | SoundGroupReference
): group is SoundGroupReference {
  return group.type === 'reference'
}

export function isSequenceGroup(group: ISoundGroup): group is SoundGroupSequence {
  return group.type === 'sequence'
}
