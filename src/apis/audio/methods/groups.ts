import { produce } from 'immer'
import { AudioConfig } from '../utils/config'
import path from 'node:path'
import { deleteFile, getFileSize, saveSoundEffect } from './fs'
import crypto from 'node:crypto'
import { SupportedFileTypes } from '../supportedFileTypes'
import { GetAppDataPath } from '../../../utils/paths'
import {
  ISoundGroup,
  SequenceElementID,
  SoundEffect,
  SoundGroupSequence,
  SoundGroupSequenceElement,
  SoundGroupSource
} from '../types/items'
import { EffectID } from '../types/effects'
import {
  IGroups,
  GetRequest,
  GetResponse,
  CreateRequest,
  CreateResponse,
  GroupID,
  UpdateRequest,
  UpdateResponse,
  DeleteRequest,
  DeleteResponse,
  GetSoundRequest,
  GetSoundsResponse,
  SoundEffectWithPlayerDetails,
  CreateSequenceRequest
} from '../types/groups'
import { isSequenceGroup, isSourceGroup } from './typePredicates'

const html5ThresholdSizeMb = 2

export const GroupsAudioAPI: IGroups = {
  /**
   * @inheritdoc
   */
  Get: function (request: GetRequest): GetResponse {
    const matchingGroup = AudioConfig.getGroup(request.groupID)
    return {
      group: matchingGroup
    }
  },
  /**
   * @inheritdoc
   */
  GetAll() {
    return {
      groups: AudioConfig.getAllGroups()
    }
  },
  /**
   * @inheritdoc
   */
  Create: function (request: CreateRequest): CreateResponse {
    const newGroupID: GroupID = `grp-${crypto.randomUUID()}`

    const newEffects = request.effects.map((eff) => {
      const newEffectID: EffectID = `eff-${crypto.randomUUID()}`
      const savedFile = saveSoundEffect(newGroupID, eff.path)
      const newEffect: SoundEffect = {
        id: newEffectID,
        path: savedFile.path,
        format: savedFile.format,
        volume: eff.volume,
        name: path.parse(eff.path).name
      }

      return newEffect
    })

    const newGroup: SoundGroupSource = {
      type: 'source',
      effects: newEffects,
      id: newGroupID,
      name: request.name,
      icon: request.icon,
      variant: request.variant,
      tags: request.tags
    }

    const newConfig = produce(AudioConfig.Config, (draft) => {
      draft.Groups.push(newGroup)
    })

    AudioConfig.Config = newConfig

    return {
      group: newGroup
    }
  },
  /**
   * @inheritdoc
   */
  CreateSequence(request: CreateSequenceRequest) {
    const newSequenceGroupID: GroupID = `grp-${crypto.randomUUID()}`

    const newElements = request.sequence.map<SoundGroupSequenceElement>((e) => {
      const newID: SequenceElementID = `seq-${crypto.randomUUID()}`
      switch (e.type) {
        case 'delay': {
          return {
            id: newID,
            type: 'delay',
            msToDelay: e.msToDelay
          }
        }
        case 'group': {
          return {
            id: newID,
            type: 'group',
            groupID: e.groupID
          }
        }
        default: {
          throw new Error(`Unknown type in request ${JSON.stringify(e)}`)
        }
      }
    })

    const newGroup: SoundGroupSequence = {
      type: 'sequence',
      icon: request.icon,
      id: newSequenceGroupID,
      name: request.name,
      sequence: newElements,
      variant: 'Sequence',
      tags: request.tags
    }

    const newConfig = produce(AudioConfig.Config, (draft) => {
      draft.Groups.push(newGroup)
    })

    AudioConfig.Config = newConfig

    return {
      sequence: newGroup
    }
  },
  UpdateSequence(request) {
    const matchingGroup = AudioConfig.getGroup(request.groupID)
    if (!matchingGroup) {
      throw new Error(`Could not find matching group with ID ${request.groupID}.`)
    }

    if (!isSequenceGroup(matchingGroup)) {
      throw new Error('Cannot update non-sequence group')
    }

    const existingElementsMap = new Map(matchingGroup.sequence.map((e) => [e.id, e]))
    const newElements = request.sequence.reduce((acc, curr) => {
      if (existingElementsMap.has(curr.id)) {
        const existingElement = existingElementsMap.get(curr.id)!
        const updatedElement: SoundGroupSequenceElement = {
          ...existingElement,
          ...curr
        }

        acc.push(updatedElement)
        return acc
      }

      const newElementID: SequenceElementID = `seq-${crypto.randomUUID()}`
      const newElement: SoundGroupSequenceElement = {
        ...curr,
        id: newElementID
      }

      acc.push(newElement)
      return acc
    }, [] as SoundGroupSequenceElement[])

    const updatedGroup: SoundGroupSequence = {
      type: 'sequence',
      icon: request.icon,
      id: request.groupID,
      name: request.name,
      sequence: newElements,
      variant: 'Sequence',
      tags: request.tags
    }

    const newConfig = produce(AudioConfig.Config, (draft) => {
      const newGroups =
        draft.Groups.map<ISoundGroup>((g) => {
          if (g.id === request.groupID) {
            return updatedGroup
          }

          return g
        }) ?? []

      draft.Groups = newGroups
    })

    AudioConfig.Config = newConfig

    return { sequence: updatedGroup }
  },
  /**
   * @inheritdoc
   */
  Update: function (request: UpdateRequest): UpdateResponse {
    const matchingGroup = AudioConfig.getGroup(request.groupID)
    if (!matchingGroup) {
      throw new Error(`Could not find matching group with ID ${request.groupID}.`)
    }

    if (!isSourceGroup(matchingGroup)) {
      throw new Error('Cannot update non-source group')
    }

    const existingEffectMap = new Map(matchingGroup?.effects.map((e) => [e.path, e]))
    const newEffects = request.effects.reduce((acc, curr) => {
      // This effect is already saved, so just add it to the list and move on.
      if (existingEffectMap.has(curr.path)) {
        const existingEffect = existingEffectMap.get(curr.path)!
        const updatedEffect: SoundEffect = {
          ...existingEffect,
          ...curr
        }

        acc.push(updatedEffect)

        existingEffectMap.delete(curr.path)
        return acc
      }

      const newEffectID: EffectID = `eff-${crypto.randomUUID()}`
      const savedFile = saveSoundEffect(request.groupID, curr.path)
      const name = path.parse(curr.name).name
      const newEffect: SoundEffect = {
        id: newEffectID,
        path: savedFile.path,
        format: savedFile.format,
        volume: curr.volume,
        name
      }

      acc.push(newEffect)

      return acc
    }, [] as SoundEffect[])

    const soundsToDeleteByPath = [...existingEffectMap.keys()]

    soundsToDeleteByPath.forEach((s) => {
      deleteFile(s)
    })

    const updatedGroup: SoundGroupSource = {
      type: 'source',
      effects: newEffects,
      id: request.groupID,
      name: request.name,
      icon: request.icon,
      variant: request.variant,
      tags: request.tags
    }

    const newConfig = produce(AudioConfig.Config, (draft) => {
      const newGroups =
        draft.Groups.map<ISoundGroup>((g) => {
          if (!isSourceGroup(g)) {
            return g
          }

          if (g.id === request.groupID) {
            return updatedGroup
          }
          return g
        }) ?? []

      draft.Groups = newGroups
    })

    AudioConfig.Config = newConfig

    return {
      group: updatedGroup
    }
  },
  /**
   * @inheritdoc
   */
  Delete: function (request: DeleteRequest): DeleteResponse {
    // Edit the config so that the appropriate board does not include the group to delete.
    const newConfig = produce(AudioConfig.Config, (draft) => {
      draft.Groups = draft.Groups.filter((g) => {
        return g.id !== request.groupID
      })
    })

    AudioConfig.Config = newConfig

    return {}
  },
  /**
   * @inheritdoc
   */
  GetSounds: async function (request: GetSoundRequest): Promise<GetSoundsResponse> {
    const group = AudioConfig.getGroup(request.groupID)

    if (group === undefined || !isSourceGroup(group)) {
      console.error(`Attempt to get sounds from sequence group ${group?.id ?? 'undefined'}`)
      return {
        sounds: [],
        variant: 'Default'
      }
    }

    if (!group || group.effects.length === 0) {
      throw new Error(`Could not find group with effects with id ${request.groupID}.`)
    }

    const effectPromises = group.effects.map<Promise<SoundEffectWithPlayerDetails>>(
      async (effect) => {
        const appDataPath = GetAppDataPath() + '/'
        const actualSystemPath = effect.path.replace('aud://', appDataPath)

        const srcFileSizeInMb = await getFileSize(actualSystemPath)
        const useHtml5 = srcFileSizeInMb > html5ThresholdSizeMb

        return {
          id: effect.id,
          name: effect.name,
          path: effect.path,
          format: effect.format as SupportedFileTypes,
          volume: effect.volume,
          useHtml5
        }
      }
    )

    const effects = await Promise.all(effectPromises)

    return {
      variant: group.variant,
      sounds: effects
    }
  }
}
