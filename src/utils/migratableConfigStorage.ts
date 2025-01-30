import { ConfigStorage } from './configStorage'

export interface IMigratableConfig {
  version?: number
}

export type MigrationFn<TIn = unknown, TOut = unknown> = (config: TIn) => TOut

export type ConfigMigration = {
  version: number
  fn: MigrationFn
}

export type ConfigMigrations = ConfigMigration[]

export abstract class MigratableConfigStorage<
  T extends IMigratableConfig
> extends ConfigStorage<T> {
  constructor(configKey: string, defaultConfig: T) {
    super(configKey, defaultConfig)
  }

  abstract getMigrations(): ConfigMigrations

  protected migrateConfig() {
    this.Config = this.migrate()
  }

  private _getOrderedMigrations() {
    const migrations = [...this.getMigrations()].sort((a, b) => a.version - b.version)
    return migrations
  }

  private _orderedMigrations = this._getOrderedMigrations()

  migrate(): T {
    if (this._orderedMigrations.length === 0) {
      return this.Config
    }

    let migratedConfig: T = this.Config
    for (let i = 0; i < this._orderedMigrations.length; i++) {
      const thisMigration = this._orderedMigrations[i]
      if (thisMigration.version > (migratedConfig.version ?? 0)) {
        migratedConfig = thisMigration?.fn(migratedConfig) as T
      }
    }

    return migratedConfig
  }
}
