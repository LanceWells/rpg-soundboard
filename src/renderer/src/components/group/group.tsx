import { ISoundGroup, SoundGroupSequence, SoundGroupSource } from 'src/apis/audio/types/items'
import GroupSource from './groupSource'
import GroupSequence from './groupSequence'
import { isSequenceGroup, isSourceGroup } from '@renderer/utils/typePredicates'
import { CSSProperties, memo } from 'react'

export type GroupProps = {
  group: ISoundGroup
  beingDragged?: boolean
  style: CSSProperties
}

export default function Group(props: GroupProps) {
  const { group } = props

  if (isSourceGroup(group)) {
    return <GroupSource {...props} group={group as SoundGroupSource} />
  }

  if (isSequenceGroup(group)) {
    return <GroupSequence {...props} group={group as SoundGroupSequence} />
  }

  return <></>
}

export const MemoizedGroup = memo(Group)
