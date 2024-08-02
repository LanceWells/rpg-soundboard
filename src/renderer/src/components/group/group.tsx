import { SoundGroup } from 'src/apis/audio/interface'
import { IconEffect } from '../effect/icon-effect'

export type GroupProps = {
  group: SoundGroup
}

export default function Group(props: GroupProps) {
  const { group } = props

  return (
    <div className="hover:brightness-125 hover:shadow-md transition-all">
      <IconEffect icon={group.icon} />
    </div>
  )
}
