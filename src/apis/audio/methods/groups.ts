import { produce } from 'immer'
import { AudioConfig } from '../utils/config'
import path from 'node:path'
import { copyGroupFolder, deleteFile, deleteGroupFolder, getFileSize, saveSoundEffect } from './fs'
import { BoardsAudioAPI } from './boards'
import crypto from 'node:crypto'
import { SupportedFileTypes } from '../supportedFileTypes'
import { GetAppDataPath } from '../../../utils/paths'
import { SoundEffect, SoundGroup, SoundGroupSource } from '../types/items'
import { CategoryID } from '../types/categories'
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
  ReorderRequest,
  ReorderResponse,
  GetSoundRequest,
  GetSoundResponse,
  AddEffectRequest,
  AddEffectResponse,
  MoveRequest,
  MoveResponse,
  LinkRequest,
  LinkResponse
} from '../types/groups'
import { isReferenceGroup, isSourceGroup } from './typePredicates'

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
  Create: function (request: CreateRequest): CreateResponse {
    const matchingBoard = AudioConfig.getBoard(request.boardID)
    if (!matchingBoard) {
      throw new Error(`Could not find matching board with ID ${request.boardID}.`)
    }

    const newGroupID: GroupID = `grp-${crypto.randomUUID()}`

    const newEffects = request.effects.map((eff) => {
      const newEffectID: EffectID = `eff-${crypto.randomUUID()}`
      const savedFile = saveSoundEffect(request.boardID, newGroupID, eff.path)
      const newEffect: SoundEffect = {
        id: newEffectID,
        path: savedFile.path,
        format: savedFile.format,
        volume: eff.volume
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
      category: matchingBoard.categories[0].id
    }

    const newConfig = produce(AudioConfig.Config, (draft) => {
      const matchingBoard = draft.boards.find((b) => b.id === request.boardID)
      matchingBoard?.groups.push(newGroup)
    })

    AudioConfig.Config = newConfig

    return {
      group: newGroup
    }
  },
  /**
   * @inheritdoc
   */
  Update: function (request: UpdateRequest): UpdateResponse {
    const matchingGroup = AudioConfig.getGroup(request.groupID)
    if (!matchingGroup) {
      throw new Error(`Could not find matching grup with ID ${request.groupID}.`)
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
      const savedFile = saveSoundEffect(request.boardID, request.groupID, curr.path)
      const newEffect: SoundEffect = {
        id: newEffectID,
        path: savedFile.path,
        format: savedFile.format,
        volume: curr.volume
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
      category: request.category
    }

    const newConfig = produce(AudioConfig.Config, (draft) => {
      const matchingBoard = draft.boards.find((b) => b.id === request.boardID)
      const newGroups =
        matchingBoard?.groups.map<SoundGroup>((g) => {
          if (!isSourceGroup(g)) {
            return g
          }

          if (g.id === request.groupID) {
            return updatedGroup
          }
          return g
        }) ?? []

      if (matchingBoard) {
        matchingBoard.groups = newGroups
      }
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
    // Get the board for this group in the map.
    // Remove the group from that board.
    const boardFromMap = [...BoardsAudioAPI.GetAll({}).boards].find((b) =>
      b.groups.some((g) => isSourceGroup(g) && g.id === request.groupID)
    )

    if (!boardFromMap) {
      return {}
    }

    const boardID = boardFromMap?.id

    // Edit the config so that the appropriate board does not include the group to delete.
    const newConfig = produce(AudioConfig.Config, (draft) => {
      draft.boards.forEach((b) => {
        b.groups = b.groups.filter((g) => {
          if (isSourceGroup(g)) {
            return g.id !== request.groupID
          }
          if (isReferenceGroup(g)) {
            return g.id !== request.groupID
          }
          throw new Error(`Tried to remove a group from ${b.id} that didn't have a known type`)
        })
      })
    })

    AudioConfig.Config = newConfig

    if (boardID) {
      deleteGroupFolder(boardID, request.groupID)
    }

    return {}
  },
  Move: function (request: MoveRequest): MoveResponse {
    const oldBoardFromMap = [...BoardsAudioAPI.GetAll({}).boards].find((b) =>
      b.groups.some((g) => isSourceGroup(g) && g.id === request.groupID)
    )

    if (!oldBoardFromMap) {
      return {}
    }

    const newBoardFromMap = [...BoardsAudioAPI.GetAll({}).boards].find(
      (b) => b.id === request.boardID
    )

    if (!newBoardFromMap) {
      return {}
    }

    const newGroupID: GroupID = `grp-${crypto.randomUUID()}`
    const newConfig = produce(AudioConfig.Config, (draft) => {
      if (!oldBoardFromMap) {
        return
      }

      const oldBoardFromConfig = draft.boards.find((b) => b.id === oldBoardFromMap.id)
      if (!oldBoardFromConfig) {
        return
      }

      const newBoardFromConfig = draft.boards.find((b) => b.id === request.boardID)
      if (!newBoardFromConfig) {
        return
      }

      const groupFromConfigIndex = oldBoardFromConfig.groups.findIndex(
        (g) => isSourceGroup(g) && g.id === request.groupID
      )
      if (groupFromConfigIndex === -1) {
        return
      }

      const groupFromConfig = oldBoardFromConfig.groups.splice(
        groupFromConfigIndex,
        1
      )[0] as SoundGroupSource

      groupFromConfig.id = newGroupID
      groupFromConfig.effects = groupFromConfig.effects.map((e) => ({
        ...e,
        path: e.path
          .replace(oldBoardFromConfig.id, newBoardFromConfig.id)
          .replace(request.groupID, newGroupID)
      }))

      const newCategory = newBoardFromConfig.categories[0]
      groupFromConfig.category = newCategory.id
      newBoardFromConfig.groups.push(groupFromConfig)
    })

    copyGroupFolder(oldBoardFromMap.id, newBoardFromMap.id, request.groupID, newGroupID)
    deleteGroupFolder(oldBoardFromMap.id, request.groupID)

    AudioConfig.Config = newConfig

    return {}
  },
  /**
   * @inheritdoc
   */
  Reorder: function (request: ReorderRequest): ReorderResponse {
    const board = AudioConfig.getBoard(request.boardID)

    if (!board) {
      console.error(`${this.Reorder.name}: board not found with id (${request.boardID})`)
      return {}
    }

    if (request.category && !board.categories?.map((c) => c.id).includes(request.category)) {
      console.error(`${this.Reorder.name}: category not found with id (${request.category})`)
      return {}
    }

    const groupsByCategory = board.groups.reduce((acc, curr) => {
      if (!acc.has(curr.category)) {
        acc.set(curr.category, [])
      }

      acc.get(curr.category)!.push(curr)
      return acc
    }, new Map<CategoryID, SoundGroup[]>())

    const thisCategoryID = request['category']
    const thisCategoryGroups = groupsByCategory.get(thisCategoryID)

    if (!thisCategoryGroups) {
      console.error(`${this.Reorder.name}: invalid category ${thisCategoryID}`)
      return {}
    }

    if (request.newOrder.length !== thisCategoryGroups!.length) {
      console.error(
        `${this.Reorder.name}: new order is (${request.newOrder.length}) which does not match (${board.groups.length})`
      )
      return {}
    }

    // Most importantly, the groups in this category should be in the new order that we've specified
    // in the request.
    const groupsInNewOrder = [
      ...(board.categories?.flatMap((c) => {
        const theseGroups = groupsByCategory.get(c.id) ?? []
        if (request.category !== c.id) {
          return theseGroups
        }

        const groupMap = new Map(theseGroups.map((g) => [g.id, g]))
        const newOrder = request.newOrder
          .map((o) => groupMap.get(o))
          .filter((o) => o !== undefined) as SoundGroupSource[]

        return newOrder
      }) ?? [])
    ]

    const newConfig = produce(AudioConfig.Config, (draft) => {
      const matchingBoard = draft.boards.find((b) => b.id === request.boardID)
      matchingBoard!.groups = groupsInNewOrder
    })

    AudioConfig.Config = newConfig

    return {}
  },
  /**
   * @inheritdoc
   */
  GetSound: async function (request: GetSoundRequest): Promise<GetSoundResponse> {
    const group = AudioConfig.getGroup(request.groupID)

    if (!group || group.effects.length === 0) {
      throw new Error(`Could not find group with effects with id ${request.groupID}.`)
    }

    let idsToSkip: EffectID[] = []
    if (request.idsToSkip && request.idsToSkip.length < group.effects.length) {
      idsToSkip = request.idsToSkip
    }

    let effect: SoundEffect
    do {
      const effectIndex = crypto.randomInt(0, group.effects.length)
      effect = group.effects[effectIndex]
    } while (idsToSkip.includes(effect.id))

    const appDataPath = GetAppDataPath() + '/'
    const actualSystemPath = effect.path.replace('aud://', appDataPath)

    const srcFileSizeInMb = await getFileSize(actualSystemPath)
    const useHtml5 = srcFileSizeInMb > html5ThresholdSizeMb

    return {
      soundB64: effect.path,
      format: effect.format as SupportedFileTypes,
      volume: effect.volume,
      effectID: effect.id,
      variant: group.variant,
      useHtml5
    }
  },
  /**
   * @inheritdoc
   */
  AddEffect: function (request: AddEffectRequest): AddEffectResponse {
    const matchingGroup = AudioConfig.getGroup(request.groupID)
    if (!matchingGroup) {
      throw new Error(`Could not find matching group with ID ${request.groupID}.`)
    }

    if (!isSourceGroup(matchingGroup)) {
      throw new Error(`Group ${request.groupID} is not a source effect`)
    }

    const pathExt = path.parse(request.effectPath).ext

    const uuid = crypto.randomUUID()
    const newEffectID: EffectID = `eff-${uuid}`
    const newEffect: SoundEffect = {
      id: newEffectID,
      path: request.effectPath,
      format: pathExt as SupportedFileTypes,
      volume: request.effectVolume
    }

    const newConfig = produce(AudioConfig.Config, (draft) => {
      const matchingBoard = draft.boards.find((b) => b.id === request.boardID)
      const matchingGroup = matchingBoard?.groups.find(
        (g) => isSourceGroup(g) && g.id === request.groupID
      ) as SoundGroupSource | undefined

      matchingGroup?.effects.push(newEffect)
    })

    AudioConfig.Config = newConfig

    return {
      effect: newEffect
    }
  },
  LinkGroup: function (request: LinkRequest): LinkResponse {
    const matchingGroup = AudioConfig.getGroup(request.sourceGroup)
    if (!matchingGroup) {
      throw new Error(`Could not find matching group with ID ${request.sourceGroup}.`)
    }

    const matchingSourceBoard = AudioConfig.getBoard(request.sourceBoard)
    if (!matchingSourceBoard) {
      throw new Error(`Could not find matching board with ID ${request.sourceBoard}.`)
    }

    const matchingDestinationBoard = AudioConfig.getBoard(request.destinationBoard)
    if (!matchingDestinationBoard) {
      throw new Error(`Could not find matching board with ID ${request.destinationBoard}.`)
    }

    // Already has this group. Don't copy it again.
    if (
      matchingDestinationBoard.groups.some(
        (g) => g.type === 'reference' && g.id === matchingGroup.id
      )
    ) {
      return {}
    }

    const newConfig = produce(AudioConfig.Config, (draft) => {
      const destinationBoard = draft.boards.find((b) => b.id === request.destinationBoard)
      if (!destinationBoard) {
        return draft
      }

      destinationBoard.groups.push({
        type: 'reference',
        boardID: request.sourceBoard,
        category: destinationBoard.categories[0].id,
        id: request.sourceGroup
      })

      return draft
    })

    AudioConfig.Config = newConfig

    return {}
  },
  UnlinkGroup(request) {
    const matchingGroup = AudioConfig.getGroup(request.sourceGroup)
    if (!matchingGroup) {
      throw new Error(`Could not find matching group with ID ${request.sourceGroup}.`)
    }

    const matchingSourceBoard = AudioConfig.getBoard(request.sourceBoard)
    if (!matchingSourceBoard) {
      throw new Error(`Could not find matching board with ID ${request.sourceBoard}.`)
    }

    const matchingDestinationBoard = AudioConfig.getBoard(request.destinationBoard)
    if (!matchingDestinationBoard) {
      throw new Error(`Could not find matching board with ID ${request.destinationBoard}.`)
    }

    const newConfig = produce(AudioConfig.Config, (draft) => {
      const board = draft.boards.find((b) => b.id === request.sourceBoard)
      if (!board) {
        return draft
      }

      board.groups = board?.groups.filter(
        (r) => r.type !== 'reference' || r.id !== request.sourceGroup
      )
      return draft
    })

    AudioConfig.Config = newConfig

    return {}
  }
}
