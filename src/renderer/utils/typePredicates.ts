import { ISoundGroup, SoundGroupSource, SoundGroupSequence } from '../../apis/audio/types/items'

export function isSourceGroup(group: ISoundGroup | undefined): group is SoundGroupSource {
  return group?.type === 'source'
}

export function isSequenceGroup(group: ISoundGroup | undefined): group is SoundGroupSequence {
  return group?.type === 'sequence'
}
