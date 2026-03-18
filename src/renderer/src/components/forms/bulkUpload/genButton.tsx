import { GroupIcon } from '@renderer/components/icon/base'
import { SoundGroupSourceEditableFields } from 'src/apis/audio/types/items'

export function GenButtonLoading() {
  return <div className="loading-spinner"></div>
}

export type GenButtonLoadedProps = {
  button: SoundGroupSourceEditableFields
}

export function GenButtonLoaded(props: GenButtonLoadedProps) {
  const { button } = props

  return (
    <div
      className={`
        grid
        items-center
        [grid-template-areas:"icon_name"_"icon_sounds"]
      `}
    >
      <div className="[grid-area:icon]">
        <GroupIcon icon={button.icon} />
      </div>
      <span className="[grid-area:name]">{button.name}</span>
      <span className="[grid-area:sounds]">{button.effects.length} Effects</span>
    </div>
  )
}
