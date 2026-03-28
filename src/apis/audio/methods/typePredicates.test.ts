import { describe, it, expect } from 'vitest'
import { isSourceGroup, isSequenceGroup } from './typePredicates'
import type { SoundGroupSource, SoundGroupSequence } from '../types/items'

const baseIcon = { type: 'svg' as const, name: 'moon', foregroundColor: '#ffffff' }

const sourceGroup: SoundGroupSource = {
  type: 'source',
  id: 'grp-00000000-0000-0000-0000-000000000001' as any,
  name: 'Source Group',
  icon: baseIcon,
  variant: 'Default',
  tags: [],
  effects: []
}

const sequenceGroup: SoundGroupSequence = {
  type: 'sequence',
  id: 'grp-00000000-0000-0000-0000-000000000002' as any,
  name: 'Sequence Group',
  icon: baseIcon,
  variant: 'Sequence',
  tags: [],
  sequence: []
}

describe('isSourceGroup', () => {
  it('returns true for a source group', () => {
    expect(isSourceGroup(sourceGroup)).toBe(true)
  })

  it('returns false for a sequence group', () => {
    expect(isSourceGroup(sequenceGroup)).toBe(false)
  })
})

describe('isSequenceGroup', () => {
  it('returns true for a sequence group', () => {
    expect(isSequenceGroup(sequenceGroup)).toBe(true)
  })

  it('returns false for a source group', () => {
    expect(isSequenceGroup(sourceGroup)).toBe(false)
  })
})
