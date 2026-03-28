import { VariantTag } from '@renderer/components/groups/variantTag'
import { GroupIcon } from '@renderer/components/icon/base'
import { SoundGroupSourceEditableFields } from 'src/apis/audio/types/items'

/**
 * Placeholder spinner shown while a bulk upload button is being generated.
 */
export function GenButtonLoading() {
  return <div className="loading-spinner"></div>
}

/**
 * Props for the GenButtonLoaded component.
 */
export type GenButtonLoadedProps = {
  button: SoundGroupSourceEditableFields
}

/**
 * Renders a preview card for a fully loaded generated button, showing its icon, name, and effect count.
 */
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
      <div className="relative [grid-area:icon]">
        <div className="relative z-0">
          <GroupIcon icon={button.icon} />
        </div>
        <div className="absolute top-0 right-0 -translate-x-4 z-10">
          <VariantTag variant={button.variant} />
        </div>
      </div>
      <span className="[grid-area:name]">{button.name}</span>
      <span className="[grid-area:sounds]">{button.effects.length} Effects</span>
    </div>
  )
}
