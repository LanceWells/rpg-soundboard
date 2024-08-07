import {
  AddEffectToGroupRequest,
  AddEffectToGroupResponse,
  AudioApiConfig,
  BoardID,
  CreateBoardRequest,
  CreateBoardResponse,
  CreateGroupRequest,
  CreateGroupResponse,
  EffectID,
  GetAllBoardsRequest,
  GetAllBoardsResponse,
  GetBoardRequest,
  GetBoardResponse,
  GetGroupRequest,
  GetGroupResponse,
  GroupID,
  IAudioApi,
  PreviewSoundResponse,
  ReorderGroupsRequest as MoveGroupRequest,
  ReorderGroupsResponse as MoveGroupResponse,
  SoundBoard,
  SoundEffect,
  SoundGroup
} from './interface'
import { ConfigStorage } from '../../utils/configStorage'
import crypto from 'node:crypto'
import { produce } from 'immer'
import fs from 'node:fs'
import path from 'node:path'
import { GetAppDataPath } from '../../utils/paths'

const config: ConfigStorage<AudioApiConfig> = new ConfigStorage('audio', {
  boards: []
})

const allGroups = config.Config.boards.flatMap((b) => b.groups)
const boardMap = new Map(config.Config.boards.map((b) => [b.id, b]))
const groupMap = new Map(allGroups.map((g) => [g.id, g]))

export const SupportedFileTypes = {
  '.mp3': 0,
  '.mpeg': 1,
  '.opus': 2,
  '.ogg': 3,
  '.oga': 4,
  '.wav': 5,
  '.aac': 6,
  '.caf': 7,
  '.m4a': 8,
  '.mp4': 9,
  '.weba': 10,
  '.webm': 11,
  '.dolby': 12,
  '.flac': 13
}

export type SupportedFileTypes = keyof typeof SupportedFileTypes

const getGroupPath = (boardID: BoardID, groupID: GroupID): string => {
  const appDataPath = GetAppDataPath()
  const effDir = path.join(appDataPath, boardID, groupID)

  return effDir
}

const getGroupEffectsPath = (boardID: BoardID, groupID: GroupID): string => {
  const effDir = path.join(getGroupPath(boardID, groupID), 'effects')

  return effDir
}

const saveSoundEffect = (
  boardID: BoardID,
  groupID: GroupID,
  srcFilePath: string
): { path: string; format: SupportedFileTypes } => {
  if (!fs.existsSync(srcFilePath)) {
    throw new Error(`Path does not exist ${srcFilePath}`)
  }

  const srcFileData = path.parse(srcFilePath)

  if (!Object.keys(SupportedFileTypes).includes(srcFileData.ext)) {
    throw new Error(`Unsupported file type ${srcFileData.ext}`)
  }

  const dstFileDir = getGroupEffectsPath(boardID, groupID)
  if (!fs.existsSync(dstFileDir)) {
    fs.mkdirSync(dstFileDir, { recursive: true })
  }

  const dstFilePath = path.format({
    dir: dstFileDir,
    base: srcFileData.base
  })

  fs.copyFileSync(srcFilePath, dstFilePath)

  return { path: dstFilePath, format: srcFileData.ext as SupportedFileTypes }
}

const deleteFile = (pathToDelete: string) => {
  const appDataPath = GetAppDataPath()

  if (!pathToDelete.startsWith(appDataPath)) {
    console.error(`Attempt to delete a file outside of app directory (${pathToDelete})`)
    return
  }

  if (!fs.existsSync(pathToDelete)) {
    console.error(`Attempt to delete a file that does not exist (${pathToDelete})`)
    return
  }

  fs.rmSync(pathToDelete)
}

const deleteGroupFolder = (boardID: BoardID, groupID: GroupID) => {
  const groupPath = getGroupPath(boardID, groupID)

  if (!fs.existsSync(groupPath)) {
    console.error(`Attempt to delete a folder that does not exist (${groupPath})`)
  }

  fs.rmSync(groupPath, {
    recursive: true,
    force: true
  })
}

export const audioApi: IAudioApi = {
  CreateGroup: function (request: CreateGroupRequest): CreateGroupResponse {
    const matchingBoard = this.GetBoard({ boardID: request.boardID })
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
      repeats: request.repeats
    }

    const newConfig = produce(config.Config, (draft) => {
      const matchingBoard = draft.boards.find((b) => b.id === request.boardID)
      matchingBoard?.groups.push(newGroup)
    })

    config.UpdateConfig(newConfig)
    groupMap.set(newGroupID, newGroup)

    return {
      group: newGroup
    }
  },
  UpdateGroup(request) {
    const matchingGroup = this.GetGroup({ groupID: request.groupID })
    if (!matchingGroup) {
      throw new Error(`Could not find matching grup with ID ${request.groupID}.`)
    }

    const existingEffectMap = new Map(matchingGroup.group?.effects.map((e) => [e.path, e]))
    const newEffects = request.effects.reduce((acc, curr) => {
      // This effect is already saved, so just add it to the list and move on.
      if (existingEffectMap.has(curr.path)) {
        const existingEffect = existingEffectMap.get(curr.path)!
        acc.push(existingEffect)

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

    // const updatedEffects = request.effects.map((eff) => {
    //   const newEffectID: EffectID = `eff-${crypto.randomUUID()}`

    //   if (eff.path.startsWith(appDataPath)) {
    //     const parsedPath = path.parse(eff.path)
    //     const updatedEffect: SoundEffect = {
    //       id: newEffectID,
    //       path: eff.path,
    //       format: parsedPath.ext as SupportedFileTypes,
    //       volume: eff.volume
    //     }

    //     return updatedEffect
    //   }

    //   const savedFile = saveSoundEffect(request.boardID, request.groupID, eff.path)
    //   const newEffect: SoundEffect = {
    //     id: newEffectID,
    //     path: savedFile.path,
    //     format: savedFile.format,
    //     volume: eff.volume
    //   }

    //   return newEffect
    // })

    const updatedGroup: SoundGroup = {
      effects: newEffects,
      id: request.groupID,
      name: request.name,
      icon: request.icon,
      repeats: request.repeats
    }

    const newConfig = produce(config.Config, (draft) => {
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

    config.UpdateConfig(newConfig)
    groupMap.set(request.groupID, updatedGroup)

    return {
      group: updatedGroup
    }
  },
  CreateBoard: function (request: CreateBoardRequest): CreateBoardResponse {
    const uuid = crypto.randomUUID()
    const newBoardID: BoardID = `brd-${uuid}`
    const newBoard: SoundBoard = {
      groups: [],
      id: newBoardID,
      name: request.name
    }

    const newConfig = produce(config.Config, (draft) => {
      draft.boards.push(newBoard)
    })

    config.UpdateConfig(newConfig)
    boardMap.set(newBoardID, newBoard)

    return {
      board: newBoard
    }
  },
  AddEffectToGroup: function (request: AddEffectToGroupRequest): AddEffectToGroupResponse {
    const matchingGroup = this.GetGroup({ groupID: request.groupID })
    if (!matchingGroup) {
      throw new Error(`Could not find matching board with ID ${request.boardID}.`)
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

    const newConfig = produce(config.Config, (draft) => {
      const matchingBoard = draft.boards.find((b) => b.id === request.boardID)
      const matchingGroup = matchingBoard?.groups.find((g) => g.id === request.groupID)
      matchingGroup?.effects.push(newEffect)
    })

    config.UpdateConfig(newConfig)

    return {
      effect: newEffect
    }
  },
  GetGroup: function (request: GetGroupRequest): GetGroupResponse {
    const matchingGroup = groupMap.get(request.groupID)
    return {
      group: matchingGroup
    }
  },
  GetBoard: function (request: GetBoardRequest): GetBoardResponse {
    const matchingBoard = boardMap.get(request.boardID)
    return {
      board: matchingBoard
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  GetAllBoards: function (_request: GetAllBoardsRequest): GetAllBoardsResponse {
    return {
      boards: config.Config.boards
    }
  },
  async GetGroupSound(request) {
    const group = groupMap.get(request.groupID)
    if (!group || group.effects.length === 0) {
      return {
        soundB64: '',
        format: '.mp3',
        volume: 100,
        repeats: false
      }
    }

    const effectIndex = crypto.randomInt(0, group.effects.length)
    const effect = group.effects[effectIndex]

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
      repeats: group.repeats
    }
  },
  async PreviewSound(request): Promise<PreviewSoundResponse> {
    const reader = new FileReader()
    const file = fs.readFileSync(request.effect.path)
    const blob = new Blob([file.buffer])

    reader.readAsDataURL(blob)
    await new Promise<void>((resolve) => {
      reader.addEventListener('load', () => {
        resolve()
      })
    })

    const r = reader.result

    const srcFileData = path.parse(request.effect.path)

    return {
      format: srcFileData.ext as SupportedFileTypes,
      soundB64: r?.toString() ?? '',
      volume: request.effect.volume
    }
  },
  ReorderGroups: function (request: MoveGroupRequest): MoveGroupResponse {
    const board = boardMap.get(request.boardID)

    if (!board) {
      console.error(`${this.ReorderGroups.name}: board not found with id (${request.boardID})`)
      return {}
    }

    if (request.newOrder.length !== board.groups.length) {
      console.error(
        `${this.ReorderGroups.name}: new order is (${request.newOrder.length}) which does not match (${board.groups.length})`
      )
      return {}
    }

    const groupsInNewOrder = request.newOrder.map((g) => {
      const group = groupMap.get(g)
      if (group === undefined) {
        throw new Error(`Provided invalid group ID ${g}`)
      }
      return group
    })

    const newConfig = produce(config.Config, (draft) => {
      const matchingBoard = draft.boards.find((b) => b.id === request.boardID)
      matchingBoard!.groups = groupsInNewOrder
    })

    board.groups = groupsInNewOrder
    config.UpdateConfig(newConfig)

    return {}
  },
  DeleteGroup(request) {
    // Get the board for this group in the map.
    // Remove the group from that board.
    const boardFromMap = [...boardMap.values()].find((b) =>
      b.groups.some((g) => g.id === request.groupID)
    )

    const boardID = boardFromMap?.id

    if (boardFromMap) {
      boardFromMap.groups = boardFromMap.groups.filter((g) => g.id !== request.groupID)
    }

    // Delete the group from the group map.
    groupMap.delete(request.groupID)

    // Edit the config so that the appropriate board does not include the group to delete.
    const newConfig = produce(config.Config, (draft) => {
      if (boardFromMap) {
        const boardFromConfig = draft.boards.find((b) => b.id === boardFromMap.id)

        if (boardFromConfig) {
          boardFromConfig.groups = boardFromConfig.groups.filter((g) => g.id !== request.groupID)
        }
      }
    })

    config.UpdateConfig(newConfig)

    if (boardID) {
      deleteGroupFolder(boardID, request.groupID)
    }

    return {}
  }
}
