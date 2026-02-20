import { ColorOptions, FormInput, GroupFormInput, SequenceFormInput } from '../types'
import { ISoundGroup, SoundGroupSequence, SoundGroupSource } from 'src/apis/audio/types/items'
import { produce } from 'immer'

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
      variant: 'Default',
      sequence: [],
      type: 'sequence'
    }
  }
}

export function containerToRequest(group: ISoundGroup): FormInput {
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
