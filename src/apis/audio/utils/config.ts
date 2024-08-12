import { ConfigStorage } from '../../../utils/configStorage'
import { AudioApiConfig, BoardID, GroupID, SoundBoard, SoundGroup } from '../interface'

/**
 * An instantiation of the config for information related to this audio API.
 */
export class AudioConfigStorage extends ConfigStorage<AudioApiConfig> {
  private _boardMap: Map<BoardID, SoundBoard>
  private _groupMap: Map<GroupID, SoundGroup>

  constructor() {
    super('audio', { boards: [] })

    this._boardMap = new Map()
    this._groupMap = new Map()

    this.ReloadMaps()
  }

  get Config() {
    return super.Config
  }

  set Config(newConfig: AudioApiConfig) {
    super.Config = newConfig

    this.ReloadMaps()
  }

  getBoard(boardID: BoardID): SoundBoard | undefined {
    return this._boardMap.get(boardID)
  }

  getGroup(groupID: GroupID): SoundGroup | undefined {
    return this._groupMap.get(groupID)
  }

  private ReloadMaps() {
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
