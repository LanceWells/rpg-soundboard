import { useAudioStore } from '@renderer/stores/audioStore'
import EffectModal from './effectModal'

export const NewEffectModalId = 'new-effect-modal'

export default function NewEffectModal() {
  const addGroup = useAudioStore((state) => state.addGroup)

  return (
    <EffectModal
      modalTitle="New Effect"
      actionName="Create"
      id={NewEffectModalId}
      handleSubmit={addGroup}
    />
  )
}
