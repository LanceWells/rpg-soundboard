import { app } from 'electron'
import path from 'node:path'
import * as fs from 'node:fs'

export class ConfigStorage<T> {
  private _config: T
  private _configPath: string

  constructor(configKey: string, defaultConfig: T) {
    const appDataPath = app.getPath('appData')
    this._configPath = path.join(appDataPath, `${configKey}.json`)

    const loadedConfig = this._loadConfig()
    if (loadedConfig !== null) {
      this._config = loadedConfig
    } else {
      this._config = defaultConfig
    }
  }

  get Config(): T {
    return this._config
  }

  UpdateConfig(config: T): void {
    this._config = config
    try {
      const configStr = JSON.stringify(config)
      fs.writeFileSync(this._configPath, configStr, { encoding: 'utf-8' })
    } catch (err) {
      console.error(err)
    }
  }

  private _loadConfig(): T | null {
    try {
      const configBuffer = fs.readFileSync(this._configPath)
      const configStr = configBuffer.toString('utf-8')
      const parsedConfig = JSON.parse(configStr)

      return parsedConfig
    } catch (err) {
      console.error(err)
    }

    return null
  }
}
