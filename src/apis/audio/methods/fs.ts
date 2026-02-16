import path from 'node:path'
import { GetAppDataPath } from '../../../utils/paths'
import fs from 'node:fs'
import { SupportedFileTypes } from '../supportedFileTypes'
import { GroupID } from '../types/groups'

export const getGroupPath = (groupID: GroupID): string => {
  const appDataPath = GetAppDataPath()
  const grpDir = path.join(appDataPath, 'board-data', groupID)

  return grpDir
}

export const getGroupEffectsPath = (groupID: GroupID): string => {
  const effDir = path.join(getGroupPath(groupID), 'effects')

  return effDir
}

export const saveSoundEffect = (
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

  const dstFileDir = getGroupPath(groupID)
  if (!fs.existsSync(dstFileDir)) {
    fs.mkdirSync(dstFileDir, { recursive: true })
  }

  const contents = new Set(fs.readdirSync(dstFileDir))

  let fNameID = 1
  while (contents.has(`${fNameID}${srcFileData.ext}`)) {
    fNameID++
  }

  const fName = `${fNameID}${srcFileData.ext}`

  const dstFilePath = path.format({
    dir: dstFileDir,
    base: `${fName}`
  })

  const auxDirPath = path.join('board-data', groupID)
  const auxFilePath = path.format({
    dir: auxDirPath,
    base: `${fName}`
  })

  // Windows paths don't seem to work with the net methods. That also means that we need to prepend
  // our protocol late, and not using node:path.
  const auxDirPathPosix = auxFilePath.replaceAll(path.sep, path.posix.sep).replaceAll(' ', '_')
  const auxPathWithProtocol = `aud://${auxDirPathPosix}`

  fs.copyFileSync(srcFilePath, dstFilePath)

  return { path: auxPathWithProtocol, format: srcFileData.ext as SupportedFileTypes }
}

export const deleteFile = (pathToDelete: string) => {
  const appDataPath = GetAppDataPath()
  const litPath = path.join(appDataPath, pathToDelete.replace('aud://', ''))

  if (!litPath.startsWith(appDataPath)) {
    console.error(`Attempt to delete a file outside of app directory (${litPath})`)
    return
  }

  if (!fs.existsSync(litPath)) {
    console.error(`Attempt to delete a file that does not exist (${litPath})`)
    return
  }

  fs.rmSync(litPath)
}

export const deleteGroupFolder = (groupID: GroupID) => {
  const groupPath = getGroupPath(groupID)

  if (!fs.existsSync(groupPath)) {
    console.error(`Attempt to delete a folder that does not exist (${groupPath})`)
    return
  }

  fs.rmSync(groupPath, {
    recursive: true,
    force: true
  })
}

export const copyGroupFolder = (oldGroupID: GroupID, newGroupID: GroupID) => {
  const oldGroupPath = getGroupPath(oldGroupID)
  if (!fs.existsSync(oldGroupPath)) {
    console.error(`Attempt to copy from a folder that does not exist (${oldGroupPath})`)
    return
  }

  const newGroupPath = getGroupPath(newGroupID)
  if (fs.existsSync(newGroupPath)) {
    console.error(`Attempt to copy to a folder that already exists (${newGroupPath})`)
    return
  }

  fs.cpSync(oldGroupPath, newGroupPath, {
    recursive: true,
    force: true
  })
}

export async function getFileSize(path: string): Promise<number> {
  const srcFileStats = await fs.promises.stat(path)
  const srcFileSizeInBytes = srcFileStats.size
  const srcFileSizeInMb = srcFileSizeInBytes / (1024 * 1024)

  return srcFileSizeInMb
}
