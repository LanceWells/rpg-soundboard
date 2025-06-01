import {
  SoundGroup,
  SoundGroupReference,
  SoundGroupSequence,
  SoundGroupSource
} from '../types/items'

export function isSourceGroup(group: SoundGroup): group is SoundGroupSource {
  return group.type === 'source'
}

export function isReferenceGroup(group: SoundGroup): group is SoundGroupReference {
  return group.type === 'reference'
}

export function isSequenceGroup(group: SoundGroup): group is SoundGroupSequence {
  return group.type === 'sequence'
}
