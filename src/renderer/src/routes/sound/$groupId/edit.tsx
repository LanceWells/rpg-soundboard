import { EditSoundForm } from '@renderer/components/forms/sound/edit'
import { createFileRoute } from '@tanstack/react-router'
import { GroupID } from 'src/apis/audio/types/groups'

/**
 * TanStack Router route definition for the edit sound page, parameterized by groupId.
 */
export const Route = createFileRoute('/sound/$groupId/edit')({
  component: RouteComponent
})

/**
 * Page component that reads the groupId route param and renders the edit sound form.
 */
function RouteComponent() {
  const { groupId } = Route.useParams()

  return <EditSoundForm id={groupId as GroupID} />
}
