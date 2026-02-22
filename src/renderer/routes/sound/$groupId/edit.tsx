import { EditSoundForm } from '@renderer/componentsV2/forms/sound/edit'
import { createFileRoute } from '@tanstack/react-router'
import { GroupID } from 'src/apis/audio/types/groups'

export const Route = createFileRoute('/sound/$groupId/edit')({
  component: RouteComponent
})

function RouteComponent() {
  const { groupId } = Route.useParams()

  return <EditSoundForm id={groupId as GroupID} />
}
