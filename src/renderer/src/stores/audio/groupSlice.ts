import { IAudioApi } from 'src/apis/audio/interface'
import { GroupID } from 'src/apis/audio/types/groups'
import {
  ISoundGroup,
  SoundGroupSequence,
  SoundGroupSequenceEditableFields,
  SoundGroupSource,
  SoundGroupSourceEditableFields,
  SoundGroupTypes
} from 'src/apis/audio/types/items'
import { StateCreator } from 'zustand'
import { produce } from 'immer'
import { isSequenceGroup, isSourceGroup } from '@renderer/utils/typePredicates'
import fuse from 'fuse.js'
import { ColorOptions } from '@renderer/components/forms/sound/types'
import { SoundVariants } from 'src/apis/audio/types/soundVariants'

export const SortType = {
  name: 0
}

export type SortType = keyof typeof SortType

export type SortOrder = 'asc' | 'desc'

export type SortVals = {
  type: SortType
  order: SortOrder
}

export type SortFilterVal = {
  sorting?: SortVals
  soundTypes: SoundVariants[]
  search: string
}

export interface GroupSlice {
  groups: ISoundGroup[]
  /**
   * The set of IDs for groups that are actively playing a sound effect.
   */
  playingGroups: GroupID[]
  sorting: SortFilterVal
  getGroup: (groupID: GroupID) => ISoundGroup
  getGroupSource: (groupID: GroupID) => SoundGroupSource
  getGroupSequence: (groupID: GroupID) => SoundGroupSequence
  addGroup: IAudioApi['Groups']['Create']
  addSequence: IAudioApi['Groups']['CreateSequence']
  updateGroup: IAudioApi['Groups']['Update']
  updateGroupPartial: (
    groupID: GroupID,
    updatedFields: Partial<SoundGroupSourceEditableFields>
  ) => void
  updateSequencePartial: (
    groupID: GroupID,
    updatedFields: Partial<SoundGroupSequenceEditableFields>
  ) => void
  deleteGroup: (id: GroupID) => void
  searchForGroups: (searchText: string, types: SoundGroupTypes[]) => void
  // searchForTags: (searchText: string) => void
  soughtGroups: ISoundGroup[]
  // soughtTags: string[]
  getTags: () => Set<string>
  toggleVariantFilter: (variant: SoundVariants) => void
  setSorting: (sorting: SortVals | undefined) => void
  updateSorting: () => void
}

export const createGroupSlice: StateCreator<GroupSlice, [], [], GroupSlice> = (set, get) => ({
  groups: window.audio.Groups.GetAll().groups,
  sorting: {
    order: 'asc',
    soundTypes: [],
    search: ''
  },
  getTags() {
    const allTags = new Set(window.audio.Groups.GetAll().groups.flatMap<string>((g) => g.tags))
    return allTags
  },
  addGroup(req) {
    const newGroup = window.audio.Groups.Create(req)
    get().searchForGroups('', ['sequence', 'source'])
    set({
      groups: window.audio.Groups.GetAll().groups
    })

    return newGroup
  },
  addSequence(req) {
    const newGroup = window.audio.Groups.CreateSequence(req)
    const newGroups = window.audio.Groups.GetAll().groups

    get().searchForGroups('', ['sequence', 'source'])
    set({
      groups: newGroups
    })

    return newGroup
  },
  deleteGroup(id) {
    window.audio.Groups.Delete({
      groupID: id
    })

    get().searchForGroups('', ['sequence', 'source'])

    set({
      groups: window.audio.Groups.GetAll().groups
    })
  },
  getGroup(request) {
    const group = window.audio.Groups.Get({ groupID: request }).group
    if (!group) {
      throw new Error(`Could not find a group with id ${request}`)
    }

    return group
  },
  getGroupSequence(request) {
    const group = window.audio.Groups.Get({ groupID: request }).group
    if (!group) {
      throw new Error(`Could not find a group with id ${request}`)
    }

    if (!isSequenceGroup(group)) {
      throw new Error(`Found a group with id ${request}, but it isn't a sequence type`)
    }

    return group
  },
  getGroupSource(request) {
    const group = window.audio.Groups.Get({ groupID: request }).group
    if (!group) {
      throw new Error(`Could not find a group with id ${request}`)
    }

    if (!isSourceGroup(group)) {
      throw new Error(`Found a group with id ${request}, but it isn't a sequence type`)
    }

    return group
  },
  updateGroup(req) {
    const updatedGroup = window.audio.Groups.Update(req)

    get().searchForGroups('', ['sequence', 'source'])

    set({
      groups: window.audio.Groups.GetAll().groups
    })

    return updatedGroup
  },
  updateGroupPartial(groupID, updatedFields) {
    const currentGroup = window.audio.Groups.Get({
      groupID
    }).group

    if (!currentGroup) {
      return
    }

    const newGroup = produce(currentGroup, (draft) => {
      Object.assign(draft, updatedFields)
    }) as SoundGroupSource

    window.audio.Groups.Update({
      groupID,
      ...newGroup
    })
    get().searchForGroups('', ['sequence', 'source'])

    set({
      groups: window.audio.Groups.GetAll().groups
    })
  },
  updateSequencePartial(groupID, updatedFields) {
    const currentGroup = window.audio.Groups.Get({
      groupID
    }).group

    if (!currentGroup) {
      return
    }

    const newGroup = produce(currentGroup, (draft) => {
      Object.assign(draft, updatedFields)
    }) as SoundGroupSequence

    window.audio.Groups.UpdateSequence({
      groupID,
      ...newGroup
    })
    get().searchForGroups('', ['sequence', 'source'])

    set({
      groups: window.audio.Groups.GetAll().groups
    })
  },
  editingGroup: null,
  editingGroupID: undefined,
  playingGroups: [],
  soughtGroups: [],
  searchForGroups(searchText) {
    set({
      sorting: produce(get().sorting, (draft) => {
        draft.search = searchText
      })
    })

    get().updateSorting()
  },
  setSorting(sorting: SortVals | undefined) {
    set({
      sorting: produce(get().sorting, (draft) => {
        draft.sorting = sorting
      })
    })

    get().updateSorting()
  },
  toggleVariantFilter(variant) {
    set({
      sorting: produce(get().sorting, (draft) => {
        const hasVariant = new Set(draft.soundTypes).has(variant)
        if (!hasVariant) {
          draft.soundTypes.push(variant)
        } else {
          draft.soundTypes = draft.soundTypes.filter((v) => v !== variant)
        }
      })
    })

    get().updateSorting()
  },
  updateSorting() {
    const searchText = get().sorting.search
    const soughtGroups = searchGroups(searchText)

    const sorting = get().sorting
    const filteredGroups = soughtGroups.filter(filterToVariants(sorting.soundTypes))
    const sortedGroups = sorting.sorting
      ? filteredGroups.toSorted(sortGroups(sorting.sorting.order, sorting.sorting.type))
      : filteredGroups

    set({
      soughtGroups: sortedGroups
    })
  }
})

export const getDefaultGroup = (): Omit<SoundGroupSource, 'id'> => ({
  type: 'source',
  effects: [],
  icon: {
    type: 'svg',
    foregroundColor: ColorOptions.white,
    name: 'moon'
  },
  name: '',
  variant: 'Default',
  tags: []
})

export const getDefaultSequence = (): SoundGroupSequenceEditableFields => ({
  icon: {
    type: 'svg',
    foregroundColor: ColorOptions.white,
    name: 'moon'
  },
  name: '',
  sequence: [],
  tags: []
})

function filterToVariants(variants: SoundVariants[] | undefined): (group: ISoundGroup) => boolean {
  return (group) => {
    if (variants === undefined || variants.length === 0) {
      return true
    }

    return variants.includes(group.variant)
  }
}

function sortGroups(
  order: SortOrder,
  type: SortType | undefined
): (a: ISoundGroup, b: ISoundGroup) => number {
  const moreVal = order === 'asc' ? -1 : 1
  const lessVal = order === 'asc' ? 1 : -1

  switch (type) {
    case 'name': {
      return (a, b) => {
        const upperA = a.name.toUpperCase()
        const upperB = b.name.toUpperCase()
        if (upperA > upperB) {
          return lessVal
        }
        if (upperA < upperB) {
          return moreVal
        }
        return 0
      }
    }
    default: {
      return () => 0
    }
  }
}

function searchGroups(searchText: string) {
  const allGroups = window.audio.Groups.GetAll().groups

  if (searchText === '') {
    return allGroups
  }

  const fuseSearch = new fuse(allGroups, {
    keys: ['name', 'tags', 'variant'],
    threshold: 0.1
  })

  const results = fuseSearch.search(searchText)

  results.reduce((acc, curr) => {
    if (acc.has(curr.item.id)) {
      console.error('duplicate group')
    }

    acc.set(curr.item.id, curr.item)

    return acc
  }, new Map<string, ISoundGroup>())

  const soughtGroups = results.map((r) => r.item)
  return soughtGroups
}
