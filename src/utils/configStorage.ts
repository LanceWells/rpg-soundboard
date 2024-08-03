import path from 'node:path'
import * as fs from 'node:fs'
import { GetAppDataPath } from './paths'

export class ConfigStorage<T> {
  private _config: T
  private _configPath: string

  constructor(configKey: string, defaultConfig: T) {
    const appDataPath = GetAppDataPath()

    if (!fs.existsSync(appDataPath)) {
      fs.mkdirSync(appDataPath)
    }

    this._configPath = path.join(appDataPath, `${configKey}.json`)

    const loadedConfig = this._loadConfig()

    if (loadedConfig !== null) {
      this._config = loadedConfig
    } else {
      this._config = defaultConfig
      this.UpdateConfig(defaultConfig)
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
      if (!fs.existsSync(this._configPath)) {
        return null
      }
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
