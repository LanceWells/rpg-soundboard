import { describe, it, expect } from 'vitest'
import { create } from 'zustand'
import { createEditingSlice, EditingSlice } from '../editingSliceV3'
import type { GroupID } from 'src/apis/audio/types/groups'

function makeGroupId(n: number): GroupID {
  return `grp-${n.toString().padStart(3, '0')}-000-000-000-000` as GroupID
}

function createStore() {
  return create<EditingSlice>()(createEditingSlice)
}

describe('EditingSlice', () => {
  it('initializes with groupBeingDeletedID = null', () => {
    const store = createStore()
    expect(store.getState().groupBeingDeletedID).toBeNull()
  })

  it('setGroupBeingDeletedID sets the ID', () => {
    const store = createStore()
    const id = makeGroupId(1)
    store.getState().setGroupBeingDeletedID(id)
    expect(store.getState().groupBeingDeletedID).toBe(id)
  })

  it('setGroupBeingDeletedID can be called multiple times, updating each time', () => {
    const store = createStore()
    const id1 = makeGroupId(1)
    const id2 = makeGroupId(2)

    store.getState().setGroupBeingDeletedID(id1)
    expect(store.getState().groupBeingDeletedID).toBe(id1)

    store.getState().setGroupBeingDeletedID(id2)
    expect(store.getState().groupBeingDeletedID).toBe(id2)
  })

  it('each store instance is independent', () => {
    const storeA = createStore()
    const storeB = createStore()

    storeA.getState().setGroupBeingDeletedID(makeGroupId(1))
    expect(storeB.getState().groupBeingDeletedID).toBeNull()
  })
})
