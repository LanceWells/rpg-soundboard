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
    <div className="flex">
      <GroupIcon icon={button.icon} />
      {button.name}
    </div>
  )
}
