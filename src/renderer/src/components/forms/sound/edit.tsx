import { useAudioStore } from '@renderer/stores/audio/audioStore'
import { CreateEditSoundForm } from './createEdit'
import { FormInput } from './types'
import { copyGroupForRequest } from './util/default'
import { GroupID } from 'src/apis/audio/types/groups'
import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'

export type EditSoundFormProps = {
  id: GroupID
}

export function EditSoundForm(props: EditSoundFormProps) {
  const { id } = props

  const updateGroup = useAudioStore((store) => store.updateGroup)
  const updateSequence = useAudioStore((store) => store.updateSequencePartial)
  const getGroup = useAudioStore((store) => store.getGroup)
  const nav = useNavigate()

  const groupBeforeEdits = useMemo(() => {
    const group = getGroup(id)
    return copyGroupForRequest(group)
  }, [id])

  const onSubmit = (data: FormInput) => {
    if (data.type === 'group') {
      updateGroup({
        groupID: id,
        ...data.request
      })
    } else if (data.type === 'sequence') {
      updateSequence(id, data.request)
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
      <h1 className="text-2xl text-center mb-4">Edit {groupBeforeEdits.request.name}</h1>
      <CreateEditSoundForm onSubmit={onSubmit} defaultValues={groupBeforeEdits} />
    </div>
  )
}
