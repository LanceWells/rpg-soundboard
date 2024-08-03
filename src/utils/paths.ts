import path from 'node:path'

export function GetAppDataPath(): string {
  const appDataPath =
    process.env.APPDATA ||
    (process.platform == 'darwin'
      ? process.env.HOME + '/Library/Preferences'
      : process.env.HOME + '/.local/share')

  return path.join(appDataPath, 'rpg-soundboard')
}

export function GetCwd(): string {
  return process.env.PWD ?? ''
}
