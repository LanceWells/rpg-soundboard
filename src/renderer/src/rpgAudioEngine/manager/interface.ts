import { GroupID } from 'src/apis/audio/types/groups'

export interface IRpgAudioManager {
  play(groupID: GroupID): Promise<void>
  stop(groupID: GroupID): void
  playingGroups(): GroupID[]
}
