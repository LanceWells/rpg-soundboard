import path from 'node:path'
import * as fs from 'node:fs'
import { GetAppDataPath } from './paths'

/**
 * A helper class used to store information about some API in a config file.
 *
 * The config file is stored in the user's "app data" directory in minified JSON format. On
 * instantiation, will retrieve the stored relevant file if one exists. If the file does not exist,
 * this class will create a new, empty config as defined in the constructor.
 *
 * @template T Refers to the type of the structure that is stored by this configuration.
 */
export abstract class ConfigStorage<T> {
  private _config: T
  private _configPath: string

  /**
   * Creates a new instance of a {@link ConfigStorage}.
   *
   * @param configKey Refers to an identifier for this config. Should be unique to the project. This
   * is primarily used to name the config file as it is stored in the app directory folder.
   *
   * @param defaultConfig The default value to provide for the configuration, if no config file was
   * found.
   */
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
      this.Config = defaultConfig
    }
  }

  /**
   * {WHEN GETTING} -Gets the config, as it is currently stored.
   */
  get Config(): T {
    return this._config
  }

  /**
   * {WHEN SETTING} - Sets the config. Will store the config to disk.
   */
  set Config(config: T) {
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
