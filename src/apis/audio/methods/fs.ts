import path from 'node:path'
import { GetAppDataPath } from '../../../utils/paths'
import fs from 'node:fs'
import { BoardID, GroupID } from '../interface'
import { SupportedFileTypes } from '../supportedFileTypes'

export const getBoardPath = (boardID: BoardID): string => {
  const appDataPath = GetAppDataPath()
  const boardDir = path.join(appDataPath, 'board-data', boardID)

  return boardDir
}

export const getGroupPath = (boardID: BoardID, groupID: GroupID): string => {
  const appDataPath = GetAppDataPath()
  const effDir = path.join(appDataPath, 'board-data', boardID, groupID)

  return effDir
}

export const getGroupEffectsPath = (boardID: BoardID, groupID: GroupID): string => {
  const effDir = path.join(getGroupPath(boardID, groupID), 'effects')

  return effDir
}

export const saveSoundEffect = (
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

export const deleteFile = (pathToDelete: string) => {
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

export const deleteGroupFolder = (boardID: BoardID, groupID: GroupID) => {
  const groupPath = getGroupPath(boardID, groupID)

  if (!fs.existsSync(groupPath)) {
    console.error(`Attempt to delete a folder that does not exist (${groupPath})`)
  }

  fs.rmSync(groupPath, {
    recursive: true,
    force: true
  })
}

export const deleteBoardFolder = (boardID: BoardID) => {
  const boardPath = getBoardPath(boardID)

  if (!fs.existsSync(boardPath)) {
    console.error(`Attempt to delete a folder that does not exist (${boardPath})`)
  }

  fs.rmSync(boardPath, {
    recursive: true,
    force: true
  })
}
