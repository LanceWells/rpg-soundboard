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
  SoundBoard,
  SoundEffect,
  SoundGroup
} from './interface'
import { ConfigStorage } from '../../utils/configStorage'
import crypto, { randomInt } from 'node:crypto'
import { produce } from 'immer'
import fs from 'node:fs'
import path from 'node:path'
import { GetAppDataPath, GetCwd } from '../../utils/paths'
import { Howl } from 'howler'

const config: ConfigStorage<AudioApiConfig> = new ConfigStorage('audio', {
  boards: []
})

const allGroups = config.Config.boards.flatMap((b) => b.groups)
const boardMap = new Map(config.Config.boards.map((b) => [b.id, b]))
const groupMap = new Map(allGroups.map((g) => [g.id, g]))

export const SupportedFileTypes = [
  '.mp3',
  '.mpeg',
  '.opus',
  '.ogg',
  '.oga',
  '.wav',
  '.aac',
  '.caf',
  '.m4a',
  '.mp4',
  '.weba',
  '.webm',
  '.dolby',
  '.flac'
]

const saveSoundEffect = (boardID: BoardID, groupID: GroupID, srcFilePath: string): string => {
  const appDataPath = GetAppDataPath()

  if (!fs.existsSync(srcFilePath)) {
    throw new Error(`Path does not exist ${srcFilePath}`)
  }

  const srcFileData = path.parse(srcFilePath)

  if (!SupportedFileTypes.includes(srcFileData.ext)) {
    throw new Error(`Unsupported file type ${srcFileData.ext}`)
  }

  const dstFileDir = path.join(appDataPath, boardID, groupID, 'effects')
  if (!fs.existsSync(dstFileDir)) {
    fs.mkdirSync(dstFileDir, { recursive: true })
  }

  const dstFilePath = path.format({
    dir: dstFileDir,
    base: srcFileData.base
  })

  // const cwd = GetCwd()

  fs.copyFileSync(srcFilePath, dstFilePath)

  return dstFilePath
}

export const audioApi: IAudioApi = {
  CreateGroup: function (request: CreateGroupRequest): CreateGroupResponse {
    const matchingBoard = this.GetBoard({ boardID: request.boardID })
    if (!matchingBoard) {
      throw new Error(`Could not find matching board with ID ${request.boardID}.`)
    }

    const newGroupID: GroupID = `grp-${crypto.randomUUID()}`
    const newEffectID: EffectID = `eff-${crypto.randomUUID()}`

    const savedFilePath = saveSoundEffect(request.boardID, newGroupID, request.soundFilePath)

    const newEffect: SoundEffect = {
      id: newEffectID,
      path: savedFilePath
    }

    const newGroup: SoundGroup = {
      effects: [newEffect],
      id: newGroupID,
      name: request.name,
      icon: request.icon
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

    const uuid = crypto.randomUUID()
    const newEffectID: EffectID = `eff-${uuid}`
    const newEffect: SoundEffect = {
      id: newEffectID,
      path: request.effectPath
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
  async PlayGroup(request) {
    const group = groupMap.get(request.groupID)
    if (!group || group.effects.length === 0) {
      return {
        soundB64: ''
      }
    }

    const effectIndex = group.effects.length > 1 ? crypto.randomInt(0, group.effects.length - 1) : 0
    const effect = group.effects[effectIndex]
    // const relPath = path.relative(request.relFile, effect.path)
    // const encodedPath = encodeFilePath(effect.path)

    // const p = path.resolve('.')
    // console.log(p)

    // const reader = new FileReader()

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
    console.log(r)

    return {
      soundB64: r?.toString() ?? ''
    }

    // const audioCtx = new AudioContext()
    // const arrayBuffer = audioCtx.createBuffer(2, audioCtx.sampleRate * 3, audioCtx.sampleRate)

    // const dest = fs.createWriteStream(effect.path)
    // const file = await fs.promises.readFile(effect.path)
    // reader.readAsDataURL(dest.)

    // return {
    //   soundB64: effect.path
    // }

    // const fileData = await fs.promises.readFile(effect.path, { encoding: 'base64' })
    // return {
    //   soundB64: fileData
    // }

    // const sound = new Howl({
    //   src: effect.path
    // })

    // sound.play()

    // return {}
  }
}

// export function encodeFilePath(path: string) {
//   return `file://${encodeURIComponent(path)
//     .replace(/(%2F)|(%5C)/g, '/')
//     .replace(/%3A/g, ':')}`
// }
