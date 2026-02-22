import { CreateSoundForm } from '@renderer/componentsV2/forms/sound/create'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sound/create')({
  component: RouteComponent
})

function RouteComponent() {
  return <CreateSoundForm />
}
