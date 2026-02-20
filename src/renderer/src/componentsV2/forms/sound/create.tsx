import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { CreateEditSoundForm } from './createEdit'
import { FormInput } from './types'
import { newDefaultGroupRequest } from './util/default'
import { useNavigate } from '@tanstack/react-router'

export function CreateSoundForm() {
  const addGroup = useAudioStore((store) => store.addGroup)
  const addSequence = useAudioStore((store) => store.addSequence)
  const nav = useNavigate()

  const onSubmit = (data: FormInput) => {
    if (data.type === 'group') {
      addGroup(data.request)
    } else if (data.type === 'sequence') {
      addSequence(data.request)
    }
    nav({
      to: '/'
    })
  }

  return (
    <div
      className={`
        p-8
        h-dvh
        max-h-dvh
        overflow-y-scroll
        relative
      `}
    >
      <h1 className="text-2xl text-center mb-4">Create Button</h1>
      <CreateEditSoundForm onSubmit={onSubmit} defaultValues={newDefaultGroupRequest()} />
    </div>
  )
}
