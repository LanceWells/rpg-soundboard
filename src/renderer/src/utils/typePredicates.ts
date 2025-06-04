import {
  SoundGroupSource,
  SoundGroupSequence,
  ISoundGroup,
  SoundGroupReference
} from 'src/apis/audio/types/items'

export function isSourceGroup(group: ISoundGroup | undefined): group is SoundGroupSource {
  return group?.type === 'source'
}

export function isSequenceGroup(group: ISoundGroup | undefined): group is SoundGroupSequence {
  return group?.type === 'sequence'
}

export function isReferenceGroup(group: ISoundGroup | undefined): group is SoundGroupReference {
  return group?.type === 'reference'
}
