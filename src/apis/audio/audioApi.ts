import {
  AddEffectToGroupRequest,
  AddEffectToGroupResponse,
  AudioApiConfig,
  BoardID,
  CategoryID,
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
  SoundBoard,
  SoundCategory,
  SoundEffect,
  SoundGroup
} from './interface'
import { ConfigStorage } from '../../utils/configStorage'
import crypto from 'node:crypto'
import { produce } from 'immer'
import fs from 'node:fs'
import path from 'node:path'
import { GetAppDataPath } from '../../utils/paths'
import { SupportedFileTypes } from './supportedFileTypes'

/**
 * An instantiation of the config for information related to this audio API.
 */
const config: ConfigStorage<AudioApiConfig> = new ConfigStorage('audio', {
  boards: []
})

const allGroups = config.Config.boards.flatMap((b) => b.groups)
const boardMap = new Map(config.Config.boards.map((b) => [b.id, b]))
const groupMap = new Map(allGroups.map((g) => [g.id, g]))

const getBoardPath = (boardID: BoardID): string => {
  const appDataPath = GetAppDataPath()
  const boardDir = path.join(appDataPath, 'board-data', boardID)

  return boardDir
}

const getGroupPath = (boardID: BoardID, groupID: GroupID): string => {
  const appDataPath = GetAppDataPath()
  const effDir = path.join(appDataPath, 'board-data', boardID, groupID)

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

const deleteBoardFolder = (boardID: BoardID) => {
  const boardPath = getBoardPath(boardID)

  if (!fs.existsSync(boardPath)) {
    console.error(`Attempt to delete a folder that does not exist (${boardPath})`)
  }

  fs.rmSync(boardPath, {
    recursive: true,
    force: true
  })
}

const SaveConfig = (newConfig: AudioApiConfig) => {
  boardMap.clear()
  groupMap.clear()

  newConfig.boards.forEach((b) => {
    boardMap.set(b.id, b)
    b.groups.forEach((g) => {
      groupMap.set(g.id, g)
    })
  })

  config.Config = newConfig
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
      variant: request.variant
      // repeats: request.repeats,
      // fadeIn: request.fadeIn,
      // fadeOut: request.fadeOut
    }

    const newConfig = produce(config.Config, (draft) => {
      const matchingBoard = draft.boards.find((b) => b.id === request.boardID)
      matchingBoard?.groups.push(newGroup)
    })

    SaveConfig(newConfig)

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
      // repeats: request.repeats,
      // fadeIn: request.fadeIn,
      // fadeOut: request.fadeOut,
      category: request.category
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

    SaveConfig(newConfig)

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

    SaveConfig(newConfig)

    return {
      board: newBoard
    }
  },
  UpdateBoard(request) {
    const matchingBoard = this.GetBoard({ boardID: request.boardID })
    if (!matchingBoard.board) {
      throw new Error(`Could not find matching board with ID ${request.boardID}.`)
    }

    const newConfig = produce(config.Config, (draft) => {
      const matchingBoard = draft.boards.find((b) => b.id === request.boardID)
      if (matchingBoard) {
        matchingBoard.name = request.fields.name
      }
    })

    SaveConfig(newConfig)

    const updatedBoard = this.GetBoard({ boardID: request.boardID })

    return {
      board: updatedBoard.board!
    }
  },
  DeleteBoard(request) {
    const matchingBoard = this.GetBoard({ boardID: request.boardID })
    if (matchingBoard.board === undefined) {
      throw new Error(`Could not find matching board with ID ${request.boardID}.`)
    }

    const newConfig = produce(config.Config, (draft) => {
      draft.boards = draft.boards.filter((b) => b.id !== matchingBoard.board?.id)
    })

    SaveConfig(newConfig)

    deleteBoardFolder(request.boardID)

    return {}
  },
  AddEffectToGroup: function (request: AddEffectToGroupRequest): AddEffectToGroupResponse {
    const matchingGroup = this.GetGroup({ groupID: request.groupID })
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

    const newConfig = produce(config.Config, (draft) => {
      const matchingBoard = draft.boards.find((b) => b.id === request.boardID)
      const matchingGroup = matchingBoard?.groups.find((g) => g.id === request.groupID)
      matchingGroup?.effects.push(newEffect)
    })

    SaveConfig(newConfig)

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
      // repeats: group.repeats,
      // fadeIn: group?.fadeIn ?? false,
      // fadeOut: group?.fadeOut ?? false
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
  ReorderGroups: function (request) {
    const nocategoryid = 'nocategory' as const
    const board = boardMap.get(request.boardID)

    if (!board) {
      console.error(`${this.ReorderGroups.name}: board not found with id (${request.boardID})`)
      return {}
    }

    if (request.category && !board.categories?.map((c) => c.id).includes(request.category)) {
      console.error(`${this.ReorderGroups.name}: category not found with id (${request.category})`)
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
      console.error(`${this.ReorderGroups.name}: invalid category ${thisCategoryID}`)
      return {}
    }

    if (request.newOrder.length !== thisCategoryGroups!.length) {
      console.error(
        `${this.ReorderGroups.name}: new order is (${request.newOrder.length}) which does not match (${board.groups.length})`
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

    const newConfig = produce(config.Config, (draft) => {
      const matchingBoard = draft.boards.find((b) => b.id === request.boardID)
      matchingBoard!.groups = groupsInNewOrder
    })

    SaveConfig(newConfig)

    return {}
  },
  DeleteGroup(request) {
    // Get the board for this group in the map.
    // Remove the group from that board.
    const boardFromMap = [...boardMap.values()].find((b) =>
      b.groups.some((g) => g.id === request.groupID)
    )

    const boardID = boardFromMap?.id

    // Edit the config so that the appropriate board does not include the group to delete.
    const newConfig = produce(config.Config, (draft) => {
      if (boardFromMap) {
        const boardFromConfig = draft.boards.find((b) => b.id === boardFromMap.id)

        if (boardFromConfig) {
          boardFromConfig.groups = boardFromConfig.groups.filter((g) => g.id !== request.groupID)
        }
      }
    })

    SaveConfig(newConfig)

    if (boardID) {
      deleteGroupFolder(boardID, request.groupID)
    }

    return {}
  },
  CreateCategory(request) {
    const { boardID, ...categoryFields } = request

    const board = this.GetBoard({ boardID: request.boardID })

    if (!board) {
      throw new Error(`${this.ReorderGroups.name}: board not found with id (${request.boardID})`)
    }

    const newCategoryID: CategoryID = `cat-${crypto.randomUUID()}`
    const newCategory: SoundCategory = {
      id: newCategoryID,
      ...categoryFields
    }

    const newConfig = produce(config.Config, (draft) => {
      const matchingBoard = draft.boards.find((b) => b.id === boardID)
      if (!matchingBoard) {
        return
      }

      if (!matchingBoard.categories) {
        matchingBoard.categories = []
      }

      matchingBoard.categories.push(newCategory)
    })

    SaveConfig(newConfig)

    return {
      category: newCategory
    }
  },
  DeleteCategory(request) {
    const matchingBoard = this.GetBoard({ boardID: request.boardID })
    if (matchingBoard.board === undefined) {
      throw new Error(`Could not find matching board with ID ${request.boardID}.`)
    }

    const newConfig = produce(config.Config, (draft) => {
      const matchingBoard = draft.boards.find((b) => b.id === request.boardID)
      if (!matchingBoard?.categories) {
        return
      }

      matchingBoard.categories = matchingBoard.categories.filter((c) => c.id !== request.categoryID)
      matchingBoard.groups.forEach((g) => {
        if (g.category === request.categoryID) {
          g.category = undefined
        }
      })
    })

    SaveConfig(newConfig)

    return {}
  },
  UpdateCategory(request) {
    const { boardID, categoryID, ...categoryFields } = request

    const matchingBoard = this.GetBoard({ boardID: boardID })
    if (matchingBoard.board === undefined) {
      throw new Error(`Could not find matching board with ID ${boardID}.`)
    }

    const updatedCategory: SoundCategory = {
      id: categoryID,
      ...categoryFields
    }

    const newConfig = produce(config.Config, (draft) => {
      const matchingBoard = draft.boards.find((b) => b.id === boardID)
      if (!matchingBoard || !matchingBoard.categories) {
        return
      }

      const newCategories = matchingBoard.categories.map<SoundCategory>((c) => {
        if (c.id === request.categoryID) {
          return updatedCategory
        }

        return c
      })

      matchingBoard.categories = newCategories
    })

    SaveConfig(newConfig)

    return {
      category: updatedCategory
    }
  },
  GetGroupsForCategory(request) {
    const { categoryID } = request

    const matchingBoard = this.GetAllBoards({}).boards.find((b) =>
      (b.categories ?? []).some((c) => c.id === categoryID)
    )

    if (!matchingBoard) {
      return {
        groups: []
      }
    }

    const categoryGroups = matchingBoard.groups.filter((g) => g.category === categoryID)

    return {
      groups: categoryGroups
    }
  },
  GetUncategorizedGroups(request) {
    const { boardID } = request

    const matchingBoard = this.GetBoard({ boardID })
    if (!matchingBoard.board) {
      return {
        groups: []
      }
    }

    const uncategorizedGroups = matchingBoard.board?.groups.filter((g) => g.category === undefined)

    return {
      groups: uncategorizedGroups
    }
  }
}
