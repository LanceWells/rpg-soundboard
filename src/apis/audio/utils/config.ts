import { produce } from 'immer'
import { ConfigMigrations, MigratableConfigStorage } from '../../../utils/migratableConfigStorage'
import { AudioApiConfig } from '../interface'
import { GroupID } from '../types/groups'
import { ISoundGroup, SoundGroupSequence, SoundGroupSource } from '../types/items'
import {
  AudioApiConfigV2,
  CategoryID,
  SoundGroupSource as SoundGroupSourceV2,
  SoundGroupSequence as SoundGroupSequenceV2
} from './legacyV2Types'

/**
 * An instantiation of the config for information related to this audio API.
 */
export class AudioConfigStorage extends MigratableConfigStorage<AudioApiConfig> {
  getMigrations(): ConfigMigrations {
    return [
      {
        version: 1,
        fn: (inConfig: unknown) => {
          console.log('Version 1 migration')
          console.log(inConfig)
          const outConfig = produce(inConfig as AudioApiConfig, (draft: any) => {
            draft.boards.forEach((b) => {
              if (!b.categories || b.categories.length === 0) {
                const newCategoryID = `cat-${crypto.randomUUID()}`
                const newCategory = {
                  id: newCategoryID,
                  name: b.name
                }

                b.categories = [newCategory]
              }

              const defaultCategory = b.categories[0].id

              b.groups.forEach((g) => {
                if (!g.category) {
                  g.category = defaultCategory
                }
              })
            })

            draft.version = 1
          })

          return outConfig
        }
      },
      {
        version: 2,
        fn: (inConfig: unknown) => {
          console.log('Version 2 migration')
          const outConfig = produce(inConfig, (draft: any) => {
            draft.boards.forEach((b) => {
              b.groups.forEach((g) => {
                g.type = 'source'
              })
            })

            draft.version = 2

            return draft
          })

          return outConfig
        }
      },
      {
        version: 3,
        fn: (inConfig: unknown) => {
          console.log('Version 3 migration')
          const outConfig: AudioApiConfig = {
            Groups: [],
            version: 3
          }

          const boardNameMap = (inConfig as AudioApiConfigV2).boards.reduce((acc, curr) => {
            curr.groups.forEach((g) => {
              acc.set(g.id, curr.name)
            })
            return acc
          }, new Map<GroupID, string>())

          const categoryNameMap = (inConfig as AudioApiConfigV2).boards
            .flatMap((b) => ({
              groups: b.groups,
              cateogires: b.categories
            }))
            .reduce((acc, curr) => {
              const categories = curr.cateogires.reduce((acc, curr) => {
                acc.set(curr.id, curr.name)
                return acc
              }, new Map<CategoryID, string>())
              curr.groups.forEach((g) => {
                acc.set(g.id, categories.get(g.category)!)
              })

              return acc
            }, new Map<GroupID, string>())

          outConfig.Groups = (inConfig as AudioApiConfigV2).boards
            .flatMap((b) => b.groups)
            .filter((g) => g.type !== 'reference')
            .map<ISoundGroup>((g) => {
              // Redundant, but trying to make the typecheck better.
              if (g.type === 'reference') {
                return {} as ISoundGroup
              }

              const tags: string[] = []
              if (boardNameMap.has(g.id)) {
                tags.push(boardNameMap.get(g.id)!)
              }

              if (categoryNameMap.has(g.id)) {
                tags.push(categoryNameMap.get(g.id)!)
              }

              if (g.type === 'source') {
                const tg = g as SoundGroupSourceV2

                return {
                  effects: tg.effects,
                  id: tg.id,
                  name: tg.name,
                  tags,
                  type: 'source',
                  variant: tg.variant,
                  icon: {
                    type: 'svg',
                    foregroundColor: tg.icon.foregroundColor,
                    name: tg.icon.name
                  }
                } as SoundGroupSource
              } else {
                const tg = g as SoundGroupSequenceV2

                return {
                  icon: {
                    type: 'svg',
                    foregroundColor: tg.icon.foregroundColor,
                    name: tg.icon.name
                  },
                  id: tg.id,
                  name: tg.name,
                  sequence: tg.sequence,
                  tags,
                  type: 'sequence',
                  variant: tg.variant
                } as SoundGroupSequence
              }
            })

          return outConfig
        }
      }
    ]
  }

  private _groupMap: Map<GroupID, ISoundGroup>

  /**
   * @inheritdoc
   */
  constructor() {
    super('audio', { Groups: [], version: 3 })

    this._groupMap = new Map()

    this.migrateConfig()
    this._reloadMaps()
  }

  /**
   * @inheritdoc
   */
  get Config() {
    return super.Config
  }

  /**
   * @inheritdoc
   */
  set Config(newConfig: AudioApiConfig) {
    super.Config = newConfig

    this._reloadMaps()
  }

  /**
   * Gets a group using the provided ID.
   * @param boardID The ID for the group to fetch from the stored configuration object.
   * @returns The group whose ID matches, if one was found. Otherwise, `undefined`.
   */
  getGroup(groupID: GroupID): ISoundGroup | undefined {
    return this._groupMap.get(groupID)
  }

  getAllGroups(): ISoundGroup[] {
    return [...this._groupMap.values()]
  }

  private _reloadMaps() {
    this._groupMap.clear()

    this.Config.Groups.forEach((g) => {
      this._groupMap.set(g.id, g)
    })
  }
}

export const AudioConfig = new AudioConfigStorage()
