import { SoundGroup } from 'src/apis/audio/interface'

export type GroupProps = {
  group: SoundGroup
}

export default function Group(props: GroupProps) {
  const { group } = props

  return (
    <button className="bg-slate-200 rounded-md p-4 text-center btn shadow-sm">
      <h3>{group.name}</h3>
    </button>
  )
}
