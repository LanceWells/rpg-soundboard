import { ColorOptions, FormInput, GroupFormInput, SequenceFormInput } from '../types'
import { ISoundGroup, SoundGroupSequence, SoundGroupSource } from 'src/apis/audio/types/items'
import { produce } from 'immer'

/**
 * Returns a blank {@link GroupFormInput} with sensible default icon and empty effects.
 */
export function newDefaultGroupRequest(): GroupFormInput {
  return {
    type: 'group',
    request: {
      effects: [],
      icon: {
        foregroundColor: ColorOptions['white'],
        name: 'moon',
        type: 'svg'
      },
      name: '',
      tags: [],
      type: 'source',
      variant: 'Default'
    }
  }
}

/**
 * Returns a blank {@link SequenceFormInput} with sensible default icon and empty sequence.
 */
export function newDefaultSequenceRequest(): SequenceFormInput {
  return {
    type: 'sequence',
    request: {
      icon: {
        foregroundColor: ColorOptions['white'],
        name: 'moon',
        type: 'svg'
      },
      name: '',
      tags: [],
      sequence: []
    }
  }
}

/**
 * Converts an existing {@link ISoundGroup} into a {@link FormInput} suitable for pre-populating the edit form.
 */
export function copyGroupForRequest(group: ISoundGroup): FormInput {
  switch (group.type) {
    case 'source': {
      const groupCopy = produce(group as SoundGroupSource, (draft) => draft)
      return {
        type: 'group',
        request: groupCopy
      }
    }
    case 'sequence': {
      const groupCopy = produce(group as SoundGroupSequence, (draft) => draft)
      return {
        type: 'sequence',
        request: groupCopy
      }
    }
  }
}
