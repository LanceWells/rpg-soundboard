import { IAudioApi } from './interface'
import { BoardsAudioAPI } from './methods/boards'
import { CategoriesAudioAPI } from './methods/categories'
import { GroupsAudioAPI } from './methods/groups'
import { SoundsAudioAPI } from './methods/sounds'

export const audioApi: IAudioApi = {
  Boards: BoardsAudioAPI,
  Categories: CategoriesAudioAPI,
  Groups: GroupsAudioAPI,
  Sounds: SoundsAudioAPI
}
