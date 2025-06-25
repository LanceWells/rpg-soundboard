import { BoardID } from 'src/apis/audio/types/boards'
import {
  ISoundGroup,
  SoundGroupReference,
  SoundGroupSequence,
  SoundGroupSource
} from 'src/apis/audio/types/items'
import GroupSource from './groupSource'
import GroupReference from './groupReference'
import GroupSequence from './groupSequence'
import { isReferenceGroup, isSequenceGroup, isSourceGroup } from '@renderer/utils/typePredicates'
import { memo } from 'react'

export type GroupProps = {
  group: ISoundGroup
  boardID: BoardID
  beingDragged?: boolean
}

export default function Group(props: GroupProps) {
  const { group } = props

  if (isSourceGroup(group)) {
    return <GroupSource {...props} group={group as SoundGroupSource} />
  }

  if (isSequenceGroup(group)) {
    return <GroupSequence {...props} group={group as SoundGroupSequence} />
  }

  if (isReferenceGroup(group)) {
    return <GroupReference {...props} group={group as SoundGroupReference} />
  }

  return <></>
}

export const MemoizedGroup = memo(Group)
