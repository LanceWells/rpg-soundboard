import { SoundGroup, SoundGroupReference, SoundGroupSource } from '../types/items'

export function isSourceGroup(group: SoundGroup): group is SoundGroupSource {
  return group.type === 'source'
}

export function isReferenceGroup(group: SoundGroup): group is SoundGroupReference {
  return group.type === 'reference'
}
