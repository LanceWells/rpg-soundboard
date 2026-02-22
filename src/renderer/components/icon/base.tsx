import { memo } from 'react'
import { SoundIcon } from 'src/apis/audio/types/items'
import { GroupSvgIcon } from './svg'

export type GroupIconProps = {
  icon: SoundIcon
}

export function GroupIcon(props: GroupIconProps) {
  const { icon } = props
  if (icon.type === 'svg') {
    return <GroupSvgIcon icon={icon} />
  }

  return null
}

export const MemoizedGroupIcon = memo(GroupIcon)
