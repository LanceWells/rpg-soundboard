import { produce } from 'immer'
import {
  AddEffectToGroupRequest,
  AddEffectToGroupResponse,
  CategoryID,
  CreateGroupRequest,
  CreateGroupResponse,
  DeleteGroupRequest,
  DeleteGroupResponse,
  EffectID,
  GetGroupRequest,
  GetGroupResponse,
  GetGroupSoundRequest,
  GetGroupSoundResponse,
  GroupID,
  Groups,
  ReorderGroupsRequest,
  ReorderGroupsResponse,
  SoundEffect,
  SoundGroup,
  UpdateGroupRequest,
  UpdateGroupResponse
} from '../interface'
import { AudioConfig } from '../utils/config'
import fs from 'node:fs'
import path from 'node:path'
import { deleteFile, deleteGroupFolder, saveSoundEffect } from './fs'
import { BoardsAudioAPI } from './boards'
import crypto from 'node:crypto'
import { SupportedFileTypes } from '../supportedFileTypes'

export const GroupsAudioAPI: Groups = {
  Get: function (request: GetGroupRequest): GetGroupResponse {
    const matchingGroup = AudioConfig.getGroup(request.groupID)
    return {
      group: matchingGroup
    }
  },
  Create: function (request: CreateGroupRequest): CreateGroupResponse {
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

    const newGroup: SoundGroup = {
      effects: newEffects,
      id: newGroupID,
      name: request.name,
      icon: request.icon,
      variant: request.variant
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
  Update: function (request: UpdateGroupRequest): UpdateGroupResponse {
    const matchingGroup = AudioConfig.getGroup(request.groupID)
    if (!matchingGroup) {
      throw new Error(`Could not find matching grup with ID ${request.groupID}.`)
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

    const updatedGroup: SoundGroup = {
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
  Delete: function (request: DeleteGroupRequest): DeleteGroupResponse {
    // Get the board for this group in the map.
    // Remove the group from that board.
    const boardFromMap = [...BoardsAudioAPI.GetAll({}).boards].find((b) =>
      b.groups.some((g) => g.id === request.groupID)
    )

    const boardID = boardFromMap?.id

    // Edit the config so that the appropriate board does not include the group to delete.
    const newConfig = produce(AudioConfig.Config, (draft) => {
      if (boardFromMap) {
        const boardFromConfig = draft.boards.find((b) => b.id === boardFromMap.id)

        if (boardFromConfig) {
          boardFromConfig.groups = boardFromConfig.groups.filter((g) => g.id !== request.groupID)
        }
      }
    })

    AudioConfig.Config = newConfig

    if (boardID) {
      deleteGroupFolder(boardID, request.groupID)
    }

    return {}
  },
  Reorder: function (request: ReorderGroupsRequest): ReorderGroupsResponse {
    const nocategoryid = 'nocategory' as const
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
      if (!curr.category) {
        if (!acc.has(nocategoryid)) {
          acc.set(nocategoryid, [])
        }
        acc.get(nocategoryid)!.push(curr)
        return acc
      }

      if (!acc.has(curr.category)) {
        acc.set(curr.category, [])
      }

      acc.get(curr.category)!.push(curr)
      return acc
    }, new Map<CategoryID | typeof nocategoryid, SoundGroup[]>())

    const thisCategoryID = request['category'] ?? nocategoryid
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

    const getUncategorizedGroupsInOrder = () => {
      const uncategorizedGroups = groupsByCategory.get('nocategory') ?? []
      if (request.category !== undefined) {
        return uncategorizedGroups
      }

      const groupMap = new Map(uncategorizedGroups.map((g) => [g.id, g]))
      const newOrder = request.newOrder
        .map((o) => groupMap.get(o))
        .filter((o) => o !== undefined) as SoundGroup[]

      return newOrder
    }

    const groupsInNewOrder = [
      ...(board.categories?.flatMap((c) => {
        const theseGroups = groupsByCategory.get(c.id) ?? []
        if (request.category !== c.id) {
          return theseGroups
        }

        const groupMap = new Map(theseGroups.map((g) => [g.id, g]))
        const newOrder = request.newOrder
          .map((o) => groupMap.get(o))
          .filter((o) => o !== undefined) as SoundGroup[]

        return newOrder
      }) ?? []),
      ...getUncategorizedGroupsInOrder()
    ]

    const newConfig = produce(AudioConfig.Config, (draft) => {
      const matchingBoard = draft.boards.find((b) => b.id === request.boardID)
      matchingBoard!.groups = groupsInNewOrder
    })

    AudioConfig.Config = newConfig

    return {}
  },
  GetSound: async function (request: GetGroupSoundRequest): Promise<GetGroupSoundResponse> {
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

    const reader = new FileReader()
    const file = fs.readFileSync(effect.path)
    const blob = new Blob([file.buffer])

    reader.readAsDataURL(blob)
    await new Promise<void>((resolve) => {
      reader.addEventListener('load', () => {
        resolve()
      })
    })

    const r = reader.result

    return {
      soundB64: r?.toString() ?? '',
      format: effect.format as SupportedFileTypes,
      volume: effect.volume,
      effectID: effect.id,
      variant: group.variant
    }
  },
  AddEffect: function (request: AddEffectToGroupRequest): AddEffectToGroupResponse {
    const matchingGroup = AudioConfig.getGroup(request.groupID)
    if (!matchingGroup) {
      throw new Error(`Could not find matching group with ID ${request.groupID}.`)
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
      const matchingGroup = matchingBoard?.groups.find((g) => g.id === request.groupID)
      matchingGroup?.effects.push(newEffect)
    })

    AudioConfig.Config = newConfig

    return {
      effect: newEffect
    }
  }
}
