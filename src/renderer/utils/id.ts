import type { GroupID } from 'src/apis/audio/types/groups'

/**
 * A type predicate used to assert that a given ID is a group ID.
 * @param id The ID to check.
 * @returns True if the ID is a group ID.
 */
export function IdIsGroup(id: unknown): id is GroupID {
  if (!id) {
    return false
  }

  if (typeof id !== 'string') {
    return false
  }

  if (id.startsWith('grp-')) {
    return true
  }
  return false
}
