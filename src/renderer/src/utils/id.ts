import { CategoryID, GroupID } from 'src/apis/audio/interface'

export function IdIsGroup(id: string): id is GroupID {
  if (id.startsWith('grp-')) {
    return true
  }
  return false
}

export function IdIsCategory(id: string): id is CategoryID {
  if (id.startsWith('cat')) {
    return true
  }

  return false
}
