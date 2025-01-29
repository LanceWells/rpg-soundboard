import { produce } from 'immer'
import { ConfigMigrations, MigratableConfigStorage } from '../../../utils/migratableConfigStorage'
import { AudioApiConfig } from '../interface'
import { BoardID } from '../types/boards'
import { CategoryID } from '../types/categories'
import { GroupID } from '../types/groups'
import { SoundBoard, SoundCategory, SoundGroup } from '../types/items'

/**
 * An instantiation of the config for information related to this audio API.
 */
export class AudioConfigStorage extends MigratableConfigStorage<AudioApiConfig> {
  getMigrations(): ConfigMigrations {
    return [
      {
        version: 1,
        fn: (inConfig: unknown) => {
          console.log(inConfig)
          const outConfig = produce(inConfig as AudioApiConfig, (draft) => {
            draft.boards.forEach((b) => {
              if (!b.categories || b.categories.length === 0) {
                const newCategoryID: CategoryID = `cat-${crypto.randomUUID()}`
                const newCategory: SoundCategory = {
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
          })

          return outConfig
        }
      },
      {
        version: 2,
        fn: (inConfig: unknown) => {
          console.log(inConfig)
          const outConfig = produce(inConfig as AudioApiConfig, (draft) => {
            draft.boards.forEach((b) => {
              if (b.references === undefined) {
                b.references = []
              }
            })
          })

          return outConfig
        }
      }
    ]
  }

  private _boardMap: Map<BoardID, SoundBoard>
  private _groupMap: Map<GroupID, SoundGroup>
  private _categoryMap: Map<CategoryID, SoundCategory>

  /**
   * @inheritdoc
   */
  constructor() {
    super('audio', { boards: [], version: 2 })

    this._boardMap = new Map()
    this._groupMap = new Map()
    this._categoryMap = new Map()

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
   * Gets a board using the provided ID.
   * @param boardID The ID for the board to fetch from the stored configuration object.
   * @returns The board whose ID matches, if one was found. Otherwise, `undefined`.
   */
  getBoard(boardID: BoardID): SoundBoard | undefined {
    return this._boardMap.get(boardID)
  }

  /**
   * Gets a group using the provided ID.
   * @param boardID The ID for the group to fetch from the stored configuration object.
   * @returns The group whose ID matches, if one was found. Otherwise, `undefined`.
   */
  getGroup(groupID: GroupID): SoundGroup | undefined {
    return this._groupMap.get(groupID)
  }

  getCategory(categoryID: CategoryID): SoundCategory | undefined {
    return this._categoryMap.get(categoryID)
  }

  private _reloadMaps() {
    this._boardMap.clear()
    this._groupMap.clear()
    this._categoryMap.clear()

    this.Config.boards.forEach((b: SoundBoard) => {
      this._boardMap.set(b.id, b)
      b.groups.forEach((g) => {
        this._groupMap.set(g.id, g)
      })
      b.categories?.forEach((c) => {
        this._categoryMap.set(c.id, c)
      })
    })
  }
}

export const AudioConfig = new AudioConfigStorage()
