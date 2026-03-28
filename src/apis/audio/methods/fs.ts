import path from 'node:path'
import { GetAppDataPath } from '../../../utils/paths'
import fs from 'node:fs'
import { SupportedFileTypes } from '../supportedFileTypes'
import { GroupID } from '../types/groups'

/**
 * Returns the filesystem path to the directory where audio files for a given group are stored.
 * @param groupID The ID of the group.
 */
export const getGroupPath = (groupID: GroupID): string => {
  const appDataPath = GetAppDataPath()
  const grpDir = path.join(appDataPath, 'board-data', groupID)

  return grpDir
}

/**
 * Copies a sound effect file into the app data directory for the given group, assigning it a
 * numeric filename to avoid collisions. Returns the `aud://` protocol path and file format.
 * @param groupID The ID of the group that will own this sound effect.
 * @param srcFilePath The absolute path to the source file to copy.
 * @throws If the source file does not exist or its extension is not in {@link SupportedFileTypes}.
 */
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

/**
 * Deletes a file referenced by an `aud://` protocol path. Includes a path-traversal guard — if
 * the resolved path falls outside the app data directory, the deletion is aborted and an error
 * is logged instead of thrown.
 * @param pathToDelete The `aud://` path of the file to delete.
 */
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

/**
 * Returns the size of the file at the given path, in megabytes.
 * @param path The absolute filesystem path to the file.
 */
export async function getFileSize(path: string): Promise<number> {
  const srcFileStats = await fs.promises.stat(path)
  const srcFileSizeInBytes = srcFileStats.size
  const srcFileSizeInMb = srcFileSizeInBytes / (1024 * 1024)

  return srcFileSizeInMb
}
