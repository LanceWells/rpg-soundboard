import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { CreateEditSoundForm } from './createEdit'
import { FormInput } from './types'
import { containerToRequest as copyGroupForRequest, newDefaultGroupRequest } from './util/default'

export function CreateSoundForm() {
  const addGroup = useAudioStore((store) => store.updateGroup)
  const addSequence = useAudioStore((store) => store.updateSequencePartial)
  const groupBeingEditedId = useAudioStore((store) => store.groupBeingEditedID)

  const defaultGroup = useAudioStore((store) => {
    const groupBeingEditedId = store.groupBeingEditedID
    if (groupBeingEditedId !== null) {
      const groupBeingEdited = store.getGroup(groupBeingEditedId)
      return copyGroupForRequest(groupBeingEdited)
    }

    return newDefaultGroupRequest()
  })

  const onSubmit = (data: FormInput) => {
    if (groupBeingEditedId === null) {
      console.error('Trying to edit without a group ID')
      return
    }

    if (data.type === 'group') {
      addGroup({
        groupID: groupBeingEditedId,
        ...data.request
      })
    } else if (data.type === 'sequence') {
      addSequence(groupBeingEditedId, data.request)
    }
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
      <h1 className="text-2xl text-center mb-4">Edit {defaultGroup.request.name}</h1>
      <CreateEditSoundForm onSubmit={onSubmit} defaultValues={defaultGroup} />
      <button>Delete</button>
    </div>
  )
}
