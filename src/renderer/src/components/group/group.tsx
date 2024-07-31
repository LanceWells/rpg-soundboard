import { SoundGroup } from 'src/apis/audio/interface'

export type GroupProps = {
  group: SoundGroup
}

export default function Group(props: GroupProps) {
  const { group } = props

  return (
    <div className="bg-slate-200 rounded-sm">
      <h3>{group.name}</h3>
    </div>
  )
}
