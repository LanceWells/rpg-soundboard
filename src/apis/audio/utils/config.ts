import { ConfigStorage } from '../../../utils/configStorage'
import { AudioApiConfig } from '../interface'
import { BoardID } from '../types/boards'
import { GroupID } from '../types/groups'
import { SoundBoard, SoundGroup } from '../types/items'

/**
 * An instantiation of the config for information related to this audio API.
 */
export class AudioConfigStorage extends ConfigStorage<AudioApiConfig> {
  private _boardMap: Map<BoardID, SoundBoard>
  private _groupMap: Map<GroupID, SoundGroup>

  /**
   * @inheritdoc
   */
  constructor() {
    super('audio', { boards: [] })

    this._boardMap = new Map()
    this._groupMap = new Map()

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

  private _reloadMaps() {
    this._boardMap.clear()
    this._groupMap.clear()

    this.Config.boards.forEach((b) => {
      this._boardMap.set(b.id, b)
      b.groups.forEach((g) => {
        this._groupMap.set(g.id, g)
      })
    })
  }
}

export const AudioConfig = new AudioConfigStorage()
