import type { GroupID } from 'src/apis/audio/types/groups'
import type { CategoryID } from 'src/apis/audio/types/categories'

/**
 * A type predicate used to assert that a given ID is a group ID.
 * @param id The ID to check.
 * @returns True if the ID is a group ID.
 */
export function IdIsGroup(id: string): id is GroupID {
  if (!id) {
    return false
  }

  if (id.startsWith('grp-')) {
    return true
  }
  return false
}

/**
 * A type predicate used to assert that a given ID is a Category ID.
 * @param id The ID to check.
 * @returns True if the ID is a category ID.
 */
export function IdIsCategory(id: string): id is CategoryID {
  if (!id) {
    return false
  }

  if (id.startsWith('cat')) {
    return true
  }

  return false
}
