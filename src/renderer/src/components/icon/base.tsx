import { memo } from 'react'
import { SoundIcon } from 'src/apis/audio/types/items'
import { GroupSvgIcon } from './svg'

/**
 * Props for {@link GroupIcon}.
 */
export type GroupIconProps = {
  icon: SoundIcon
}

/**
 * Renders the appropriate icon variant for a sound group.
 */
export function GroupIcon(props: GroupIconProps) {
  const { icon } = props
  if (icon.type === 'svg') {
    return <GroupSvgIcon icon={icon} />
  }

  return null
}

/**
 * Memoized version of {@link GroupIcon} to avoid unnecessary re-renders.
 */
export const MemoizedGroupIcon = memo(GroupIcon)
