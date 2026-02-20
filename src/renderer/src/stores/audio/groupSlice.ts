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
import { ColorOptions } from '@renderer/components/icon/colorPicker'
import { isSequenceGroup, isSourceGroup } from '@renderer/utils/typePredicates'
import { EditingSliceV2 } from './editingSliceV2'
import fuse from 'fuse.js'

export interface GroupSlice {
  groups: ISoundGroup[]
  /**
   * The set of IDs for groups that are actively playing a sound effect.
   */
  playingGroups: GroupID[]
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
  searchForTags: (searchText: string) => void
  soughtGroups: ISoundGroup[]
  soughtTags: string[]
}

export const createGroupSlice: StateCreator<GroupSlice & EditingSliceV2, [], [], GroupSlice> = (
  set,
  get
) => ({
  groups: window.audio.Groups.GetAll().groups,
  addGroup(req) {
    const newGroup = window.audio.Groups.Create(req)
    set({
      groups: window.audio.Groups.GetAll().groups
    })

    return newGroup
  },
  addSequence(req) {
    const newGroup = window.audio.Groups.CreateSequence(req)
    const newGroups = window.audio.Groups.GetAll().groups

    set({
      groups: newGroups
    })

    get().updateEditingSequenceV2({})

    return newGroup
  },
  deleteGroup(id) {
    window.audio.Groups.Delete({
      groupID: id
    })

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

    set({
      groups: window.audio.Groups.GetAll().groups
    })
  },
  editingGroup: null,
  editingGroupID: undefined,
  playingGroups: [],
  soughtGroups: [],
  searchForGroups(searchText) {
    const allGroups = window.audio.Groups.GetAll().groups

    if (searchText === '') {
      set({
        soughtGroups: allGroups
      })
      return
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

    set({
      soughtGroups
    })
  },
  searchForTags(searchText) {
    if (searchText.trim() === '') {
      return
    }

    const allTags = new Set(window.audio.Groups.GetAll().groups.flatMap<string>((g) => g.tags))

    const fuseSearch = new fuse([...allTags.values()], {
      threshold: 0.2
    })

    const results = fuseSearch.search(searchText)

    const soughtTags = results.map((r) => r.item)

    set({
      soughtTags
    })
  },
  soughtTags: []
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
  type: 'sequence',
  icon: {
    type: 'svg',
    foregroundColor: ColorOptions.white,
    name: 'moon'
  },
  name: '',
  sequence: [],
  variant: 'Sequence',
  tags: []
})
